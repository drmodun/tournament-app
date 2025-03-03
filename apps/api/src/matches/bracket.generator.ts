import { Injectable } from '@nestjs/common';
import { db } from '../db/db';
import { matchup, rosterToMatchup, stageRound } from '../db/schema';
import { RosterDrizzleRepository } from '../roster/roster.repository';

export interface IInitialRosterOptions {
  isShuffled: boolean;
}

@Injectable()
export class BracketGenerator {
  constructor(private readonly rosterRepository: RosterDrizzleRepository) {}

  async rostersSortedByElo(stageId: number) {
    const getAllRosters = await this.rosterRepository.getForStage(stageId);

    // Get all users with specific elo for the tournament
    const mappedRostersWithElo = getAllRosters.map((roster) => {
      return {
        id: roster.id,
        players: roster.players.map((player) => {
          return {
            id: player.user.id,
            elo: player.career?.filter(
              (c) =>
                c.categoryId === roster.participation.tournament.categoryId,
            )?.[0]?.elo,
          };
        }),
      };
    });

    // Calculate average and sort according to elo
    const rosterWithEloAverage = mappedRostersWithElo.map((roster) => {
      return {
        id: roster.id,
        elo:
          roster.players.reduce((acc, player) => acc + player.elo || 1000, 0) /
          roster.players.length,
      };
    });

    // Sort the rosters according to elo
    const sortedRosters = rosterWithEloAverage.sort((a, b) => b.elo - a.elo);

    return sortedRosters;
  }

  createOptimalSeeding(teamCount: number, bracketSize: number): number[] {
    if (bracketSize < teamCount) {
      throw new Error(
        'Bracket size must be greater than or equal to team count',
      );
    }
    if ((bracketSize & (bracketSize - 1)) !== 0) {
      throw new Error('Bracket size must be a power of 2');
    }

    const seeds: number[] = [];
    for (let i = 0; i < bracketSize; i++) {
      seeds.push(i);
    }

    // Reorder seeds to create optimal matchups (1 vs 16, 8 vs 9, etc.)
    const optimizedSeeds: number[] = [];

    function assignSeeds(start: number, end: number, seedsLeft: number) {
      if (seedsLeft === 0) return;
      if (seedsLeft === 1) {
        optimizedSeeds.push(start);
        return;
      }

      optimizedSeeds.push(start);
      optimizedSeeds.push(end);

      assignSeeds(start + 1, end - 1, seedsLeft - 2);
    }

    assignSeeds(0, bracketSize - 1, bracketSize);
    return optimizedSeeds;
  }

  // --- Example Usage (Self-Contained) ---

  // Helper function to find the next power of 2
  nextPowerOf2(n: number): number {
    let power = 1;
    while (power < n) {
      power *= 2;
    }
    return power;
  }

  fischerYatesShuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async generateInitialRosters(
    stageId: number,
    options?: IInitialRosterOptions,
  ) {
    const rosters = options?.isShuffled
      ? this.fischerYatesShuffle(await this.rostersSortedByElo(stageId))
      : await this.rostersSortedByElo(stageId);

    const bracketSize = this.nextPowerOf2(rosters.length);
    const roundAmount = Math.log2(bracketSize);

    const byeMatchesToCreate = bracketSize - rosters.length;

    if (roundAmount < 1) {
      return;
    }

    const rounds = await db
      .insert(stageRound)
      .values(
        Array.from({ length: roundAmount }, (_, i) => ({
          stageId,
          roundNumber: i + 1,
        })),
      )
      .returning();

    const sortedRounds = rounds.sort((b, a) => a.roundNumber - b.roundNumber); // Sort from highest to lowest

    const roundsToCreate = sortedRounds.slice(1, roundAmount);

    let lastRoundMatches = await db
      .insert(matchup)
      .values([
        {
          stageId,
          roundId: sortedRounds[0].id, // The final round is obviously the last one
          matchupType: 'one_vs_one',
          startDate: new Date(
            new Date().getTime() +
              (sortedRounds.length - 1) * 1000 * 60 * 60 * 24,
          ),
        },
      ])
      .returning({
        id: matchup.id,
        startDate: matchup.startDate,
        parentMatchupId: matchup.parentMatchupId,
      });
    // Create the final match

    for (const round of roundsToCreate) {
      // Create all other matches

      const matches = await db
        .insert(matchup)
        .values(
          lastRoundMatches.map((match) => ({
            stageId,
            roundId: round.id,
            parentMatchupId: match.id,
            matchupType: 'one_vs_one',
            startDate: new Date(
              match.startDate.getTime() -
                (round.roundNumber - 1) * 1000 * 60 * 60 * 24,
            ),
          })),
        )
        .returning({
          id: matchup.id,
          startDate: matchup.startDate,
          parentMatchupId: matchup.parentMatchupId,
        });

      lastRoundMatches = matches;
    }

    const byeMatches = lastRoundMatches.slice(0, byeMatchesToCreate);
    const teamsForBye = rosters.slice(0, byeMatchesToCreate);

    byeMatches.length > 0 &&
      (await db.insert(rosterToMatchup).values(
        byeMatches
          .map((match, i) => {
            return [
              {
                matchupId: match.id,
                rosterId: teamsForBye[i].id,
                isWinner: true, // Bye means the match is automatically won by the team
              },
              {
                matchupId: match.parentMatchupId,
                rosterId: teamsForBye[i].id, // Automatically progress the team to the next round
              },
            ];
          })
          .flat(),
      ));

    const others = byeMatches.length
      ? lastRoundMatches.slice(byeMatchesToCreate)
      : lastRoundMatches;
    // Get the optimal seeding for the remaining teams
    const remainingTeams = rosters.slice(byeMatchesToCreate);
    const seedingOrder = this.createOptimalSeeding(
      remainingTeams.length,
      byeMatches.length ? others.length * 2 : bracketSize,
    );

    // Map the seeding order to the actual roster IDs
    const seededTeams = seedingOrder.map(
      (seedPosition) => remainingTeams[seedPosition - 1],
    );

    // Assign teams to matches according to the seeding
    const matchAssignments = [];
    for (let i = 0; i < others.length; i++) {
      // For each match, get the two teams according to the seeding
      const team1Index = i * 2;
      const team2Index = i * 2 + 1;

      if (team1Index < seededTeams.length) {
        matchAssignments.push({
          matchupId: others[i].id,
          rosterId: seededTeams[team1Index]?.id,
        });
      }

      if (team2Index < seededTeams.length) {
        matchAssignments.push({
          matchupId: others[i].id,
          rosterId: seededTeams[team2Index]?.id,
        });
      }
    }

    // Insert the match assignments into the database
    if (matchAssignments.length > 0) {
      await db.insert(rosterToMatchup).values(matchAssignments);
    }
  }
}
