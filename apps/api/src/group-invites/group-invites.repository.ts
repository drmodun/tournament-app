import { Injectable } from '@nestjs/common';
import { GroupInviteQuery } from './dto/requests.dto';
import { groupInvite, location } from '../db/schema';
import {
  PgSelectJoinFn,
  AnyPgSelectQueryBuilder,
  PgColumn,
} from 'drizzle-orm/pg-core';
import { BaseQuery } from '../base/query/baseQuery';
import {
  GroupInviteResponsesEnum,
  GroupInviteSortingEnum,
  GroupResponsesEnum,
  UserResponsesEnum,
} from '^tournament-app/types';
import { user } from '../db/schema';
import { group } from '../db/schema';
import {
  ColumnBaseConfig,
  ColumnDataType,
  eq,
  InferSelectModel,
  SQL,
} from 'drizzle-orm';
import { CompositeRepository } from 'src/base/repository/compositeRepository';
import { UserDrizzleRepository } from 'src/users/user.repository';
import { GroupDrizzleRepository } from 'src/group/group.repository';

@Injectable()
export class GroupInviteDrizzleRepository extends CompositeRepository<
  typeof groupInvite,
  GroupInviteQuery,
  Partial<InferSelectModel<typeof groupInvite>>,
  {
    userId: number;
    groupId: number;
  }
> {
  constructor(
    private readonly userDrizzleRepository: UserDrizzleRepository,
    private readonly groupDrizzleRepository: GroupDrizzleRepository,
  ) {
    super(groupInvite);
  }

  conditionallyJoin<TSelect extends AnyPgSelectQueryBuilder>(
    query: TSelect,
    typeEnum: GroupInviteResponsesEnum,
  ):
    | PgSelectJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right'>
    | TSelect {
    switch (typeEnum) {
      case GroupInviteResponsesEnum.WITH_USER:
        return query.leftJoin(user, eq(groupInvite.userId, user.id));
      case GroupInviteResponsesEnum.WITH_GROUP:
        return query
          .leftJoin(group, eq(groupInvite.groupId, group.id))
          .leftJoin(location, eq(group.locationId, location.id));
      case GroupInviteResponsesEnum.WITH_MINI_USER:
        return query.leftJoin(user, eq(groupInvite.userId, user.id));
      case GroupInviteResponsesEnum.WITH_MINI_GROUP:
        return query.leftJoin(group, eq(groupInvite.groupId, group.id));
      default:
        return this.conditionallyJoin(
          query,
          GroupInviteResponsesEnum.WITH_USER,
        );
    }
  }

  public getMappingObject(responseEnum: GroupInviteResponsesEnum) {
    switch (responseEnum) {
      case GroupInviteResponsesEnum.WITH_USER:
        return {
          ...this.userDrizzleRepository.getMappingObject(
            UserResponsesEnum.BASE,
          ),
          groupId: groupInvite.groupId,
          message: groupInvite.message,
        };
      case GroupInviteResponsesEnum.WITH_GROUP:
        return {
          ...this.groupDrizzleRepository.getMappingObject(
            GroupResponsesEnum.BASE,
          ),
          userId: groupInvite.userId,
          message: groupInvite.message,
        };
      case GroupInviteResponsesEnum.WITH_MINI_USER:
        return {
          ...this.userDrizzleRepository.getMappingObject(
            UserResponsesEnum.MINI_WITH_PFP,
          ),
          createdAt: groupInvite.createdAt,
        };
      case GroupInviteResponsesEnum.WITH_MINI_GROUP:
        return {
          ...this.groupDrizzleRepository.getMappingObject(
            GroupResponsesEnum.MINI_WITH_LOGO,
          ),
          createdAt: groupInvite.createdAt,
        };
      default:
        return this.getMappingObject(GroupInviteResponsesEnum.WITH_USER);
    }
  }

  public sortRecord: Record<
    string,
    PgColumn<ColumnBaseConfig<ColumnDataType, string>> | SQL<number>
  > = {
    [GroupInviteSortingEnum.CREATED_AT]: groupInvite.createdAt,
  };

  getValidWhereClause(query: BaseQuery): SQL[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clauses = Object.entries(query).filter(([_, value]) => value);

    return clauses
      .map(([key, value]) => {
        switch (key) {
          case 'userId':
            return eq(groupInvite.userId, value as number);
          case 'groupId':
            return eq(groupInvite.groupId, value as number);
          case 'relatedLFGId':
            return eq(groupInvite.relatedLFGId, value as number);
          default:
            return undefined;
        }
      })
      .filter(Boolean);
  }
}
