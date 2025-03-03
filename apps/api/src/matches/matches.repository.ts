import { Injectable } from '@nestjs/common';
import { IEndMatchupRequest } from '@tournament-app/types';
import {
  score,
  scoreToRoster,
  matchup,
  rosterToMatchup,
  stage,
} from 'src/db/schema';
import { db } from 'src/db/db';
import { eq, and, sql } from 'drizzle-orm';

@Injectable()
export class MatchesDrizzleRepository {
  async insertMatchScore(
    matchupId: number,
    createMatchResult: IEndMatchupRequest,
  ) {
    return db.transaction(async (tx) => {
      // 1. Insert scores for each round
      const scores = await tx
        .insert(score)
        .values(
          createMatchResult.scores.map((score) => ({
            matchupId,
            roundNumber: score.roundNumber,
          })),
        )
        .returning();

      // 2. Insert score details for each roster
      await tx.insert(scoreToRoster).values(
        createMatchResult.scores.flatMap((score) =>
          score.scores.map((teamScore) => ({
            scoreId: scores.find((s) => s.roundNumber === score.roundNumber)
              ?.id,
            rosterId: teamScore.rosterId,
            points: teamScore.points,
            isWinner: teamScore.isWinner,
          })),
        ),
      );

      // 3. Mark the matchup as finished
      await tx
        .update(matchup)
        .set({
          isFinished: true,
          endDate: new Date(),
        })
        .where(eq(matchup.id, matchupId));

      // 4. Update roster-to-matchup records with winners
      const winningRosterIds = createMatchResult.results
        .filter((r) => r.isWinner)
        .map((r) => r.rosterId);

      // Update each winning roster individually to avoid type issues
      for (const rosterId of winningRosterIds) {
        // Use SQL template literals for raw SQL
        await tx.execute(
          sql`UPDATE roster_matchup 
              SET is_winner = true 
              WHERE matchup_id = ${matchupId} AND roster_id = ${rosterId}`,
        );
      }

      // 5. Handle advancing winners to the next match
      // First, find the parent matchup (if any)
      const currentMatchup = await tx
        .select()
        .from(matchup)
        .where(eq(matchup.id, matchupId))
        .limit(1);

      if (currentMatchup.length > 0 && currentMatchup[0].parentMatchupId) {
        const parentMatchupId = currentMatchup[0].parentMatchupId;

        // Add winning rosters to the parent matchup
        for (const rosterId of winningRosterIds) {
          // Check if the roster is already in the parent matchup
          const existingEntry = await tx
            .select()
            .from(rosterToMatchup)
            .where(
              and(
                eq(rosterToMatchup.matchupId, parentMatchupId),
                eq(rosterToMatchup.rosterId, rosterId),
              ),
            )
            .limit(1);

          // If not already in the parent matchup, add it
          if (existingEntry.length === 0) {
            // Use SQL template literals for raw SQL
            await tx.execute(
              sql`INSERT INTO roster_matchup (roster_id, matchup_id, is_winner) 
                  VALUES (${rosterId}, ${parentMatchupId}, false)`,
            );
          }
        }

        // Check if all child matchups are finished
        // If so, we can start the parent matchup
        const childMatchups = await tx
          .select()
          .from(matchup)
          .where(eq(matchup.parentMatchupId, parentMatchupId));

        const allChildrenFinished = childMatchups.every((m) => m.isFinished);

        if (allChildrenFinished) {
          // All child matchups are finished, so we can start the parent matchup
          // This could involve updating the start date or other properties
          // So far, I do not see the need to update the start date
        }
      }

      return scores;
    });
  }

  async deleteScore(scoreId: number) {
    return db.delete(score).where(eq(score.id, scoreId));
  }

