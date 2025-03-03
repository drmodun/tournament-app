import { Injectable } from '@nestjs/common';
import { db } from 'src/db/db';
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

  async generateInitialRosters(stageId: number) {
    const rosters = await this.rostersSortedByElo(stageId);
  }
}
