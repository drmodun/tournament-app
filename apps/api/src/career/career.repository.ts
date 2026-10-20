import { Injectable } from '@nestjs/common';
import { and, countDistinct, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../db/db';
import {
  categoryCareer,
  matchup,
  ratingChange,
  participation,
  roster,
  rosterToMatchup,
  stage,
  tournament,
  user,
  userToRoster,
} from '../db/schema';

export interface MatchupRatingRoster {
  rosterId: number;
  isWinner: boolean;
  players: { userId: number; isFake: boolean }[];
}

export interface MatchupRatingContext {
  categoryId: number;
  isRanked: boolean;
  rosters: MatchupRatingRoster[];
}

@Injectable()
export class CareerDrizzleRepository {
  // The tournament settings and line-ups a matchup's rating update depends on
  async getMatchupRatingContext(
    matchupId: number,
  ): Promise<MatchupRatingContext | null> {
    const rows = await db
      .select({
        categoryId: tournament.categoryId,
        isRanked: tournament.isRanked,
        rosterId: rosterToMatchup.rosterId,
        isWinner: rosterToMatchup.isWinner,
        userId: userToRoster.userId,
        isFake: user.isFake,
      })
      .from(matchup)
      .innerJoin(stage, eq(matchup.stageId, stage.id))
      .innerJoin(tournament, eq(stage.tournamentId, tournament.id))
      .innerJoin(rosterToMatchup, eq(rosterToMatchup.matchupId, matchup.id))
      .leftJoin(
        userToRoster,
        eq(userToRoster.rosterId, rosterToMatchup.rosterId),
      )
      .leftJoin(user, eq(user.id, userToRoster.userId))
      .where(eq(matchup.id, matchupId));

    if (!rows.length) {
      return null;
    }

    const rosters = new Map<number, MatchupRatingRoster>();

    for (const row of rows) {
      const entry = rosters.get(row.rosterId) ?? {
        rosterId: row.rosterId,
        isWinner: !!row.isWinner,
        players: [],
      };

      if (row.userId) {
        entry.players.push({ userId: row.userId, isFake: !!row.isFake });
      }

      rosters.set(row.rosterId, entry);
    }

    return {
      categoryId: rows[0].categoryId,
      isRanked: !!rows[0].isRanked,
      rosters: [...rosters.values()],
    };
  }

  async getRatings(userIds: number[], categoryId: number) {
    return db
      .select({ userId: categoryCareer.userId, elo: categoryCareer.elo })
      .from(categoryCareer)
      .where(
        and(
          inArray(categoryCareer.userId, userIds),
          eq(categoryCareer.categoryId, categoryId),
        ),
      );
  }

  // Finished matches each player has in tournaments of the category, used to pick the K-factor
  async getFinishedMatchCounts(userIds: number[], categoryId: number) {
    return db
      .select({
        userId: userToRoster.userId,
        matches: countDistinct(matchup.id),
      })
      .from(userToRoster)
      .innerJoin(roster, eq(roster.id, userToRoster.rosterId))
      .innerJoin(participation, eq(participation.id, roster.participationId))
      .innerJoin(tournament, eq(tournament.id, participation.tournamentId))
      .innerJoin(rosterToMatchup, eq(rosterToMatchup.rosterId, roster.id))
      .innerJoin(matchup, eq(matchup.id, rosterToMatchup.matchupId))
      .where(
        and(
          inArray(userToRoster.userId, userIds),
          eq(tournament.categoryId, categoryId),
          eq(matchup.isFinished, true),
        ),
      )
      .groupBy(userToRoster.userId);
  }

  // Saves the new ratings and records how much each one moved, for a later revert
  async saveRatings(
    matchupId: number,
    ratings: { userId: number; elo: number; delta: number }[],
    categoryId: number,
  ) {
    if (!ratings.length) {
      return;
    }

    await db.transaction(async (tx) => {
      await tx
        .insert(categoryCareer)
        .values(ratings.map(({ userId, elo }) => ({ userId, elo, categoryId })))
        .onConflictDoUpdate({
          target: [categoryCareer.categoryId, categoryCareer.userId],
          set: { elo: sql`excluded.elo` },
        });

      await tx.insert(ratingChange).values(
        ratings.map(({ userId, delta }) => ({
          matchupId,
          userId,
          categoryId,
          delta,
        })),
      );
    });
  }

  // Undoes the rating changes recorded for a matchup and forgets them
  async revertRatings(matchupId: number) {
    return db.transaction(async (tx) => {
      const changes = await tx
        .delete(ratingChange)
        .where(eq(ratingChange.matchupId, matchupId))
        .returning({
          userId: ratingChange.userId,
          categoryId: ratingChange.categoryId,
          delta: ratingChange.delta,
        });

      for (const change of changes) {
        await tx
          .update(categoryCareer)
          .set({
            elo: sql`greatest(0, ${categoryCareer.elo} - ${change.delta})`,
          })
          .where(
            and(
              eq(categoryCareer.userId, change.userId),
              eq(categoryCareer.categoryId, change.categoryId),
            ),
          );
      }

      return changes;
    });
  }
}