  /**
   * Deletes all data related to a matchup's scores and resets the matchup state
   * This undoes everything that insertMatchScore did
   */
  async deleteMatchScore(matchupId: number) {
    return db.transaction(async (tx) => {
      // 1. Get the current matchup to check for parent matchup
      const currentMatchup = await tx
        .select()
        .from(matchup)
        .where(eq(matchup.id, matchupId))
        .limit(1);

      if (currentMatchup.length === 0) {
        throw new Error(`Matchup with ID ${matchupId} not found`);
      }

      // 2. Get all scores for this matchup
      const matchScores = await tx
        .select()
        .from(score)
        .where(eq(score.matchupId, matchupId));

      // 3. Get all winning rosters for this matchup
      const winningRosters = await tx
        .select()
        .from(rosterToMatchup)
        .where(
          and(
            eq(rosterToMatchup.matchupId, matchupId),
            eq(rosterToMatchup.isWinner, true),
          ),
        );

      // 4. If there's a parent matchup, remove the winning rosters from it
      if (currentMatchup[0].parentMatchupId) {
        const parentMatchupId = currentMatchup[0].parentMatchupId;

        for (const roster of winningRosters) {
          // Delete the roster from the parent matchup
          await tx.execute(
            sql`DELETE FROM roster_matchup 
                WHERE matchup_id = ${parentMatchupId} AND roster_id = ${roster.rosterId}`,
          );
        }
      }

      // 5. Delete all score-to-roster entries for all scores
      for (const scoreEntry of matchScores) {
        await tx
          .delete(scoreToRoster)
          .where(eq(scoreToRoster.scoreId, scoreEntry.id));
      }

      // 6. Delete all scores for this matchup
      await tx.delete(score).where(eq(score.matchupId, matchupId));

      // 7. Reset the matchup status
      await tx
        .update(matchup)
        .set({
          isFinished: false,
          endDate: null,
        })
        .where(eq(matchup.id, matchupId));

      // 8. Reset all roster-to-matchup records for this matchup
      await tx.execute(
        sql`UPDATE roster_matchup 
            SET is_winner = false 
            WHERE matchup_id = ${matchupId}`,
      );

      return { success: true };
    });
  }

