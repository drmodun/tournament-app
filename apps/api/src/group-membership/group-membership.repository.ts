import { Injectable } from '@nestjs/common';
import { CompositeRepository } from 'src/base/repository/compositeRepository';
import { BaseQuery, PaginationOnly } from 'src/base/query/baseQuery';
import { group, groupToUser, user } from 'src/db/schema';
import {
  GroupMembershipResponsesEnum,
  GroupMembershipSortingEnum,
  GroupMembershipSortType,
  GroupResponsesEnum,
  IMiniGroupResponseWithLogo,
  IMiniUserResponseWithProfilePicture,
  UserResponsesEnum,
} from '^tournament-app/types';
import { UserDrizzleRepository } from 'src/users/user.repository';
import { GroupDrizzleRepository } from 'src/group/group.repository';
import {
  AnyPgSelectQueryBuilder,
  PgColumn,
  PgSelectJoinFn,
} from 'drizzle-orm/pg-core';
import { asc, eq, ilike, and, SQL, sql, InferSelectModel } from 'drizzle-orm';
import { IGroupMembershipKey } from './dto/responses.dto';
import { db } from 'src/db/db';
import { GroupMembershipQuery } from './dto/requests.dto';

@Injectable()
export class GroupMembershipDrizzleRepository extends CompositeRepository<
  typeof groupToUser,
  BaseQuery,
  Partial<InferSelectModel<typeof groupToUser>>,
  IGroupMembershipKey
> {
  constructor(
    private readonly userDrizzleRepository: UserDrizzleRepository,
    private readonly groupDrizzleRepository: GroupDrizzleRepository,
  ) {
    super(groupToUser);
  }

  getMappingObject(responseType: string) {
    switch (responseType) {
      case GroupMembershipResponsesEnum.MINI:
        return {
          groupId: groupToUser.groupId,
          userId: groupToUser.userId,
          role: groupToUser.role,
        };
      case GroupMembershipResponsesEnum.BASE:
        return {
          ...this.getMappingObject(GroupMembershipResponsesEnum.MINI),
          createdAt: groupToUser.createdAt,
          user: {
            ...this.userDrizzleRepository.getMappingObject(
              UserResponsesEnum.MINI_WITH_PFP,
            ),
          },
          group: {
            ...this.groupDrizzleRepository.getMappingObject(
              GroupResponsesEnum.MINI_WITH_LOGO,
            ),
          },
        };
      case GroupMembershipResponsesEnum.USER_MINI_WITH_COUNTRY:
        return {
          ...this.userDrizzleRepository.getMappingObject(
            UserResponsesEnum.MINI_WITH_COUNTRY,
          ),
        };
      case GroupMembershipResponsesEnum.USER_WITH_DATES:
        return {
          ...this.userDrizzleRepository.getMappingObject(
            UserResponsesEnum.MINI_WITH_COUNTRY,
          ),
          createdAt: groupToUser.createdAt,
          role: groupToUser.role,
        };
      case GroupMembershipResponsesEnum.GROUP_MINI:
        return {
          ...this.groupDrizzleRepository.getMappingObject(
            GroupResponsesEnum.MINI,
          ),
        };
      case GroupMembershipResponsesEnum.GROUP_MINI_WITH_COUNTRY:
        return {
          ...this.groupDrizzleRepository.getMappingObject(
            GroupResponsesEnum.MINI_WITH_COUNTRY,
          ),
        };
      case GroupMembershipResponsesEnum.GROUP_WITH_DATES:
        return {
          ...this.groupDrizzleRepository.getMappingObject(
            GroupResponsesEnum.MINI_WITH_COUNTRY,
          ),
          createdAt: groupToUser.createdAt,
          role: groupToUser.role,
        };
      default:
        return this.getMappingObject(GroupMembershipResponsesEnum.BASE);
    }
  }

  conditionallyJoin<TSelect extends AnyPgSelectQueryBuilder>(
    query: TSelect,
    typeEnum: string = GroupMembershipResponsesEnum.BASE,
  ):
    | PgSelectJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right'>
    | TSelect {
    switch (typeEnum) {
      case GroupMembershipResponsesEnum.BASE:
        return query
          .leftJoin(user, eq(groupToUser.userId, user.id))
          .leftJoin(group, eq(groupToUser.groupId, group.id));
      case GroupMembershipResponsesEnum.MINI:
        return query;
      case GroupMembershipResponsesEnum.USER_MINI_WITH_COUNTRY:
        return query.leftJoin(user, eq(user.id, groupToUser.userId));
      case GroupMembershipResponsesEnum.USER_WITH_DATES:
        return query.leftJoin(user, eq(user.id, groupToUser.userId));
      case GroupMembershipResponsesEnum.GROUP_MINI:
        return query.leftJoin(group, eq(group.id, groupToUser.groupId));
      case GroupMembershipResponsesEnum.GROUP_MINI_WITH_COUNTRY:
        return query.leftJoin(group, eq(group.id, groupToUser.groupId));
      case GroupMembershipResponsesEnum.GROUP_WITH_DATES:
        return query.leftJoin(group, eq(group.id, groupToUser.groupId));
      default:
        return query;
    }
  }

  getValidWhereClause(query: BaseQuery): SQL[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clauses = Object.entries(query).filter(([_, value]) => value);

    return clauses.map(([key, value]) => {
      const field = groupToUser[key];
      if (!field) return;
      const parsed = value;
      switch (key) {
        case 'groupId':
          return eq(groupToUser.groupId, +parsed);
        case 'userId':
          return eq(groupToUser.userId, +parsed);
        case 'role':
          return eq(groupToUser.role, parsed);
        case 'search':
          return ilike(user.username, `%${parsed}%`);
        default:
          return;
      }
    });
  }

  async autoComplete(
    search: string,
    groupId: number,
    { pageSize = 10, page = 1 }: PaginationOnly,
  ) {
    return (await db
      .select({
        id: groupToUser.userId,
        username: user.username,

        profilePicture: user.profilePicture,
        isFake: user.isFake,
      })
      .from(groupToUser)
      .leftJoin(user, eq(groupToUser.userId, user.id))
      .where(
        and(
          eq(groupToUser.groupId, groupId),
          ilike(user.username, `%${search}%`),
        ),
      )
      .orderBy(
        sql<number>`CASE WHEN ${user.username} = ${search} THEN 0 ELSE 1 END`,
        asc(user.username),
      )
      .limit(pageSize)
      .offset(
        page ? (page - 1) * pageSize : 0,
      )) as IMiniUserResponseWithProfilePicture[];
  }

  async getUnpaginatedUsersInfoOnly(query: GroupMembershipQuery) {
    return await db
      .select({
        id: groupToUser.userId,
        username: user.username,
        email: user.email,
      })
      .from(groupToUser)
      .where(and(...this.getValidWhereClause(query)))
      .leftJoin(user, eq(groupToUser.userId, user.id));
  }

  async autoCompleteGroups(
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
      .from(groupToUser)
      .rightJoin(group, eq(groupToUser.groupId, group.id))
      .where(
        and(ilike(group.name, `%${search}%`), eq(groupToUser.userId, userId)),
      )
      .orderBy(asc(group.name))
      .limit(pageSize)
      .offset(
        page ? (page - 1) * pageSize : 0,
      )) as IMiniGroupResponseWithLogo[];
  }
  public sortRecord: Record<GroupMembershipSortType, PgColumn | SQL<number>> = {
    [GroupMembershipSortingEnum.CREATED_AT]: groupToUser.createdAt,
    [GroupMembershipSortingEnum.ROLE]: groupToUser.role,
  };
}
