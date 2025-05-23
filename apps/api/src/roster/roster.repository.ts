import { Injectable, NotFoundException } from '@nestjs/common';
import {
  roster,
  user,
  group,
  participation,
  userToRoster,
  stage,
  groupToUser,
} from '../db/schema';
import { PrimaryRepository } from '../base/repository/primaryRepository';
import { BaseQuery } from 'src/base/query/baseQuery';
import {
  eq,
  SQL,
  desc,
  asc,
  inArray,
  and,
  or,
  isNotNull,
  InferInsertModel,
} from 'drizzle-orm';
import {
  RosterResponsesEnum,
  RosterSortingEnum,
  RosterResponseEnumType,
  ICreateRosterRequest,
  IRosterPlayerWithoutCareer,
  IRosterResponse,
  groupRoleEnum,
  IRosterInfoToCreateChallongeParticipant,
} from '@tournament-app/types';
import {
  AnyPgSelectQueryBuilder,
  PgColumn,
  PgSelectJoinFn,
} from 'drizzle-orm/pg-core';
import { db } from '../db/db';
import { QueryRosterDto } from './dto/requests';
import { sql } from 'drizzle-orm';

@Injectable()
export class RosterDrizzleRepository extends PrimaryRepository<
  typeof roster,
  BaseQuery,
  any
