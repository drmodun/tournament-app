import { Injectable, NotFoundException } from '@nestjs/common';
import { IChallongeMatch, IEndMatchupRequest } from '@tournament-app/types';
import {
  group,
  matchup,
  participation,
  roster,
  rosterToMatchup,
  score,
  scoreToRoster,
  stage,
  stageRound,
  user,
} from '../db/schema';
import { db } from '../db/db';
import { eq, and, sql, asc, inArray } from 'drizzle-orm';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import * as tables from '../db/schema';

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

  /**
   * Get all matchups for a stage with their rosters and scores
   * This is used for bracket visualization
   */
  async getBracketDataForStage(stageId: number) {
    // Get stage information
    const stageInfo = await db
      .select({
        id: stage.id,
        name: stage.name,
        stageType: stage.stageType,
        tournamentId: stage.tournamentId,
      })
      .from(stage)
      .leftJoin(matchup, eq(matchup.stageId, stage.id))
      .leftJoin(rosterToMatchup, eq(rosterToMatchup.matchupId, matchup.id))
      .where(eq(stage.id, stageId))
      .limit(1);

    if (stageInfo.length === 0) {
      return null;
    }

    // Get all matchups for this stage
    const matchups = await db
      .select({
        id: matchup.id,
        stageId: matchup.stageId,
        roundId: matchup.roundId,
        parentMatchupId: matchup.parentMatchupId,
        startDate: matchup.startDate,
        endDate: matchup.endDate,
        isFinished: matchup.isFinished,
        roundNumber: stageRound.roundNumber,
      })
      .from(matchup)
      .innerJoin(stageRound, eq(matchup.roundId, stageRound.id))
      .where(eq(matchup.stageId, stageId))
      .orderBy(asc(stageRound.roundNumber));

    // Get all rosters for these matchups
    const rosterMatchups = await db
      .select({
        matchupId: rosterToMatchup.matchupId,
        rosterId: rosterToMatchup.rosterId,
        isWinner: rosterToMatchup.isWinner,
        rosterName: roster.id, // We'll replace this with actual names later
      })
      .from(rosterToMatchup)
      .innerJoin(roster, eq(rosterToMatchup.rosterId, roster.id))
      .where(
        inArray(
          rosterToMatchup.matchupId,
          matchups.map((m) => m.id),
        ),
      );

    // Get all scores for these matchups
    const scores = await db
      .select({
        id: score.id,
        matchupId: score.matchupId,
        roundNumber: score.roundNumber,
      })
      .from(score)
      .where(
        inArray(
          score.matchupId,
          matchups.map((m) => m.id),
        ),
      );

    // Get score details for each roster
    const scoreDetails = await db
      .select({
        scoreId: scoreToRoster.scoreId,
        rosterId: scoreToRoster.rosterId,
        points: scoreToRoster.points,
        isWinner: scoreToRoster.isWinner,
      })
      .from(scoreToRoster)
      .where(
        inArray(
          scoreToRoster.scoreId,
          scores.map((s) => s.id),
        ),
      );

    // Get roster names and details
    const rosterIds = [...new Set(rosterMatchups.map((rm) => rm.rosterId))];
    const rosterDetails = await db
      .select({
        id: roster.id,
        participationId: roster.participationId,
      })
      .from(roster)
      .where(inArray(roster.id, rosterIds));

    // Get group names for rosters
    const participationIds = [
      ...new Set(rosterDetails.map((r) => r.participationId)),
    ];
    const participationDetails = await db
      .select({
        id: participation.id,
        groupId: participation.groupId,
        userId: participation.userId,
      })
      .from(participation)
      .where(inArray(participation.id, participationIds));

    // Get group names
    const groupIds = participationDetails
      .filter((p) => p.groupId !== null)
      .map((p) => p.groupId);

    const groupDetails =
      groupIds.length > 0
        ? await db
            .select({
              id: group.id,
              name: group.name,
              logo: group.logo,
            })
            .from(group)
            .where(inArray(group.id, groupIds))
        : [];

    // Get user names for solo participants
    const userIds = participationDetails
      .filter((p) => p.userId !== null)
      .map((p) => p.userId);

    const userDetails =
      userIds.length > 0
        ? await db
            .select({
              id: user.id,
              username: user.username,
              profilePicture: user.profilePicture,
            })
            .from(user)
            .where(inArray(user.id, userIds))
        : [];

    // Count wins for each roster
    const rosterWins = rosterMatchups.reduce((acc, rm) => {
      if (rm.isWinner) {
        acc[rm.rosterId] = (acc[rm.rosterId] || 0) + 1;
      }
      return acc;
    }, {});

    return {
      stage: stageInfo[0],
      matchups,
      rosterMatchups,
      scores,
      scoreDetails,
      rosterDetails,
      participationDetails,
      groupDetails,
      userDetails,
      rosterWins,
    };
  }

  async createScore(createScoreDto: CreateScoreDto) {
    const { matchupId, rosterId, score: scoreValue, isWinner } = createScoreDto;

    // Check if the matchup exists
    const matchupRecord = await db.query.matchup.findFirst({
      where: eq(matchup.id, matchupId),
    });

    if (!matchupRecord) {
      throw new NotFoundException(`Matchup with ID ${matchupId} not found`);
    }

    // Check if the roster exists and is part of the matchup
    const rosterMatchup = await db.query.rosterToMatchup.findFirst({
      where: and(
        eq(rosterToMatchup.matchupId, matchupId),
        eq(rosterToMatchup.rosterId, rosterId),
      ),
    });

    if (!rosterMatchup) {
      throw new NotFoundException(
        `Roster with ID ${rosterId} is not part of matchup with ID ${matchupId}`,
      );
    }

    // Insert the score
    const [newScore] = await db
      .insert(score)
      .values({
        matchupId,
        rosterId,
        score: scoreValue,
        isWinner: isWinner || false,
      })
      .returning();

    return newScore;
  }

  async updateScore(id: number, updateScoreDto: UpdateScoreDto) {
    const { score: scoreValue, isWinner } = updateScoreDto;

    // Check if the score exists
    const existingScore = await db.query.scoreToRoster.findFirst({
      where: eq(scoreToRoster.scoreId, id),
    });

    if (!existingScore) {
      throw new NotFoundException(`Score with ID ${id} not found`);
    }

    // Update the score
    const [updatedScore] = await db
      .update(score)
      .set({
        points: scoreValue !== undefined ? scoreValue : existingScore.points,
        isWinner: isWinner !== undefined ? isWinner : existingScore.isWinner,
      })
      .where(eq(score.id, id))
      .returning();

    return updatedScore;
  }

  async getMatchupById(matchupId: number) {
    const result = await db
      .select()
      .from(tables.matchup)
      .where(eq(tables.matchup.id, matchupId))
      .leftJoin(
        tables.rosterToMatchup,
        eq(tables.rosterToMatchup.matchupId, tables.matchup.id),
      )
      .execute();

    if (!result.length) {
      throw new NotFoundException(`Matchup with ID ${matchupId} not found`);
    }

    return result[0];
  }

  async getStageById(stageId: number) {
    const result = await db
      .select({
        id: tables.stage.id,
        name: tables.stage.name,
        stageType: tables.stage.stageType,
        tournamentId: tables.stage.tournamentId,
        challongeTournamentId: tables.stage.challongeTournamentId,
      })
      .from(tables.stage)
      .where(eq(tables.stage.id, stageId))
      .limit(1)
      .execute();

    return result[0];
  }

  async importChallongeMatchesToStage(
    stageId: number,
    challongeMatches: IChallongeMatch[],
  ) {
    return db.transaction(async (tx) => {
      try {
        const rostersWithChallongeIds = await tx
          .select({
            id: roster.id,
            challongeParticipantId: roster.challongeParticipantId,
          })
          .from(roster)
          .where(eq(roster.stageId, stageId))
          .execute();

        if (!rostersWithChallongeIds.length) {
          throw new Error(
            `No rosters found for stage ID ${stageId} with Challonge participant IDs`,
          );
        }

        const challongeIdToRosterMap = new Map<string, number>();
        for (const r of rostersWithChallongeIds) {
          if (r.challongeParticipantId) {
            challongeIdToRosterMap.set(r.challongeParticipantId, r.id);
          }
        }

        const insertedMatchups = [];
        for (const match of challongeMatches) {
          const newMatchup = await tx
            .insert(matchup)
            .values({
              stageId: stageId,
              round: match.attributes.round,
              challongeMatchupId: match.id,
              startDate: match.attributes.timestamps.starts_at || new Date(),
              endDate: null,
              isFinished: false,
            })
            .returning()
            .execute();

          if (newMatchup.length > 0) {
            insertedMatchups.push(newMatchup[0]);

            const player1Id = match.relationships.player1?.data?.id;
            const player2Id = match.relationships.player2?.data?.id;

            if (player1Id && challongeIdToRosterMap.has(player1Id)) {
              await tx.execute(
                sql`INSERT INTO roster_matchup (roster_id, matchup_id, is_winner) 
                    VALUES (${challongeIdToRosterMap.get(player1Id)}, ${newMatchup[0].id}, false)`,
              );
            }

            if (player2Id && challongeIdToRosterMap.has(player2Id)) {
              await tx.execute(
                sql`INSERT INTO roster_matchup (roster_id, matchup_id, is_winner) 
                    VALUES (${challongeIdToRosterMap.get(player2Id)}, ${newMatchup[0].id}, false)`,
              );
            }
          }
        }

        return insertedMatchups;
      } catch (error) {
        console.error('Failed to import Challonge matches:', error);
        throw error;
      }
    });
  }
}
