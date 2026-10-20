import { Injectable } from '@nestjs/common';
import { BASE_ELO, ICareerUserResponse } from '@tournament-app/types';
import { EloHelper } from 'src/base/static/eloHelper';
import { UserDrizzleRepository } from 'src/users/user.repository';
import {
  CareerDrizzleRepository,
  MatchupRatingRoster,
} from './career.repository';

export interface RatingChange {
  userId: number;
  elo: number;
}

export interface AppliedRatingChange extends RatingChange {
  delta: number;
}

/**
 * New ratings for a finished one-on-one matchup. Each player is rated against the
 * opposing roster's average, with a K-factor from their own match count. A matchup
 * without a winner counts as a draw. Fake players are left out.
 */
export function computeRatingChanges(
  rosters: MatchupRatingRoster[],
  ratings: Map<number, number>,
  matchesPlayed: Map<number, number>,
): RatingChange[] {
  if (rosters.length !== 2) {
    return [];
  }

  const realPlayers = rosters.map((r) => r.players.filter((p) => !p.isFake));

  if (realPlayers.some((players) => players.length === 0)) {
    return [];
  }

  const averages = realPlayers.map(
    (players) =>
      players.reduce((sum, p) => sum + (ratings.get(p.userId) ?? BASE_ELO), 0) /
      players.length,
  );

  const isDraw =
    rosters.every((r) => r.isWinner) || rosters.every((r) => !r.isWinner);

  return rosters.flatMap((rosterEntry, index) => {
    const actualScore = isDraw ? 0.5 : rosterEntry.isWinner ? 1 : 0;
    const opponentAverage = averages[1 - index];

    return realPlayers[index].map((player) => ({
      userId: player.userId,
      elo: EloHelper.updateRating(
        ratings.get(player.userId) ?? BASE_ELO,
        opponentAverage,
        actualScore,
        matchesPlayed.get(player.userId) ?? 0,
      ),
    }));
  });
}

@Injectable()
export class CareerService {
  constructor(
    private readonly userRepository: UserDrizzleRepository,
    private readonly careerRepository: CareerDrizzleRepository,
  ) {}

  async getMultipleCareers(
    userIds: number[],
    categoryId,
  ): Promise<ICareerUserResponse[]> {
    return await this.userRepository.getMultipleCareers(userIds, categoryId);
  }

  // Updates the players' ratings after a result is recorded; only ranked tournaments count
  async applyMatchResult(matchupId: number): Promise<AppliedRatingChange[]> {
    const context =
      await this.careerRepository.getMatchupRatingContext(matchupId);

    if (!context?.isRanked) {
      return [];
    }

    const userIds = context.rosters.flatMap((r) =>
      r.players.filter((p) => !p.isFake).map((p) => p.userId),
    );

    if (!userIds.length) {
      return [];
    }

    const [ratings, counts] = await Promise.all([
      this.careerRepository.getRatings(userIds, context.categoryId),
      this.careerRepository.getFinishedMatchCounts(userIds, context.categoryId),
    ]);

    // The counts already include this matchup, which is finished by now
    const matchesPlayed = new Map(
      counts.map((c) => [c.userId, Math.max(0, Number(c.matches) - 1)]),
    );

    const currentRatings = new Map(
      ratings.map((r) => [r.userId, r.elo ?? BASE_ELO]),
    );

    const changes = computeRatingChanges(
      context.rosters,
      currentRatings,
      matchesPlayed,
    ).map((change) => ({
      ...change,
      delta: change.elo - (currentRatings.get(change.userId) ?? BASE_ELO),
    }));

    await this.careerRepository.saveRatings(
      matchupId,
      changes,
      context.categoryId,
    );

    return changes;
  }

  // Undoes what applyMatchResult did for a matchup, before its result is corrected or deleted
  async revertMatchResult(matchupId: number) {
    return this.careerRepository.revertRatings(matchupId);
  }
}
