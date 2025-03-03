import { Injectable } from '@nestjs/common';
import { db } from '../db/db';
import { matchup, rosterToMatchup, stageRound } from '../db/schema';
import { RosterDrizzleRepository } from '../roster/roster.repository';

export interface IInitialRosterOptions {
  isShuffled: boolean;
  startDate?: Date;
  daysBetweenRounds?: number;
}

interface RosterAssignment {
  rosterId: number;
  matchupId: number;
  isWinner: boolean;
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
            elo:
              player.career?.filter(
                (c) =>
                  c.categoryId === roster.participation.tournament.categoryId,
              )?.[0]?.elo ?? 1000, // Default to 1000 if no ELO found
          };
        }),
      };
    });

    // Calculate average and sort according to elo
    const rosterWithEloAverage = mappedRostersWithElo.map((roster) => ({
      id: roster.id,
      elo:
        roster.players.reduce((acc, player) => acc + player.elo, 0) /
        roster.players.length,
    }));

    // Sort the rosters according to elo (highest to lowest)
    return rosterWithEloAverage.sort((a, b) => b.elo - a.elo);
  }

  private nextPowerOf2(n: number): number {
    return Math.pow(2, Math.ceil(Math.log2(n)));
  }

  private fischerYatesShuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private createOptimalSeeding(teamCount: number): number[] {
    const seeds: number[] = [];
    const bracketSize = this.nextPowerOf2(teamCount);

    // Create standard tournament seeding (1 vs 16, 8 vs 9, etc.)
    for (let i = 0; i < bracketSize / 2; i++) {
      const topSeed = i;
      const bottomSeed = bracketSize - 1 - i;

      if (topSeed < teamCount) seeds.push(topSeed);
      if (bottomSeed < teamCount && bottomSeed !== topSeed)
        seeds.push(bottomSeed);
    }

    return seeds;
  }

  private calculateMatchDates(
    roundCount: number,
    options: { startDate?: Date; daysBetweenRounds?: number } = {},
  ): Date[] {
    const baseDate = options.startDate || new Date();
    const daySpacing = (options.daysBetweenRounds || 1) * 24 * 60 * 60 * 1000;

    return Array.from(
      { length: roundCount },
      (_, i) => new Date(baseDate.getTime() + i * daySpacing),
    );
  }

  async generateInitialRosters(
    stageId: number,
    options: IInitialRosterOptions = { isShuffled: false },
  ) {
    // Get and optionally shuffle rosters
    let rosters = await this.rostersSortedByElo(stageId);
    if (!rosters.length) return null;
    if (options.isShuffled) {
      rosters = this.fischerYatesShuffle(rosters);
    }

    // Calculate bracket structure
    const bracketSize = this.nextPowerOf2(rosters.length);
    const roundCount = Math.log2(bracketSize);

    // Create rounds
    const roundDates = this.calculateMatchDates(roundCount, {
      startDate: options.startDate,
      daysBetweenRounds: options.daysBetweenRounds,
    });

    const rounds = await db
      .insert(stageRound)
      .values(
        Array.from({ length: roundCount }, (_, i) => ({
          stageId,
          roundNumber: i + 1, // Round 1 is first round
        })),
      )
      .returning();

    // Sort rounds from first round to finals
    const sortedRounds = rounds.sort((a, b) => a.roundNumber - b.roundNumber);

    // Generate optimal seeding
    const seeding = this.createOptimalSeeding(rosters.length);
    const seededRosters = seeding.map((index) => rosters[index]);

    // Create matches and assignments
    const matchesByRound = new Map<number, (typeof matchup.$inferSelect)[]>();
    const rosterAssignments: RosterAssignment[] = [];

    // Create first round matches
    const firstRoundMatchCount = Math.ceil(seededRosters.length / 2);
    const firstRoundMatches = await db
      .insert(matchup)
      .values(
        Array.from({ length: firstRoundMatchCount }, (_, i) => ({
          stageId,
          roundId: sortedRounds[0].id,
          matchupType: 'one_vs_one',
          startDate: roundDates[0],
        })),
      )
      .returning();

    matchesByRound.set(sortedRounds[0].id, firstRoundMatches);

    // Assign rosters to first round matches
    for (let i = 0; i < firstRoundMatches.length; i++) {
      const match = firstRoundMatches[i];
      const roster1 = seededRosters[i * 2];
      const roster2 = seededRosters[i * 2 + 1];

      if (roster1) {
        rosterAssignments.push({
          rosterId: roster1.id,
          matchupId: match.id,
          isWinner: !roster2, // Win by default if no opponent
        });
      }

      if (roster2) {
        rosterAssignments.push({
          rosterId: roster2.id,
          matchupId: match.id,
          isWinner: false,
        });
      }
    }

    // Create subsequent round matches
    for (let i = 1; i < sortedRounds.length; i++) {
      const round = sortedRounds[i];
      const previousRoundMatches = matchesByRound.get(sortedRounds[i - 1].id)!;
      const currentRoundMatchCount = Math.ceil(previousRoundMatches.length / 2);

      const roundMatches = await db
        .insert(matchup)
        .values(
          Array.from({ length: currentRoundMatchCount }, (_, j) => ({
            stageId,
            roundId: round.id,
            parentMatchupId: previousRoundMatches[j * 2]?.id,
            matchupType: 'one_vs_one',
            startDate: roundDates[i],
          })),
        )
        .returning();

      matchesByRound.set(round.id, roundMatches);

      // Handle automatic advancement for bye matches
      for (let j = 0; j < previousRoundMatches.length; j += 2) {
        const match1 = previousRoundMatches[j];
        const match2 = previousRoundMatches[j + 1];
        const nextMatch = roundMatches[Math.floor(j / 2)];

        // If one match is missing (bye), advance the winner automatically
        if (match1 && !match2) {
          const winningRoster = rosterAssignments.find(
            (ra) => ra.matchupId === match1.id && ra.isWinner,
          );
          if (winningRoster) {
            rosterAssignments.push({
              rosterId: winningRoster.rosterId,
              matchupId: nextMatch.id,
              isWinner: false,
            });
          }
        }
      }
    }

    // Insert all roster assignments
    if (rosterAssignments.length > 0) {
      await db.insert(rosterToMatchup).values(rosterAssignments);
    }

    return {
      rounds: sortedRounds,
      matches: Array.from(matchesByRound.values()).flat(),
      assignments: rosterAssignments,
    };
  }
}
