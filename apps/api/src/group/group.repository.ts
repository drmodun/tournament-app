import { Injectable } from '@nestjs/common';
import {
  eq,
  SQL,
  sql,
  countDistinct,
  InferInsertModel,
  and,
} from 'drizzle-orm';
import {
  group,
  groupFollower,
  groupToUser,
  participation,
  userGroupBlockList,
  groupInterests,
  category,
  location,
} from '../db/schema';
import {
  ICreateGroupRequest,
  IUpdateGroupRequest,
  GroupResponsesEnum,
  GroupSortingEnum,
  GroupSortingEnumType,
  groupRoleEnum,
} from '@tournament-app/types';
import { PrimaryRepository } from '../base/repository/primaryRepository';
import { GroupQuery } from './dto/requests.dto';
import { GroupDtosEnum, GroupReturnTypesEnumType } from './types';
import {
  AnyPgSelectQueryBuilder,
  PgColumn,
  PgSelectJoinFn,
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
  ):
    | PgSelectJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right'>
    | TSelect {
    switch (typeEnum) {
      case GroupResponsesEnum.BASE:
        return query
          .leftJoin(groupToUser, eq(group.id, groupToUser.groupId))
          .leftJoin(location, eq(group.locationId, location.id))
          .groupBy(group.id);

      case GroupResponsesEnum.EXTENDED:
        return query
          .leftJoin(groupToUser, eq(group.id, groupToUser.groupId))
          .leftJoin(participation, eq(group.id, participation.groupId))
          .leftJoin(groupFollower, eq(group.id, groupFollower.groupId))
          .leftJoin(location, eq(group.locationId, location.id))
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
          locationId: group.locationId,
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
          updatedAt: group.updatedAt,
          memberCount: db.$count(
            groupToUser,
            eq(groupToUser.groupId, group.id),
          ),
          location: {
            id: location.id,
            name: location.name,
            apiId: location.apiId,
            coordinates: location.coordinates,
          },
        };
      case GroupResponsesEnum.EXTENDED:
        return {
          ...this.getMappingObject(GroupResponsesEnum.BASE),
          createdAt: group.createdAt,
          tournamentCount: sql<number>`cast(count(${participation.tournamentId}) as int)`,
          subscriberCount: db.$count(
            groupFollower,
            eq(groupFollower.groupId, group.id),
          ),
        };
      case GroupDtosEnum.TYPE:
        return {
          id: group.id,
          type: group.type,
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
          country: createGroupDto.country,
        } as InferInsertModel<typeof group>)
        .returning();

      await tx.insert(groupToUser).values({
        userId,
        groupId: createdGroup.id,
        role: groupRoleEnum.ADMIN,
      } as InferInsertModel<typeof groupToUser>);

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

      // TODO: implement full text search for title fields (and potentially vector search)

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
        case 'country':
          return eq(group.country, parsed);
        default:
          return;
      }
    });
  }

  async getGroupTournaments(groupId: number) {
    const query = db
      .select({
        tournamentId: participation.tournamentId,
        joinedAt: participation.createdAt,
      })
      .from(participation)
      .where(eq(participation.groupId, groupId));

    return query;
  }

  async getGroupFollowers(groupId: number) {
    const query = db
      .select({
        userId: groupFollower.userId,
        followedAt: groupFollower.createdAt,
      })
      .from(groupFollower)
      .where(eq(groupFollower.groupId, groupId));

    return query;
  }

  async blockGroup(userId: number, groupId: number) {
    await db.insert(userGroupBlockList).values({
      userId,
      blockedGroupId: groupId,
    });
  }

  async unblockGroup(userId: number, groupId: number) {
    await db
      .delete(userGroupBlockList)
      .where(
        and(
          eq(userGroupBlockList.userId, userId),
          eq(userGroupBlockList.blockedGroupId, groupId),
        ),
      );
  }

  async checkIfGroupIsBlocked(userId: number, groupId: number) {
    const exists = await db
      .select()
      .from(userGroupBlockList)
      .where(
        and(
          eq(userGroupBlockList.userId, userId),
          eq(userGroupBlockList.blockedGroupId, groupId),
        ),
      )
      .limit(1);

    return !!exists.length;
  }

  getBlockedGroups(userId: number, page: number, pageSize: number) {
    return db
      .select({
        id: group.id,
        name: group.name,
        abbreviation: group.abbreviation,
        country: group.country,
        logo: group.logo,
      })
      .from(userGroupBlockList)
      .where(eq(userGroupBlockList.userId, userId))
      .rightJoin(group, eq(group.id, userGroupBlockList.blockedGroupId))
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .groupBy(group.id);
  }

  async checkIfGroupInterestExists(groupId: number, categoryId: number) {
    const result = await db
      .select()
      .from(groupInterests)
      .where(
        and(
          eq(groupInterests.groupId, groupId),
          eq(groupInterests.categoryId, categoryId),
        ),
      )
      .limit(1);

    return result.length > 0;
  }

  async createGroupInterest(groupId: number, categoryId: number) {
    await db.insert(groupInterests).values({
      groupId,
      categoryId,
    });
  }

  async deleteGroupInterest(groupId: number, categoryId: number) {
    await db
      .delete(groupInterests)
      .where(
        and(
          eq(groupInterests.groupId, groupId),
          eq(groupInterests.categoryId, categoryId),
        ),
      );
  }

  async getGroupInterests(groupId: number, page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;

    const results = await db
      .select({
        id: category.id,
        name: category.name,
        description: category.description,
        type: category.type,
        image: category.image,
      })
      .from(groupInterests)
      .where(eq(groupInterests.groupId, groupId))
      .innerJoin(category, eq(category.id, groupInterests.categoryId))
      .limit(pageSize)
      .offset(offset);

    return results;
  }
}
