import { Injectable } from '@nestjs/common';
import { CompositeRepository } from 'src/base/repository/compositeRepository';
import { BaseQuery } from 'src/base/query/baseQuery';
import { group, groupToUser, user } from 'src/db/schema';
import {
  GroupMembershipResponsesEnum,
  GroupMembershipSortingEnum,
  GroupMembershipSortType,
  GroupResponsesEnum,
  UserResponsesEnum,
} from '@tournament-app/types';
import { UserDrizzleRepository } from 'src/users/user.repository';
import { GroupDrizzleRepository } from 'src/group/group.repository';
import {
  AnyPgSelectQueryBuilder,
  PgColumn,
  PgJoinFn,
} from 'drizzle-orm/pg-core';
import { eq, SQL } from 'drizzle-orm';

@Injectable()
export class GroupMembershipDrizzleRepository extends CompositeRepository<
  typeof groupToUser,
  BaseQuery,
  { groupId: number; userId: number } | { role: string }
> {
  constructor(
    private readonly userDrizzleRepository: UserDrizzleRepository,
    private readonly groupDrizzleRepository: GroupDrizzleRepository,
  ) {
    super(groupToUser, ['groupId', 'userId']);
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
  ): PgJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right'> | TSelect {
    switch (typeEnum) {
      case GroupMembershipResponsesEnum.BASE:
        return query
          .leftJoin(user, eq(groupToUser.userId, user.id))
          .leftJoin(group, eq(groupToUser.groupId, group.id))
          .groupBy(group.id);
      case GroupMembershipResponsesEnum.MINI:
        return query;
      case GroupMembershipResponsesEnum.USER_MINI_WITH_COUNTRY:
        return query
          .leftJoin(user, eq(user.id, groupToUser.userId))
          .groupBy(group.id);
      case GroupMembershipResponsesEnum.USER_WITH_DATES:
        return query
          .leftJoin(user, eq(user.id, groupToUser.userId))
          .groupBy(group.id);
      case GroupMembershipResponsesEnum.GROUP_MINI:
        return query
          .leftJoin(group, eq(group.id, groupToUser.groupId))
          .groupBy(group.id);
      case GroupMembershipResponsesEnum.GROUP_MINI_WITH_COUNTRY:
        return query
          .leftJoin(group, eq(group.id, groupToUser.groupId))
          .groupBy(group.id);
      case GroupMembershipResponsesEnum.GROUP_WITH_DATES:
        return query
          .leftJoin(group, eq(group.id, groupToUser.groupId))
          .groupBy(group.id);
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
        default:
          return;
      }
    });
  }

  public sortRecord: Record<GroupMembershipSortType, PgColumn | SQL<number>> = {
    [GroupMembershipSortingEnum.CREATED_AT]: groupToUser.createdAt,
    [GroupMembershipSortingEnum.ROLE]: groupToUser.role,
  };
}
