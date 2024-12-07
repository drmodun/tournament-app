import { Injectable } from '@nestjs/common';
import { CompositeRepository } from 'src/base/repository/compositeRepository';
import { follower, user } from 'src/db/schema';
import { FollowerQuery } from './dto/request.dto';
import {
  AnyPgSelectQueryBuilder,
  PgSelectJoinFn,
} from 'drizzle-orm/pg-core/query-builders';
import { UserDrizzleRepository } from 'src/users/user.repository';
import {
  FollowerResponsesEnum,
  UserResponsesEnum,
} from '@tournament-app/types';
import { eq, SQL } from 'drizzle-orm';

@Injectable()
export class FollowerDrizzleRepository extends CompositeRepository<
  typeof follower,
  FollowerQuery,
  { userId: number; followerId: number },
  { userId: number; followerId: number }
> {
  constructor(private readonly userDrizzleRepository: UserDrizzleRepository) {
    super(follower);
  }

  public sortRecord = this.userDrizzleRepository.sortRecord;

  getMappingObject(responseType: string) {
    switch (responseType) {
      case FollowerResponsesEnum.FOLLOWER:
        return {
          ...this.userDrizzleRepository.getMappingObject(
            UserResponsesEnum.BASE,
          ),
          createdAt: follower.createdAt,
        };
      case FollowerResponsesEnum.FOLLOWER_MINI:
        return {
          ...this.userDrizzleRepository.getMappingObject(
            UserResponsesEnum.MINI,
          ),
          createdAt: follower.createdAt,
        };
      case FollowerResponsesEnum.FOLLOWING:
        return { ...this.getMappingObject(FollowerResponsesEnum.FOLLOWER) };
      case FollowerResponsesEnum.FOLLOWING_MINI:
        return {
          ...this.getMappingObject(FollowerResponsesEnum.FOLLOWER_MINI),
        };
      default:
        return this.getMappingObject(FollowerResponsesEnum.FOLLOWER);
    }
  }

  conditionallyJoin<TSelect extends AnyPgSelectQueryBuilder>(
    query: TSelect,
    typeEnum: string = FollowerResponsesEnum.FOLLOWER,
  ):
    | PgSelectJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right'>
    | TSelect {
    switch (typeEnum) {
      case FollowerResponsesEnum.FOLLOWER:
        return query.leftJoin(user, eq(follower.followerId, user.id));
      case FollowerResponsesEnum.FOLLOWER_MINI:
        return query.leftJoin(user, eq(follower.followerId, user.id));
      case FollowerResponsesEnum.FOLLOWING_MINI:
        return query.leftJoin(user, eq(follower.userId, user.id));
      case FollowerResponsesEnum.FOLLOWING:
        return query.leftJoin(user, eq(follower.userId, user.id));
      default:
        return query;
    }
  }

  getValidWhereClause(query: FollowerQuery): SQL[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clauses = Object.entries(query).filter(([_, value]) => value);

    return clauses.map(([key, value]) => {
      const field = follower[key];
      if (!field) return;
      const parsed = value;
      switch (key) {
        case 'userId':
          return eq(follower.userId, +parsed);
        case 'followerId':
          return eq(follower.followerId, +parsed);
        default:
          return;
      }
    });
  }
}
