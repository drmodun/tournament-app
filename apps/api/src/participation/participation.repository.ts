import { Injectable } from '@nestjs/common';
import { BaseQuery } from 'src/base/query/baseQuery';
import {
  participation,
  group,
  user,
  tournament,
  groupToUser,
} from 'src/db/schema';
import {
  GroupResponsesEnum,
  UserResponsesEnum,
  TournamentResponsesEnum,
  ParticipationResponsesEnum,
  ParticipationResponseEnumType,
  ParticipationSortingEnum,
  groupRoleEnum,
} from '@tournament-app/types';
import { UserDrizzleRepository } from 'src/users/user.repository';
import { GroupDrizzleRepository } from 'src/group/group.repository';
import { TournamentDrizzleRepository } from 'src/tournament/tournament.repository';
import {
  and,
  ColumnBaseConfig,
  ColumnDataType,
  eq,
  gte,
  InferSelectModel,
  or,
  sql,
  SQL,
} from 'drizzle-orm';
import { PrimaryRepository } from 'src/base/repository/primaryRepository';
import {
  AnyPgSelectQueryBuilder,
  PgColumn,
  PgSelectJoinFn,
} from 'drizzle-orm/pg-core';
import { db } from 'src/db/db';

@Injectable()
export class ParticipationDrizzleRepository extends PrimaryRepository<
  typeof participation,
  BaseQuery,
  Partial<InferSelectModel<typeof participation>>
> {
  constructor(
    private readonly userDrizzleRepository: UserDrizzleRepository,
    private readonly groupDrizzleRepository: GroupDrizzleRepository,
    private readonly tournamentDrizzleRepository: TournamentDrizzleRepository,
  ) {
    super(participation);
  }

  getManagedParticipationsForPlayer(tournamentId: number, playerId: number) {
    return db
      .select({
        id: participation.id,
        tournamentId: participation.tournamentId,
        groupId: participation.groupId,
        userId: participation.userId,
        group: this.groupDrizzleRepository.getMappingObject(
          GroupResponsesEnum.MINI_WITH_LOGO,
        ),
      })
      .from(participation)
      .leftJoin(groupToUser, eq(groupToUser.groupId, participation.groupId))
      .leftJoin(group, eq(groupToUser.groupId, group.id))
      .where(
        and(
          eq(participation.tournamentId, tournamentId),
          eq(groupToUser.userId, playerId),
          or(
            eq(groupToUser.role, groupRoleEnum.ADMIN),
            eq(groupToUser.role, groupRoleEnum.OWNER),
          ),
        ),
      );
  }

  getMappingObject(responseType: ParticipationResponseEnumType) {
    switch (responseType) {
      case ParticipationResponsesEnum.MINI:
        return {
          id: participation.id,
          userId: participation.userId,
          groupId: participation.groupId,
          tournamentId: participation.tournamentId,
        };
      case ParticipationResponsesEnum.BASE:
        return {
          ...this.getMappingObject(ParticipationResponsesEnum.MINI),
          createdAt: participation.createdAt,
          points: participation.points,
          tournament: {
            ...this.tournamentDrizzleRepository.getMappingObject(
              TournamentResponsesEnum.MINI,
            ),
          },
          user: {
            ...this.userDrizzleRepository.getMappingObject(
              UserResponsesEnum.MINI_WITH_PFP,
            ),
          },
          group: {
            ...this.groupDrizzleRepository.getMappingObject(
              GroupResponsesEnum.MINI,
            ),
          },
        };
      case ParticipationResponsesEnum.EXTENDED:
        return {
          ...this.getMappingObject(ParticipationResponsesEnum.MINI),
        };
      case ParticipationResponsesEnum.PARTICIPANT:
        return {
          ...this.groupDrizzleRepository.getMappingObject(
            GroupResponsesEnum.MINI_WITH_LOGO,
          ),
          ...this.userDrizzleRepository.getMappingObject(
            UserResponsesEnum.MINI_WITH_PFP,
          ),
        };
      default:
        return this.getMappingObject(ParticipationResponsesEnum.BASE);
    }
  }

  public sortRecord: Record<
    ParticipationSortingEnum,
    PgColumn<ColumnBaseConfig<ColumnDataType, string>> | SQL<number>
  > = {
    [ParticipationSortingEnum.CREATED_AT]: participation.createdAt,
    [ParticipationSortingEnum.NAME]: sql`COALESCE("user"."username", "group"."name")`,
    [ParticipationSortingEnum.IS_FAKE]: sql`COALESCE("user"."isFake", "group"."isFake")`,
    [ParticipationSortingEnum.PLACEMENT]: participation.id,
  };

  conditionallyJoin<TSelect extends AnyPgSelectQueryBuilder>(
    query: TSelect,
    typeEnum: string,
  ):
    | PgSelectJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right'>
    | TSelect {
    switch (typeEnum) {
      case ParticipationResponsesEnum.BASE:
        return query
          .leftJoin(group, eq(participation.groupId, group.id))
          .leftJoin(user, eq(participation.userId, user.id))
          .leftJoin(tournament, eq(participation.tournamentId, tournament.id));
      case ParticipationResponsesEnum.EXTENDED:
        return query;
      case ParticipationResponsesEnum.PARTICIPANT:
        return query
          .rightJoin(participation, eq(participation.userId, user.id))
          .rightJoin(participation, eq(participation.groupId, group.id));
      default:
        return query;
    }
  }

  getValidWhereClause(query: BaseQuery): SQL[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clauses = Object.entries(query).filter(([_, value]) => value);

    return clauses.map(([key, value]) => {
      const field = participation[key];
      if (!field) return;
      const parsed = value;
      switch (key) {
        case 'userId':
          return eq(participation.userId, +parsed);
        case 'groupId':
          return eq(participation.groupId, +parsed);
        case 'tournamentId':
          return eq(participation.tournamentId, +parsed);
        case 'points':
          return gte(participation.points, +parsed);
        default:
          return;
      }
    });
  }
}
