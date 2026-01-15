import { Injectable } from '@nestjs/common';
import {
  eq,
  SQL,
  countDistinct,
  InferInsertModel,
  and,
  asc,
  sql,
  ilike,
  or,
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
  ICategoryMiniResponseWithLogo,
  IMiniGroupResponseWithLogo,
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
import { BaseQuery, PaginationOnly } from 'src/base/query/baseQuery';

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
          .leftJoin(location, eq(group.locationId, location.id))
          .leftJoin(groupToUser, eq(group.id, groupToUser.groupId));

      case GroupResponsesEnum.EXTENDED:
        return query
          .leftJoin(location, eq(group.locationId, location.id))
          .leftJoin(groupToUser, eq(group.id, groupToUser.groupId))
          .leftJoin(participation, eq(group.id, participation.groupId))
          .leftJoin(groupFollower, eq(group.id, groupFollower.groupId));

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
          tournamentCount: db.$count(
            participation,
            eq(participation.groupId, group.id),
          ),
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
          locationId: createGroupDto.locationId,
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
        case 'search':
          return ilike(group.name, `${parsed}%`);
        default:
          return;
      }
    });
  }

  async groupAutoComplete(
    search: string,
    pageSize: number = 10,
    page: number = 1,
  ): Promise<IMiniGroupResponseWithLogo[]> {
    return (await db
      .select({
        ...this.getMappingObject(GroupResponsesEnum.MINI_WITH_LOGO),
      })
      .from(group)
      .where(ilike(group.name, `${search}%`))
      .orderBy(
        sql<number>`CASE WHEN ${group.name} = ${search} THEN 0 ELSE 1 END`,
        asc(group.name),
      )
      .limit(pageSize)
      .offset(
        page ? (page - 1) * pageSize : 0,
      )) as IMiniGroupResponseWithLogo[];
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

  async searchBlockedGroups(
    search: string,
    userId: number,
    { pageSize = 10, page = 1 }: PaginationOnly,
  ) {
    return (await db
      .select({
        id: group.id,
        name: group.name,
        abbreviation: group.abbreviation,
        country: group.country,
        logo: group.logo,
      })
      .from(userGroupBlockList)
      .rightJoin(group, eq(group.id, userGroupBlockList.blockedGroupId))
      .where(
        and(
          ilike(group.name, `${search}%`),
          eq(userGroupBlockList.userId, userId),
        ),
      )
      .orderBy(
        sql<number>`CASE WHEN ${group.name} = ${search} THEN 0 ELSE 1 END`,
        asc(group.name),
      )
      .limit(pageSize)
      .offset(
        page ? (page - 1) * pageSize : 0,
      )) as IMiniGroupResponseWithLogo[];
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

  async getGroupsEligibleForRosterCreation(
    tournamentId: number,
    userId: number,
  ) {
    const groups: IMiniGroupResponseWithLogo[] = await db
      .select({
        id: group.id,
        name: group.name,
        abbreviation: group.abbreviation,
        locationId: group.locationId,
        logo: group.logo,
      })
      .from(participation)
      .leftJoin(group, eq(participation.groupId, group.id))
      .leftJoin(groupToUser, eq(group.id, groupToUser.groupId))
      .where(
        and(
          eq(participation.tournamentId, tournamentId),
          or(
            eq(groupToUser.role, groupRoleEnum.ADMIN),
            eq(groupToUser.role, groupRoleEnum.OWNER),
          ),
          eq(groupToUser.userId, userId),
        ),
      );

    return groups;
  }
}
