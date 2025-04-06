import { Injectable, NotFoundException } from '@nestjs/common';
import {
  groupRoleEnum,
  IChallongeMatch,
  IEndMatchupRequest,
  IMatchupResponseWithRosters,
  IRosterResponse,
  MatchupResponsesEnum,
  MatchupSortingEnum,
} from '@tournament-app/types';
import {
  matchup,
  roster,
  rosterToMatchup,
  score,
  scoreToRoster,
  stage,
  stageRound,
  user,
  userToRoster,
} from '../db/schema';
import { db } from '../db/db';
import {
  eq,
  and,
  sql,
  SQL,
  isNull,
  InferInsertModel,
  inArray,
  or,
  desc,
  aliasedTable,
  count,
} from 'drizzle-orm';
import * as tables from '../db/schema';
import { PrimaryRepository } from '../base/repository/primaryRepository';
import {
  PgColumn,
  PgSelectJoinFn,
  AnyPgSelectQueryBuilder,
} from 'drizzle-orm/pg-core';
import { QueryMatchupRequestDto } from './dto/requests';
import { participation } from '../db/schema';
import { PaginationOnly } from 'src/base/query/baseQuery';

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
        } as Partial<InferInsertModel<typeof matchup>>)
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

  async canUserEditMatchup(matchupId: number, userId: number) {
    const creatorUser = aliasedTable(user, 'creatorUser');

    const result = await db
      .select()
      .from(matchup)
      .leftJoin(stage, eq(matchup.stageId, stage.id))
      .leftJoin(tables.tournament, eq(stage.tournamentId, tables.tournament.id))
      .leftJoin(
        tables.group,
        eq(tables.tournament.affiliatedGroupId, tables.group.id),
      )
      .leftJoin(
        tables.groupToUser,
        eq(tables.group.id, tables.groupToUser.groupId),
      )
      .leftJoin(creatorUser, eq(tables.tournament.creatorId, creatorUser.id))
      .where(
        and(
          eq(matchup.id, matchupId),
          or(
            and(
              eq(tables.groupToUser.userId, userId),
              eq(tables.tournament.affiliatedGroupId, tables.group.id),
              or(
                eq(tables.groupToUser.role, groupRoleEnum.ADMIN),
                eq(tables.groupToUser.role, groupRoleEnum.OWNER),
              ),
            ),
            and(
              eq(creatorUser.id, userId),
              eq(tables.tournament.creatorId, creatorUser.id),
            ),
          ),
        ),
      );
    return result.length > 0;
  }

  async getManagedMatchups(
    userId: number,
    query?: QueryMatchupRequestDto,
  ): Promise<IMatchupResponseWithRosters[]> {
    const creatorUser = aliasedTable(user, 'creatorUser');
    const rosterUser = aliasedTable(user, 'rosterUser');
    const rosterGroup = aliasedTable(tables.group, 'rosterGroup');
    const playerUser = aliasedTable(user, 'playerUser');

    const page = query?.page || 1;
    const pageSize = query?.pageSize ?? 10;
    const offset = pageSize * (page - 1);

    const subqueryAlias = 'player_agg';
    const playerAggregationSubquery = db.$with(subqueryAlias).as(
      db
        .select({
          rosterId: userToRoster.rosterId,
          players: sql<
            Array<{ user: object; isSubstitute: boolean }>
          >`JSONB_AGG(JSONB_BUILD_OBJECT(
              'user', JSONB_BUILD_OBJECT(
                'id', ${playerUser.id},
                'username', ${playerUser.username},
                'profilePicture', ${playerUser.profilePicture},
                'country', ${playerUser.country}
              ),
              'isSubstitute', ${userToRoster.isSubstitute}
            ))`.as('players'),
        })
        .from(userToRoster)
        .leftJoin(playerUser, eq(userToRoster.userId, playerUser.id))
        .groupBy(userToRoster.rosterId),
    );

    const result = await db
      .with(playerAggregationSubquery)
      .select({
        id: matchup.id,
        stageId: matchup.stageId,
        round: matchup.round,
        isFinished: matchup.isFinished,
        challongeMatchupId: matchup.challongeMatchupId,
        startDate: matchup.startDate,
        endDate: matchup.endDate,
        matchupType: sql`'standard'`.mapWith(String),
        rosters: sql<IRosterResponse[]>`JSONB_AGG(DISTINCT JSONB_BUILD_OBJECT(
          'id', ${roster.id},
          'stageId', ${roster.stageId},
          'participationId', ${roster.participationId},
          'challongeParticipantId', ${roster.challongeParticipantId},
          'createdAt', ${roster.createdAt},
          'group', CASE WHEN ${rosterGroup.id} IS NOT NULL THEN JSONB_BUILD_OBJECT('id', ${rosterGroup.id}, 'name', ${rosterGroup.name}, 'logo', ${rosterGroup.logo}) ELSE NULL END,
          'user', CASE WHEN ${rosterUser.id} IS NOT NULL THEN JSONB_BUILD_OBJECT('id', ${rosterUser.id}, 'username', ${rosterUser.username}, 'profilePicture', ${rosterUser.profilePicture}) ELSE NULL END,
          'participation', CASE WHEN ${participation.id} IS NOT NULL THEN JSONB_BUILD_OBJECT('id', ${participation.id}, 'tournament', JSONB_BUILD_OBJECT('categoryId', ${participation.tournamentId}), 'group', JSONB_BUILD_OBJECT('id', ${participation.groupId}, 'name', ${rosterGroup.name}, 'abbreviation', ${rosterGroup.abbreviation}, 'logo', ${rosterGroup.logo}), 'user', JSONB_BUILD_OBJECT('id', ${participation.userId}, 'username', ${rosterUser.username}, 'profilePicture', ${rosterUser.profilePicture})) ELSE NULL END,
          'players', ${sql.identifier(subqueryAlias)}.players
        )) FILTER (WHERE ${roster.id} IS NOT NULL)`,
      })
      .from(matchup)
      .leftJoin(stage, eq(matchup.stageId, stage.id))
      .leftJoin(tables.tournament, eq(stage.tournamentId, tables.tournament.id))
      .leftJoin(creatorUser, eq(tables.tournament.creatorId, creatorUser.id))
      .leftJoin(
        tables.group,
        eq(tables.tournament.affiliatedGroupId, tables.group.id),
      )
      .leftJoin(
        tables.groupToUser,
        eq(tables.group.id, tables.groupToUser.groupId),
      )
      .leftJoin(rosterToMatchup, eq(matchup.id, rosterToMatchup.matchupId))
      .leftJoin(roster, eq(rosterToMatchup.rosterId, roster.id))
      .leftJoin(participation, eq(roster.participationId, participation.id))
      .leftJoin(rosterUser, eq(participation.userId, rosterUser.id))
      .leftJoin(rosterGroup, eq(participation.groupId, rosterGroup.id))
      .leftJoin(
        playerAggregationSubquery,
        eq(roster.id, playerAggregationSubquery.rosterId),
      )
      .where(
        and(
          query?.stageId ? eq(matchup.stageId, query.stageId) : undefined,
          query?.round ? eq(matchup.round, query.round) : undefined,
          query?.isFinished
            ? eq(matchup.isFinished, query.isFinished)
            : undefined,
          query?.challongeMatchupId
            ? eq(matchup.challongeMatchupId, query.challongeMatchupId)
            : undefined,
          query?.rosterId ? eq(roster.id, query.rosterId) : undefined,
          or(
            and(
              eq(tables.groupToUser.userId, userId),
              eq(tables.tournament.affiliatedGroupId, tables.group.id),
              or(
                eq(tables.groupToUser.role, groupRoleEnum.ADMIN),
                eq(tables.groupToUser.role, groupRoleEnum.OWNER),
              ),
            ),
            and(
              eq(creatorUser.id, userId),
              eq(tables.tournament.creatorId, creatorUser.id),
            ),
          ),
        ),
      )
      .groupBy(
        matchup.id,
        matchup.stageId,
        matchup.round,
        matchup.isFinished,
        matchup.challongeMatchupId,
        matchup.startDate,
        matchup.endDate,
      )
      .orderBy(desc(count(roster.id)))
      .limit(pageSize)
      .offset(offset);

    return result.map((m) => ({
      ...m,
      rosters: (m.rosters || []).map((r) => ({
        ...r,
        players: r.players || [],
      })),
    }));
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

        const forbiddenChallongeIds = challongeMatches.map((match) => match.id);

        await tx
          .delete(matchup)
          .where(
            and(inArray(matchup.challongeMatchupId, forbiddenChallongeIds)),
          ); // delete existing outdated matchups

        for (const match of challongeMatches) {
          console.log('match', match);
          const newMatchup = await tx
            .insert(matchup)
            .values({
              stageId: stageId,
              round: +match.attributes.round,
              challongeMatchupId: match.id,
              startDate: new Date(match.attributes.timestamps['startedAt']),
              endDate: null,
              isFinished: false,
            } as any)
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

  async getResultsForRosterIds(rosterId: number) {
    const result = await db
      .selectDistinct({
        id: matchup.id,
      })
      .from(matchup)
      .innerJoin(rosterToMatchup, eq(matchup.id, rosterToMatchup.matchupId))
      .where(eq(rosterToMatchup.rosterId, rosterId));
    return result;
  }

  async getResultsForRoster(rosterId: number, pagination?: PaginationOnly) {
    const ids = await this.getResultsForRosterIds(rosterId);

    if (ids.length === 0) {
      return [];
    }

    return this.getWithResults({
      ids: ids.map((id) => id.id),
      page: pagination?.page,
      pageSize: pagination?.pageSize,
    });
  }

  async getResultsForGroupIds(groupId: number) {
    const result = await db
      .selectDistinct({
        id: matchup.id,
      })
      .from(matchup)
      .innerJoin(rosterToMatchup, eq(matchup.id, rosterToMatchup.matchupId))
      .innerJoin(roster, eq(rosterToMatchup.rosterId, roster.id))
      .innerJoin(participation, eq(roster.participationId, participation.id))
      .where(eq(participation.groupId, groupId));
    return result;
  }

  async getResultsForUserIds(userId: number) {
    const result = await db
      .selectDistinct({
        id: matchup.id,
      })
      .from(matchup)
      .innerJoin(rosterToMatchup, eq(matchup.id, rosterToMatchup.matchupId))
      .innerJoin(roster, eq(rosterToMatchup.rosterId, roster.id))
      .innerJoin(participation, eq(roster.participationId, participation.id))
      .innerJoin(tables.group, eq(participation.groupId, tables.group.id))
      .innerJoin(
        tables.groupToUser,
        eq(tables.group.id, tables.groupToUser.groupId),
      )
      .where(eq(tables.groupToUser.userId, userId));

    return result;
  }

  async getResultsForUser(userId: number, pagination?: PaginationOnly) {
    const ids = await this.getResultsForUserIds(userId);

    if (ids.length === 0) {
      return [];
    }

    return this.getWithResults({
      ids: ids.map((id) => id.id),
      page: pagination?.page,
      pageSize: pagination?.pageSize,
    });
  }

  async getResultsForGroup(groupId: number, pagination?: PaginationOnly) {
    const ids = await this.getResultsForGroupIds(groupId);

    if (ids.length === 0) {
      return [];
    }

    return this.getWithResults({
      ids: ids.map((id) => id.id),
      page: pagination?.page,
      pageSize: pagination?.pageSize,
    });
  }

  async getWithResults(query: QueryMatchupRequestDto & { ids?: number[] }) {
    const result = await db.query.matchup.findMany({
      where: and(
        query.matchupId ? eq(matchup.id, query.matchupId) : undefined,
        query.ids?.length ? inArray(matchup.id, query.ids) : undefined,
        query.stageId ? eq(matchup.stageId, query.stageId) : undefined,
        query.round ? eq(matchup.round, query.round) : undefined,
        query.isFinished ? eq(matchup.isFinished, query.isFinished) : undefined,
        query.challongeMatchupId
          ? eq(matchup.challongeMatchupId, query.challongeMatchupId)
          : undefined,
      ),
      orderBy: [desc(matchup.startDate)],
      limit: query.pageSize ?? 10,
      offset: query.pageSize * (query.page || 1 - 1),
      columns: {
        id: true,
        stageId: true,
        round: true,
        isFinished: true,
        challongeMatchupId: true,
      },
      with: {
        rosterToMatchup: {
          columns: {
            isWinner: true,
            matchupId: true,
            score: true,
          },
          with: {
            roster: {
              columns: {
                id: true,
                stageId: true,
                participationId: true,
                createdAt: true,
              },
              with: {
                participation: {
                  columns: {
                    id: true,
                  },
                  with: {
                    tournament: {
                      columns: {
                        id: true,
                        categoryId: true,
                      },
                    },
                    group: {
                      columns: {
                        id: true,
                        name: true,
                        abbreviation: true,
                        logo: true,
                      },
                    },
                    user: {
                      columns: {
                        id: true,
                        name: true,
                        profilePicture: true,
                        country: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return result;
  }

  async getWithResultsAndScores(id: number) {
    const result = await db.query.matchup.findFirst({
      where: eq(matchup.id, id),
      columns: {
        id: true,
        stageId: true,
        round: true,
        isFinished: true,
        challongeMatchupId: true,
      },
      with: {
        score: {
          columns: {
            id: true,
            roundNumber: true,
            matchupId: true,
            isWinner: true,
          },
          with: {
            scoreToRoster: {
              columns: {
                id: true,
                scoreId: true,
                rosterId: true,
                points: true,
                isWinner: true,
              },
            },
          },
        },
        rosterToMatchup: {
          columns: {
            isWinner: true,
            matchupId: true,
            score: true,
          },
          with: {
            roster: {
              with: {
                participation: {
                  columns: {
                    id: true,
                  },
                  with: {
                    tournament: {
                      columns: {
                        categoryId: true,
                      },
                    },
                    group: {
                      columns: {
                        id: true,
                        name: true,
                        locationId: true,
                        abbreviation: true,
                        logo: true,
                      },
                    },
                    user: {
                      columns: {
                        id: true,
                        username: true,
                        profilePicture: true,
                        country: true,
                      },
                    },
                  },
                },
                players: {
                  columns: {
                    isSubstitute: true,
                  },
                  with: {
                    user: {
                      columns: {
                        id: true,
                        username: true,
                        profilePicture: true,
                        country: true,
                        isFake: true,
                      },
                      with: {
                        career: {
                          columns: {
                            elo: true,
                            categoryId: true,
                            createdAt: true,
                          },
                          with: {
                            category: {
                              columns: {
                                id: true,
                                name: true,
                                image: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return result;
  }

  async getMatchupsByRound(stageId: number, round: number) {
    const query = db
      .select()
      .from(matchup)
      .where(and(eq(matchup.stageId, stageId), eq(matchup.round, round)));

    return await query;
  }
}
