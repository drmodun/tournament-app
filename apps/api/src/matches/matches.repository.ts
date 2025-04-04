import { Injectable, NotFoundException } from '@nestjs/common';
import {
  IChallongeMatch,
  IEndMatchupRequest,
  MatchupResponsesEnum,
  MatchupSortingEnum,
} from '@tournament-app/types';
import {
  matchup,
  roster,
  score,
  scoreToRoster,
  stage,
  stageRound,
} from '../db/schema';
import { db } from '../db/db';
import { eq, and, sql, SQL, isNull, InferInsertModel } from 'drizzle-orm';
import * as tables from '../db/schema';
import { PrimaryRepository } from '../base/repository/primaryRepository';
import {
  PgColumn,
  PgSelectJoinFn,
  AnyPgSelectQueryBuilder,
} from 'drizzle-orm/pg-core';
import { QueryMatchupRequestDto } from './dto/requests';

@Injectable()
export class MatchesDrizzleRepository extends PrimaryRepository<
  typeof matchup,
  QueryMatchupRequestDto,
  any
> {
  constructor() {
    super(matchup);
  }

  conditionallyJoin<TSelect extends AnyPgSelectQueryBuilder>(
    query: TSelect,
    typeEnum: MatchupResponsesEnum,
  ):
    | PgSelectJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right'>
    | TSelect {
    switch (typeEnum) {
      case MatchupResponsesEnum.BASE:
        return query;
      case MatchupResponsesEnum.WITH_CHALLONGE_ID:
        return query;
      default:
        return query;
    }
  }

  getValidWhereClause(query: QueryMatchupRequestDto): SQL[] {
    const clauses = Object.entries(query).filter(
      ([_, value]) => value !== undefined,
    );

    return clauses
      .map(([key, value]) => {
        switch (key) {
          case 'id':
            return eq(matchup.id, value as number);
          case 'stageId':
            return eq(matchup.stageId, value as number);
          case 'round':
            return eq(matchup.round, value as number);
          case 'isFinished':
            return eq(matchup.isFinished, value as boolean);
          case 'challongeMatchupId':
            return value === null
              ? isNull(matchup.challongeMatchupId)
              : eq(matchup.challongeMatchupId, value as string);
          default:
            return undefined;
        }
      })
      .filter(Boolean);
  }

  public sortRecord: Record<MatchupSortingEnum, PgColumn | SQL<number>> = {
    [MatchupSortingEnum.START_DATE]: matchup.startDate,
    [MatchupSortingEnum.IS_FINISHED]: matchup.isFinished,
    [MatchupSortingEnum.ROUND_NUMBER]: stageRound.roundNumber,
  };

  getMappingObject(responseEnum: MatchupResponsesEnum) {
    switch (responseEnum) {
      case MatchupResponsesEnum.BASE:
        return {
          id: matchup.id,
          stageId: matchup.stageId,
          roundId: matchup.roundId,
          roundNumber: stageRound.roundNumber,
          challongeMatchupId: matchup.challongeMatchupId,
          parentMatchupId: matchup.parentMatchupId,
          startDate: matchup.startDate,
          endDate: matchup.endDate,
          isFinished: matchup.isFinished,
          stageName: stage.name,
        };

      case MatchupResponsesEnum.WITH_RESULTS_AND_SCORES:
        return {
          ...this.getMappingObject(MatchupResponsesEnum.BASE),
          scores: {
            id: score.id,
            roundNumber: score.roundNumber,
            scoreDetails: {
              scoreId: scoreToRoster.scoreId,
              rosterId: scoreToRoster.rosterId,
              points: scoreToRoster.points,
              isWinner: scoreToRoster.isWinner,
            },
          },
        };

      default:
        return null;
    }
  }

  async insertMatchScore(
    matchupId: number,
    createMatchResult: IEndMatchupRequest,
  ) {
    return db.transaction(async (tx) => {
      const scores = await tx
        .insert(score)
        .values(
          createMatchResult.scores.map((score) => ({
            matchupId,
            roundNumber: score.roundNumber,
          })),
        )
        .returning();

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

      await tx
        .update(matchup)
        .set({
          isFinished: true,
          endDate: new Date(),
        } as Partial<InferInsertModel<typeof matchup>>)
        .where(eq(matchup.id, matchupId));

      const winningRosterIds = createMatchResult.results
        .filter((r) => r.isWinner)
        .map((r) => r.rosterId);

      for (const rosterId of winningRosterIds) {
        await tx.execute(
          sql`UPDATE roster_matchup 
              SET is_winner = true 
              WHERE matchup_id = ${matchupId} AND roster_id = ${rosterId}`,
        );
      }

      return scores;
    });
  }

  async deleteScore(scoreId: number) {
    return db.delete(score).where(eq(score.id, scoreId));
  }

  /**
   * Deletes all data related to a matchup's scores and resets the matchup state
   * Only focuses on local state, not bracket progression
   */
  async deleteMatchScore(matchupId: number) {
    return db.transaction(async (tx) => {
      // 1. Get the current matchup
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

      // 3. Delete all score-to-roster entries for all scores
      for (const scoreEntry of matchScores) {
        await tx
          .delete(scoreToRoster)
          .where(eq(scoreToRoster.scoreId, scoreEntry.id));
      }

      // 4. Delete all scores for this matchup
      await tx.delete(score).where(eq(score.matchupId, matchupId));

      // 5. Reset the matchup status
      await tx
        .update(matchup)
        .set({
          isFinished: false,
          endDate: null,
        })
        .where(eq(matchup.id, matchupId));

      // 6. Reset all roster-to-matchup records for this matchup
      await tx.execute(
        sql`UPDATE roster_matchup 
            SET is_winner = false 
            WHERE matchup_id = ${matchupId}`,
      );

      return { success: true };
    });
  }

  async updateMatchScore(
    matchupId: number,
    createMatchResult: IEndMatchupRequest,
  ) {
    return db.transaction(async (tx) => {
      const currentMatchup = await tx
        .select()
        .from(matchup)
        .where(eq(matchup.id, matchupId))
        .limit(1);

      if (currentMatchup.length === 0) {
        throw new Error(`Matchup with ID ${matchupId} not found`);
      }

      const matchScores = await tx
        .select()
        .from(score)
        .where(eq(score.matchupId, matchupId));

      for (const scoreEntry of matchScores) {
        await tx
          .delete(scoreToRoster)
          .where(eq(scoreToRoster.scoreId, scoreEntry.id));
      }

      await tx.delete(score).where(eq(score.matchupId, matchupId));

      await tx.execute(
        sql`UPDATE roster_matchup 
            SET is_winner = false 
            WHERE matchup_id = ${matchupId}`,
      );

      const scores = await tx
        .insert(score)
        .values(
          createMatchResult.scores.map((score) => ({
            matchupId,
            roundNumber: score.roundNumber,
          })),
        )
        .returning();

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

      await tx
        .update(matchup)
        .set({
          isFinished: true,
          endDate: new Date(),
        } as Partial<InferInsertModel<typeof matchup>>)
        .where(eq(matchup.id, matchupId));

      const winningRosterIds = createMatchResult.results
        .filter((r) => r.isWinner)
        .map((r) => r.rosterId);

      for (const rosterId of winningRosterIds) {
        await tx.execute(
          sql`UPDATE roster_matchup 
              SET is_winner = true 
              WHERE matchup_id = ${matchupId} AND roster_id = ${rosterId}`,
        );
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

  async endMatchup(matchupId: number, createMatchResult: IEndMatchupRequest) {
    return this.updateMatchScore(matchupId, createMatchResult);
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

  /**
   * Imports matches from Challonge into the database for a specific stage
   * Uses a transaction to ensure all operations succeed or fail together
   * Also creates the relationships between rosters and matchups
   */
  async importChallongeMatchesToStage(
    stageId: number,
    challongeMatches: IChallongeMatch[],
    stageRoundId: number,
  ) {
    return db.transaction(async (tx) => {
      try {
        // 1. Get all rosters with Challonge participant IDs for this stage
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

        // Create a map for quick lookup of roster IDs by Challonge participant ID
        const challongeIdToRosterMap = new Map<string, number>();
        for (const r of rostersWithChallongeIds) {
          if (r.challongeParticipantId) {
            challongeIdToRosterMap.set(r.challongeParticipantId, r.id);
          }
        }

        // 2. Insert matchups
        const insertedMatchups = [];
        for (const match of challongeMatches) {
          // Create basic matchup data
          const newMatchup = await tx
            .insert(matchup)
            .values({
              stageId: stageId,
              roundId: stageRoundId,
              challongeMatchupId: match.id,
              startDate: match.attributes.timestamps.starts_at || new Date(),
              endDate: null,
              isFinished: false,
            })
            .returning()
            .execute();

          if (newMatchup.length > 0) {
            insertedMatchups.push(newMatchup[0]);

            // 3. Create roster to matchup relationships
            const player1Id = match.relationships.player1?.data?.id;
            const player2Id = match.relationships.player2?.data?.id;

            if (player1Id && challongeIdToRosterMap.has(player1Id)) {
              // Use SQL template literals to avoid type issues
              await tx.execute(
                sql`INSERT INTO roster_matchup (roster_id, matchup_id, is_winner) 
                    VALUES (${challongeIdToRosterMap.get(player1Id)}, ${newMatchup[0].id}, false)`,
              );
            }

            if (player2Id && challongeIdToRosterMap.has(player2Id)) {
              // Use SQL template literals to avoid type issues
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
