import { Injectable } from '@nestjs/common';
import { eq, SQL, sql, countDistinct } from 'drizzle-orm';
import { group, groupFollower, groupToUser, participation } from '../db/schema';
import {
  ICreateGroupRequest,
  IUpdateGroupRequest,
  GroupResponsesEnum,
  GroupSortingEnum,
  GroupSortingEnumType,
} from '@tournament-app/types';
import { PrimaryRepository } from '../base/repository/primaryRepository';
import { GroupQuery } from './dto/requests.dto';
import { GroupReturnTypesEnumType } from './types';
import {
  AnyPgSelectQueryBuilder,
  PgColumn,
  PgJoinFn,
} from 'drizzle-orm/pg-core';
import { db } from 'src/db/db';
import { BaseQuery } from 'src/base/query/baseQuery';

@Injectable()
export class GroupDrizzleRepository extends PrimaryRepository<
  typeof group,
  GroupQuery,
  IUpdateGroupRequest
> {
  constructor() {
    super(group);
  }

  conditionallyJoin<TSelect extends AnyPgSelectQueryBuilder>(
    query: TSelect,
    typeEnum: GroupReturnTypesEnumType,
  ): PgJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right'> | TSelect {
    switch (typeEnum) {
      case GroupResponsesEnum.BASE:
        return query
          .leftJoin(groupToUser, eq(group.id, groupToUser.groupId))
          .groupBy(group.id);

      case GroupResponsesEnum.EXTENDED:
        return query
          .leftJoin(groupToUser, eq(group.id, groupToUser.groupId))
          .leftJoin(participation, eq(group.id, participation.groupId))
          .leftJoin(groupFollower, eq(group.id, groupFollower.groupId))
          .groupBy(group.id);

      default:
        return query;
    }
  }

  public getMappingObject(responseEnum: GroupReturnTypesEnumType) {
    switch (responseEnum) {
      case GroupResponsesEnum.MINI:
        return {
          id: group.id,
          name: group.name,
          abbreviation: group.abbreviation,
        };
      case GroupResponsesEnum.MINI_WITH_LOGO:
        return {
          ...this.getMappingObject(GroupResponsesEnum.MINI),
          logo: group.logo,
        };
      case GroupResponsesEnum.MINI_WITH_COUNTRY:
        return {
          ...this.getMappingObject(GroupResponsesEnum.MINI),
          country: group.country,
        };
      case GroupResponsesEnum.BASE:
        return {
          ...this.getMappingObject(GroupResponsesEnum.MINI_WITH_COUNTRY),
          description: group.description,
          type: group.type,
          focus: group.focus,
          logo: group.logo,
          location: group.location,
          updatedAt: group.updatedAt,
          memberCount: sql<number>`cast(count(${groupToUser.userId}) as int)`,
        };
      case GroupResponsesEnum.EXTENDED:
        return {
          ...this.getMappingObject(GroupResponsesEnum.BASE),
          createdAt: group.createdAt,
          tournamentCount: sql<number>`cast(count(${participation.tournamentId}) as int)`,
          subscriberCOunt: countDistinct(groupFollower.userId), // FOr testing purposes
        };
      default:
        return this.getMappingObject(GroupResponsesEnum.BASE);
    }
  }

  async createEntityWithUser(
    createGroupDto: ICreateGroupRequest & { userId?: number },
  ) {
    const userId = createGroupDto.userId;

    const newGroup = db.transaction(async (tx) => {
      const [createdGroup] = await tx
        .insert(group)
        .values({
          name: createGroupDto.name,
          abbreviation: createGroupDto.abbreviation,
          description: createGroupDto.description,
          type: createGroupDto.type,
          focus: createGroupDto.focus,
          logo: createGroupDto.logo,
          location: createGroupDto.location,
          country: createGroupDto.country,
        })
        .returning();

      await tx.insert(groupToUser).values({
        userId,
        groupId: createdGroup.id,
        role: 'admin',
      });

      return [{ id: createdGroup.id }];
    });

    return newGroup;
  }

  sortRecord: Record<GroupSortingEnumType, PgColumn | SQL<number>> = {
    [GroupSortingEnum.NAME]: group.name,
    [GroupSortingEnum.CREATED_AT]: group.createdAt,
    [GroupSortingEnum.UPDATED_AT]: group.updatedAt,
    [GroupSortingEnum.MEMBER_COUNT]: countDistinct(groupToUser.userId),
    [GroupSortingEnum.TOURNAMENT_COUNT]: countDistinct(
      participation.tournamentId,
    ),
    [GroupSortingEnum.SUBSCRIBER_COUNT]: countDistinct(groupFollower.userId),
  };

  getValidWhereClause(query: BaseQuery): SQL[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clauses = Object.entries(query).filter(([_, value]) => value);

    return clauses.map(([key, value]) => {
      const field = group[key];
      if (!field) return;
      const parsed = value as string;

      switch (key) {
        case 'name':
          return eq(group.name, parsed);
        case 'abbreviation':
          return eq(group.abbreviation, parsed);
        case 'description':
          return eq(group.description, parsed);
        case 'type':
          return eq(group.type, parsed);
        case 'focus':
          return eq(group.focus, parsed);
        case 'location':
          return eq(group.location, parsed);
        case 'country':
          return eq(group.country, parsed);
        default:
          return;
      }
    });
  }
}
