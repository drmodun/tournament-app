import { Injectable } from '@nestjs/common';
import { GroupJoinRequestQuery } from './dto/requests.dto';
import { groupJoinRequest, location } from '../db/schema';
import {
  PgSelectJoinFn,
  AnyPgSelectQueryBuilder,
  PgColumn,
} from 'drizzle-orm/pg-core';
import { BaseQuery } from '../base/query/baseQuery';
import {
  GroupJoinRequestResponsesEnum,
  GroupJoinRequestSortingEnum,
  GroupResponsesEnum,
  UserResponsesEnum,
} from '@tournament-app/types';
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
export class GroupJoinRequestDrizzleRepository extends CompositeRepository<
  typeof groupJoinRequest,
  GroupJoinRequestQuery,
  Partial<InferSelectModel<typeof groupJoinRequest>>,
  {
    userId: number;
    groupId: number;
  }
> {
  constructor(
    private readonly userDrizzleRepository: UserDrizzleRepository,
    private readonly groupDrizzleRepository: GroupDrizzleRepository,
  ) {
    super(groupJoinRequest);
  }

  conditionallyJoin<TSelect extends AnyPgSelectQueryBuilder>(
    query: TSelect,
    typeEnum: GroupJoinRequestResponsesEnum,
  ):
    | PgSelectJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right'>
    | TSelect {
    switch (typeEnum) {
      case GroupJoinRequestResponsesEnum.WITH_USER:
        return query.leftJoin(user, eq(groupJoinRequest.userId, user.id));
      case GroupJoinRequestResponsesEnum.WITH_GROUP:
        return query
          .leftJoin(group, eq(groupJoinRequest.groupId, group.id))
          .leftJoin(location, eq(group.locationId, location.id));
      case GroupJoinRequestResponsesEnum.WITH_MINI_USER:
        return query.leftJoin(user, eq(groupJoinRequest.userId, user.id));
      case GroupJoinRequestResponsesEnum.WITH_MINI_GROUP:
        return query.leftJoin(group, eq(groupJoinRequest.groupId, group.id));
      default:
        return this.conditionallyJoin(
          query,
          GroupJoinRequestResponsesEnum.WITH_USER,
        );
    }
  }

  public getMappingObject(responseEnum: GroupJoinRequestResponsesEnum) {
    switch (responseEnum) {
      case GroupJoinRequestResponsesEnum.WITH_USER:
        return {
          ...this.userDrizzleRepository.getMappingObject(
            UserResponsesEnum.BASE,
          ),
          groupId: groupJoinRequest.groupId,
          message: groupJoinRequest.message,
        };
      case GroupJoinRequestResponsesEnum.WITH_GROUP:
        return {
          ...this.groupDrizzleRepository.getMappingObject(
            GroupResponsesEnum.BASE,
          ),
          userId: groupJoinRequest.userId,
          message: groupJoinRequest.message,
        };
      case GroupJoinRequestResponsesEnum.WITH_MINI_USER:
        return {
          ...this.userDrizzleRepository.getMappingObject(
            UserResponsesEnum.MINI_WITH_PFP,
          ),
          createdAt: groupJoinRequest.createdAt,
        };
      case GroupJoinRequestResponsesEnum.WITH_MINI_GROUP:
        return {
          ...this.groupDrizzleRepository.getMappingObject(
            GroupResponsesEnum.MINI_WITH_LOGO,
          ),
          createdAt: groupJoinRequest.createdAt,
        };
      default:
        return this.getMappingObject(GroupJoinRequestResponsesEnum.WITH_USER);
    }
  }

  public sortRecord: Record<
    string,
    PgColumn<ColumnBaseConfig<ColumnDataType, string>> | SQL<number>
  > = {
    [GroupJoinRequestSortingEnum.CREATED_AT]: groupJoinRequest.createdAt,
  };

  getValidWhereClause(query: BaseQuery): SQL[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clauses = Object.entries(query).filter(([_, value]) => value);

    return clauses
      .map(([key, value]) => {
        switch (key) {
          case 'userId':
            return eq(groupJoinRequest.userId, value as number);
          case 'groupId':
            return eq(groupJoinRequest.groupId, value as number);
          case 'relatedLFPId':
            return eq(groupJoinRequest.relatedLFPId, value as number);
          default:
            return undefined;
        }
      })
      .filter(Boolean);
  }
}
