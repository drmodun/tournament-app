import { Injectable } from '@nestjs/common';
import { db } from 'src/db/db';
import { matchup, roster, stageRound } from 'src/db/schema';
import { RosterDrizzleRepository } from 'src/roster/roster.repository';

export interface IInitialRosterOptions {
  isSeeded: boolean;
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
            elo: player.career.filter(
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

  async fischerYatesShuffle(array: any[]) {
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
    const rosters = await this.rostersSortedByElo(stageId);

    const bracketSize = this.nextPowerOf2(rosters.length);
    const roundAmount = Math.log2(bracketSize);

    const byeMatchesToCreate = bracketSize - rosters.length;

    const rounds = await db
      .insert(stageRound)
      .values(
        Array.from({ length: roundAmount }, (_, i) => ({
          stageId,
          roundNumber: i + 1,
        })),
      )
      .returning();

    const sortedRounds = rounds.sort((a, b) => a.roundNumber - b.roundNumber);
  }
}
