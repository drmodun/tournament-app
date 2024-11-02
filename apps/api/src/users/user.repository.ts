import {
  BaseUserUpdateRequest,
  UserResponseEnumType,
  UserResponsesEnum,
  UserSortingEnum,
  UserSortingEnumType,
} from '@tournament-app/types';
import {
  follower,
  groupToUser,
  organizer,
  participation,
  user,
} from '../db/schema';
import { alias, PgColumn, PgSelect } from 'drizzle-orm/pg-core';
import { db } from '../db/db';
import { and, count, countDistinct, eq, SQL, sql } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';
import { PrimaryRepository } from '../base/repository/primaryRepository';
import { UserQuery } from './dto/requests.dto';

@Injectable()
export class UserDrizzleRepository extends PrimaryRepository<
  typeof user,
  UserQuery,
  BaseUserUpdateRequest
> {
  constructor() {
    super(user);
  }
  conditionallyJoin<TSelect extends PgSelect>(
    query: TSelect,
    typeEnum: UserResponseEnumType,
  ) {
    switch (typeEnum) {
      case UserResponsesEnum.BASE:
        return query
          .leftJoin(follower, eq(user.id, follower.userId))
          .groupBy(user.id);

      case UserResponsesEnum.EXTENDED:
        return query
          .leftJoin(follower, eq(user.id, follower.userId))
          .leftJoin(
            alias(follower, 'followingAlias'),
            eq(user.id, follower.followerId),
          )
          .groupBy(user.id);

      case UserResponsesEnum.ADMIN:
        return query
          .leftJoin(follower, eq(user.id, follower.userId))
          .leftJoin(
            alias(follower, 'followingAlias'),
            eq(user.id, follower.followerId),
          )
          .groupBy(user.id);
      default:
        return query;
    }
  }

  public getMappingObject(responseEnum: UserResponseEnumType) {
    switch (responseEnum) {
      case UserResponsesEnum.MINI:
        return {
          id: user.id,
          username: user.username,
        };
      case UserResponsesEnum.MINI_WITH_PFP:
        return {
          ...this.getMappingObject(UserResponsesEnum.MINI),
          profilePicture: user.profilePicture,
        };
      case UserResponsesEnum.MINI_WITH_COUNTRY:
        return {
          ...this.getMappingObject(UserResponsesEnum.MINI_WITH_PFP),
          country: user.country,
        };
      case UserResponsesEnum.BASE:
        return {
          ...this.getMappingObject(UserResponsesEnum.MINI_WITH_COUNTRY),
          bio: user.bio,
          email: user.email,
          level: user.level,
          updatedAt: user.updatedAt,
          followers: sql<number>`cast(count(${follower.followerId}) as int)`,
        };
      case UserResponsesEnum.EXTENDED:
        return {
          ...this.getMappingObject(UserResponsesEnum.BASE),
          following: count(alias(follower, 'followingAlias')),
          location: user.location,
          createdAt: user.createdAt,
        };
      case UserResponsesEnum.ADMIN:
        return {
          ...this.getMappingObject(UserResponsesEnum.EXTENDED),
          password: user.password,
          role: user.role,
          code: user.code,
        };
      default:
        return {};
    }
  }

  public sortRecord: Record<UserSortingEnumType, PgColumn | SQL<number>> = {
    // Maybe make this into a factory function
    [UserSortingEnum.USERNAME]: user.username,
    [UserSortingEnum.LEVEL]: user.level,
    [UserSortingEnum.COUNTRY]: user.country,
    [UserSortingEnum.LOCATION]: user.location,
    [UserSortingEnum.BETTING_POINTS]: user.bettingPoints,
    [UserSortingEnum.GROUP_JOIN_DATE]: groupToUser.createdAt,
    [UserSortingEnum.TOURNAMENTS_MODERATED]: countDistinct(
      organizer.tournamentId,
    ),
    [UserSortingEnum.TOURNAMENTS_WON]: countDistinct(
      participation.tournamentId, // TODO: add calculation later or scrap allTogether
    ),
    [UserSortingEnum.UPDATED_AT]: user.createdAt,
    [UserSortingEnum.TOURNAMENT_PARTICIPATION]: countDistinct(
      participation.tournamentId,
    ),
  };

  getValidWhereClause(query: UserQuery): SQL[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clauses = Object.entries(query).filter(([_, value]) => value);

    return clauses.map(([key, value]) => {
      const field = user[key];
      if (!field) return;
      const parsed = value as string;

      // TODO: some type fixes

      switch (key) {
        case 'name':
          return eq(user.name, parsed);
        case 'username':
          return eq(user.username, parsed);
        case 'email':
          return eq(user.email, parsed);
        case 'country':
          return eq(user.country, parsed);
        case 'location':
          return eq(user.location, parsed);
        default:
          return;
      }
    });
  }

  getSingleQuery(
    id: number,
    responseType: UserResponseEnumType = UserResponsesEnum.BASE,
  ) {
    const selectedType = this.getMappingObject(responseType);
    const baseQuery = db
      .select(selectedType)
      .from(user)
      .where(
        and(
          eq(user.id, id),
          eq(user.isEmailVerified, true),
          eq(user.hasSelectedInterests, true),
        ),
      )
      .$dynamic() as PgSelect<'user', typeof selectedType>;

    const Query = this.conditionallyJoin(baseQuery, responseType);

    return Query;
  }
}