  /**
   * Updates a matchup's scores by first deleting existing scores and then inserting new ones
   * Works as a PUT operation (delete + insert)
   */
  async updateMatchScore(
    matchupId: number,
    createMatchResult: IEndMatchupRequest,
  ) {
    return db.transaction(async (tx) => {
      // 1. First delete/undo all existing scores and related data
      // We need to do this within the transaction

      // 1.1 Get the current matchup to check for parent matchup
      const currentMatchup = await tx
        .select()
        .from(matchup)
        .where(eq(matchup.id, matchupId))
        .limit(1);

      if (currentMatchup.length === 0) {
        throw new Error(`Matchup with ID ${matchupId} not found`);
      }

      // 1.2 Get all scores for this matchup
      const matchScores = await tx
        .select()
        .from(score)
        .where(eq(score.matchupId, matchupId));

      // 1.3 Get all winning rosters for this matchup
      const winningRosters = await tx
        .select()
        .from(rosterToMatchup)
        .where(
          and(
            eq(rosterToMatchup.matchupId, matchupId),
            eq(rosterToMatchup.isWinner, true),
          ),
        );

      // 1.4 If there's a parent matchup, remove the winning rosters from it
      if (currentMatchup[0].parentMatchupId) {
        const parentMatchupId = currentMatchup[0].parentMatchupId;

        for (const roster of winningRosters) {
          // Delete the roster from the parent matchup
          await tx.execute(
            sql`DELETE FROM roster_matchup 
                WHERE matchup_id = ${parentMatchupId} AND roster_id = ${roster.rosterId}`,
          );
        }
      }

      // 1.5 Delete all score-to-roster entries for all scores
      for (const scoreEntry of matchScores) {
        await tx
          .delete(scoreToRoster)
          .where(eq(scoreToRoster.scoreId, scoreEntry.id));
      }

      // 1.6 Delete all scores for this matchup
      await tx.delete(score).where(eq(score.matchupId, matchupId));

      // 1.7 Reset all roster-to-matchup records for this matchup
      await tx.execute(
        sql`UPDATE roster_matchup 
            SET is_winner = false 
            WHERE matchup_id = ${matchupId}`,
      );

      // 2. Now insert the new scores and related data

      // 2.1 Insert scores for each round
      const scores = await tx
        .insert(score)
        .values(
          createMatchResult.scores.map((score) => ({
            matchupId,
            roundNumber: score.roundNumber,
          })),
        )
        .returning();

      // 2.2 Insert score details for each roster
      await tx.insert(scoreToRoster).values(
        createMatchResult.scores.flatMap((score) =>
          score.scores.map((teamScore) => ({
            scoreId: scores.find((s) => s.roundNumber === score.roundNumber)
              ?.id,
            rosterId: teamScore.rosterId,
            points: teamScore.points,
            isWinner: teamScore.isWinner,
          })),
        ),
      );

      // 2.3 Mark the matchup as finished
      await tx
        .update(matchup)
        .set({
          isFinished: true,
          endDate: new Date(),
        })
        .where(eq(matchup.id, matchupId));

      // 2.4 Update roster-to-matchup records with winners
      const winningRosterIds = createMatchResult.results
        .filter((r) => r.isWinner)
        .map((r) => r.rosterId);

      // Update each winning roster individually to avoid type issues
      for (const rosterId of winningRosterIds) {
        await tx.execute(
          sql`UPDATE roster_matchup 
              SET is_winner = true 
              WHERE matchup_id = ${matchupId} AND roster_id = ${rosterId}`,
        );
      }

      // 2.5 Handle advancing winners to the next match
      if (currentMatchup[0].parentMatchupId) {
        const parentMatchupId = currentMatchup[0].parentMatchupId;

        // Add winning rosters to the parent matchup
        for (const rosterId of winningRosterIds) {
          // Check if the roster is already in the parent matchup
          const existingEntry = await tx
            .select()
            .from(rosterToMatchup)
            .where(
              and(
                eq(rosterToMatchup.matchupId, parentMatchupId),
                eq(rosterToMatchup.rosterId, rosterId),
              ),
            )
            .limit(1);

          // If not already in the parent matchup, add it
          if (existingEntry.length === 0) {
            await tx.execute(
              sql`INSERT INTO roster_matchup (roster_id, matchup_id, is_winner) 
                  VALUES (${rosterId}, ${parentMatchupId}, false)`,
            );
          }
        }

        // Check if all child matchups are finished
        const childMatchups = await tx
          .select()
          .from(matchup)
          .where(eq(matchup.parentMatchupId, parentMatchupId));

        const allChildrenFinished = childMatchups.every((m) => m.isFinished);

        if (allChildrenFinished) {
          // All child matchups are finished, so we can start the parent matchup
          await tx
            .update(matchup)
            .set({
              startDate: new Date(), // Set to current time
            })
            .where(eq(matchup.id, parentMatchupId));
        }
      }

      return scores;
    });
  }

  async isMatchupInTournament(matchupId: number, tournamentId: number) {
    const matchupWithStage = await db
      .select({
        matchup: matchup,
        stageId: stage.id,
        tournamentId: stage.tournamentId,
      })
      .from(matchup)
      .innerJoin(stage, eq(matchup.stageId, stage.id))
      .where(
        and(eq(matchup.id, matchupId), eq(stage.tournamentId, tournamentId)),
      )
      .limit(1);

    if (matchupWithStage.length === 0) {
      return {
        exists: false,
        belongsToTournament: false,
        matchup: null,
      };
    }

    return {
      exists: true,
      belongsToTournament: matchupWithStage[0].tournamentId === tournamentId,
      matchup: matchupWithStage[0],
    };
  }
}