> {
  constructor() {
    super(roster);
  }

  conditionallyJoin<TSelect extends AnyPgSelectQueryBuilder>(
    query: TSelect,
    typeEnum: RosterResponseEnumType,
  ):
    | PgSelectJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right'>
    | TSelect {
    switch (typeEnum) {
      case RosterResponsesEnum.BASE:
        return query
          .leftJoin(participation, eq(roster.participationId, participation.id))
          .leftJoin(user, eq(participation.userId, user.id))
          .leftJoin(group, eq(participation.groupId, group.id));

      case RosterResponsesEnum.EXTENDED:
        return query
          .leftJoin(participation, eq(roster.participationId, participation.id))
          .leftJoin(group, eq(participation.groupId, group.id))
          .leftJoin(user, eq(participation.userId, user.id));
      case RosterResponsesEnum.MINI:
        return query
          .leftJoin(participation, eq(roster.participationId, participation.id))
          .leftJoin(group, eq(participation.groupId, group.id))
          .leftJoin(user, eq(participation.userId, user.id));
      default:
        return query;
    }
  }

  async getForPlayer(playerId: number, query: QueryRosterDto) {
    const ids = await this.getRosterIdsForPlayer(playerId);

    if (!ids.length) {
      return [];
    }

    return this.getWithPlayers({ ...query, ids: ids.map((id) => id.rosterId) });
  }

  async getForGroup(groupId: number, query: QueryRosterDto) {
    const [ids] = await this.getRosterIdsForGroup(groupId);

    if (!ids?.roster?.length) {
      return [];
    }

    return this.getWithPlayers({
      ...query,
      ids: ids.roster.map((id) => id.id),
    });
  }

  async getManagedRostersForPlayerIds(stageId: number, playerId: number) {
    return await db
      .select({ id: roster.id })
      .from(roster)
      .leftJoin(stage, eq(stage.id, roster.stageId))
      .leftJoin(participation, eq(participation.id, roster.participationId))
      .leftJoin(groupToUser, eq(groupToUser.groupId, participation.groupId))
      .where(
        and(
          eq(stage.id, stageId),
          eq(groupToUser.userId, playerId),
          or(
            eq(groupToUser.role, groupRoleEnum.ADMIN),
            eq(groupToUser.role, groupRoleEnum.OWNER),
          ),
        ),
      );
  }

  async getManagedRostersForPlayer(stageId: number, playerId: number) {
    const ids = await this.getManagedRostersForPlayerIds(stageId, playerId);

    if (ids.length == 0) return [];

    return this.getWithPlayers({
      ids: ids.map((id) => id.id),
    });
  }

  async getForParticipation(
    participationId: number,
    query: QueryRosterDto = {},
  ) {
    return await this.getWithPlayers({ ...query, participationId });
  }

  async getForTournament(tournamentId: number, query: QueryRosterDto = {}) {
    const ids = await this.getRosterIdsForTournament(tournamentId);

    if (!ids.length) {
      return [];
    }

    return this.getWithPlayers({
      ...query,
      ids: ids.map((id) => id.roster['id']),
    });
  }

  async getForStage(stageId: number, query: QueryRosterDto = {}) {
    return (await this.getWithPlayers({
      ...query,
      stageId,
    })) as unknown as IRosterResponse[]; // Drizzle mapping cannot keep up with such deep relations
  }

  async getWithPlayers(query: QueryRosterDto & { ids?: number[] }) {
    const isCorrectLimit = !!query.page && !!query.pageSize;

    const result = await db.query.roster.findMany({
      where: and(
        query.ids?.length ? inArray(roster.id, query.ids) : undefined,
        query.stageId ? eq(roster.stageId, query.stageId) : undefined,
        query.rosterId ? eq(roster.id, query.rosterId) : undefined,
        query.participationId
          ? eq(roster.participationId, query.participationId)
          : undefined,
        query.rosterId ? eq(roster.id, query.rosterId) : undefined,
      ),
      limit: isCorrectLimit ? query.pageSize : 12,
      offset: isCorrectLimit ? query.pageSize * (query.page - 1) : 0,
      orderBy: query.field
        ? query.order === 'asc'
          ? asc(this.sortRecord[query.field])
          : desc(this.sortRecord[query.field])
        : undefined,
      columns: {
        id: true,
        challongeParticipantId: true,
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
    });

    return result;
  }

  async getOnlyPlayers(
    rosterId: number,
  ): Promise<IRosterPlayerWithoutCareer[]> {
    return await db
      .select({
        user: {
          id: user.id,
          username: user.username,
          profilePicture: user.profilePicture,
          country: user.country,
          isFake: user.isFake,
        },
        isSubstitute: userToRoster.isSubstitute,
      })
      .from(userToRoster)
      .leftJoin(user, eq(userToRoster.userId, user.id))
      .where(eq(userToRoster.rosterId, rosterId));
  }

  async createWithPlayers(
    { members }: ICreateRosterRequest,
    participationId: number,
    stageId: number,
  ) {
    const transaction = await db.transaction(async (tx) => {
      const rosterId = await tx
        .insert(roster)
        .values({
          participationId,
          stageId,
        })
        .returning({ id: roster.id });

      await tx.insert(userToRoster).values(
        members.map((member) => ({
          ...member,
          rosterId: rosterId[0].id,
        })),
      );

      return { rosterId: rosterId?.[0]?.id };
    });
    return transaction;
  }

  createForSinglePlayer(participationId: number, tournamentId: number) {
    const res = db.transaction(async (tx) => {
      const stages = await tx.query.stage.findMany({
        where: eq(stage.tournamentId, tournamentId),
      });
      const rosterId = await tx
        .insert(roster)
        .values(stages.map((stage) => ({ participationId, stageId: stage.id })))
        .returning({ id: roster.id });

      return rosterId;
    });

    return res;
  }

  async createForSinglePlayerForNewStage(stageId: number) {
    const res = await db.transaction(async (tx) => {
      const tournament = await tx.query.stage.findFirst({
        where: eq(stage.id, stageId),
      });

      const participations = await tx.query.participation.findMany({
        where: and(
          eq(participation.tournamentId, tournament.tournamentId),
          isNotNull(participation.userId),
        ),
      });

      if (participations.length === 0) {
        return [];
      }

      const createdRosters = await Promise.all(
        participations.map(async (participation) => {
          const rosterResult = await tx
            .insert(roster)
            .values({ participationId: participation.id, stageId })
            .returning({ id: roster.id });

          if (!rosterResult[0]) {
            console.error(
              'Failed to create roster for participation',
              participation.id,
            );
            return null;
          }

          const rosterId = rosterResult[0].id;

          await tx
            .insert(userToRoster)
            .values({
              userId: participation.userId,
              rosterId,
              isSubstitute: false,
            } as InferInsertModel<typeof userToRoster>)
            .returning();
        }),
      );

      return createdRosters.filter((result) => result !== null);
    });

    return res;
  }

  async updateWithPlayers(id: number, { members }: ICreateRosterRequest) {
    await db.delete(userToRoster).where(eq(userToRoster.rosterId, id));

    await db.insert(userToRoster).values(
      members.map((member) => ({
        ...member,
        rosterId: id,
      })),
    );
  }
  getRosterIdsForPlayer(playerId: number) {
    return db.query.userToRoster.findMany({
      where: eq(userToRoster.userId, playerId),
      columns: {
        rosterId: true,
      },
    });
  }

  async getRosterIdsForGroup(groupId: number) {
    const results = await db.query.participation.findMany({
      where: eq(participation.groupId, groupId),
      columns: {},
      with: {
        roster: {
          columns: {
            id: true,
          },
        },
      },
    });

    return results;
  }

  getRosterIdsForTournament(tournamentId: number) {
    return db.query.participation.findMany({
      where: eq(participation.tournamentId, tournamentId),
      columns: {
        id: true,
      },
      with: {
        roster: {
          columns: {
            id: true,
          },
        },
      },
    });
  }

  getValidWhereClause(query: BaseQuery): SQL[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clauses = Object.entries(query).filter(([_, value]) => value);

    return clauses.map(([key, value]) => {
      switch (key) {
        case 'id':
          return eq(roster.id, value as number);
        case 'stageId':
          return eq(roster.stageId, value as number);
        case 'participationId':
          return eq(roster.participationId, value as number);
        default:
          return;
      }
    });
  }

  sortRecord: Record<RosterSortingEnum, PgColumn | SQL<number>> = {
    [RosterSortingEnum.CREATED_AT]: roster.createdAt,

    [RosterSortingEnum.GROUP_NAME]: group.name,
    [RosterSortingEnum.USER_NAME]: user.username,
    [RosterSortingEnum.RESULT]: roster.id,
  };

  getMappingObject(responseEnum: RosterResponseEnumType) {
    switch (responseEnum) {
      case RosterResponsesEnum.MINI:
        return {
          id: roster.id,
          stageId: roster.stageId,
          participationId: roster.participationId,
          group: {
            id: group.id,
            name: group.name,
            image: group.logo,
          },
          user: {
            id: user.id,
            username: user.username,
            profilePicture: user.profilePicture,
          },
        };
      case RosterResponsesEnum.BASE:
        return {
          ...this.getMappingObject(RosterResponsesEnum.MINI),
          player: {
            id: user.id,
            username: user.username,
            profilePicture: user.profilePicture,
            country: user.country,
          },
          players: {
            id: user.id,
            username: user.username,
            profilePicture: user.profilePicture,
            country: user.country,
          },
          createdAt: roster.createdAt,
        };
      case RosterResponsesEnum.MINI_WITH_CHALLONGE_ID:
        return {
          ...this.getMappingObject(RosterResponsesEnum.MINI),
          challongeId: roster.challongeParticipantId,
        };
      case RosterResponsesEnum.EXTENDED:
        return {
          ...this.getMappingObject(RosterResponsesEnum.BASE),
        };
      default:
        return null;
    }
  }

  async getRostersForChallongeParticipants(
    stageId: number,
  ): Promise<IRosterInfoToCreateChallongeParticipant[]> {
    const rosters = await db
      .select({
        id: roster.id,
        participationId: roster.participationId,
        groupId: group.id,
        groupName: group.name,
        userId: user.id,
        userName: user.username,
      })
      .from(roster)
      .where(eq(roster.stageId, stageId))
      .leftJoin(participation, eq(roster.participationId, participation.id))
      .leftJoin(group, eq(participation.groupId, group.id))
      .leftJoin(user, eq(participation.userId, user.id));

    return rosters.map((rosterData) => ({
      id: rosterData.id,
      participationId: rosterData.participationId,
      name:
        rosterData.groupName ||
        rosterData.userName ||
        `Roster_${rosterData.id}`,
    }));
  }

  async getUsersInStageRosters(stageId: number) {
    const users = await db
      .selectDistinct({
        id: user.id,
        username: user.username,
      })
      .from(userToRoster)
      .leftJoin(roster, eq(userToRoster.rosterId, roster.id))
      .leftJoin(user, eq(userToRoster.userId, user.id))
      .where(eq(roster.stageId, stageId));

    return users;
  }

  async attachChallongeParticipantIdToRosters(
    ids: {
      rosterId: number;
      challongeParticipantId: string;
    }[],
  ) {
    await db.transaction(async (tx) => {
      for (const { rosterId, challongeParticipantId } of ids) {
        await tx.execute(
          sql`UPDATE ${roster} SET challonge_participant_id = ${challongeParticipantId} WHERE id = ${rosterId}`,
        );
      }
    });
  }
}
