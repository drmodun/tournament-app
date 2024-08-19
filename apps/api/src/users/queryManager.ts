import { BaseDrizzleQueryManager } from '../base/drizzleManager';
import {
  FullUserQuery,
  UserQuery,
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
import { and, asc, countDistinct, desc, eq, SQL, sql } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserDrizzleQueryManager extends BaseDrizzleQueryManager<
  typeof user,
  FullUserQuery
> {
  getCount() {
    return db
      .$with('user_count')
      .as(db.select({ value: sql`count(*)`.as('value') }).from(user));
  }

  conditionallyJoin<TSelect extends PgSelect>(
    query: TSelect,
    typeEnum: UserResponseEnumType,
  ) {
    switch (typeEnum) {
      case UserResponsesEnum.BASE:
        return query.leftJoin(follower, eq(user.id, follower.userId));

      case UserResponsesEnum.EXTENDED:
        return query
          .leftJoin(follower, eq(user.id, follower.userId))
          .leftJoin(
            alias(follower, 'followingAlias'),
            eq(user.id, follower.followerId),
          );
      case UserResponsesEnum.ADMIN:
        return query
          .leftJoin(follower, eq(user.id, follower.userId))
          .leftJoin(
            alias(follower, 'followingAlias'),
            eq(user.id, follower.followerId),
          );
      default:
        return query;
    }
  }

  public getMappingObject(responseEnum: UserResponseEnumType): {
    [key: string]: PgColumn | SQL;
  } {
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
          followers: countDistinct(follower),
        };
      case UserResponsesEnum.EXTENDED:
        return {
          ...this.getMappingObject(UserResponsesEnum.BASE),
          following: countDistinct(alias(follower, 'followingAlias').userId),
        };
      case UserResponsesEnum.ADMIN:
        return {
          ...this.getMappingObject(UserResponsesEnum.EXTENDED),
          subscription: user.subscription,
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
    const clauses = Object.entries(query).filter(([_, value]) => value);

    return clauses.map(([key, value]) => {
      const field = user[key];
      if (!field) return;

      // TODO: some type fixes

      switch (key) {
        case 'name':
          return eq(user.name, value as string);
        case 'username':
          return eq(user.username, value as string);
        case 'email':
          return eq(user.email, value as string);
        case 'country':
          return eq(user.country, value as string);
        case 'location':
          return eq(user.location, value as string);
        default:
          return;
      }
    });
  }

  getQuery(query: FullUserQuery) {
    const selectedType = this.getMappingObject(
      query.responseType || UserResponsesEnum.BASE,
    );

    const baseQuery = query.returnFullCount
      ? (db
          .with(this.getCount())
          .select(selectedType)
          .from(user)
          .$dynamic() as PgSelect<'user', typeof selectedType>)
      : (db.select(selectedType).from(user).$dynamic() as PgSelect<
          'user',
          typeof selectedType
        >);

    const whereClause = this.getValidWhereClause(query.query);
    const filterQuery = baseQuery.where(and(...whereClause)).$dynamic();
    console.log(...whereClause);

    const sortedQuery = query.sort
      ? filterQuery
          .orderBy(
            query.sort.order === 'asc'
              ? asc(this.sortRecord[query.sort.field])
              : desc(this.sortRecord[query.sort.field]),
          )
          .$dynamic()
      : filterQuery;

    const paginatedQuery = query.pagination
      ? sortedQuery
          .limit(query.pagination.pageSize)
          .offset(query.pagination.page * (query.pagination.pageSize || 12))
          .$dynamic()
      : sortedQuery;

    const fullQuery = this.conditionallyJoin(
      paginatedQuery,
      query.responseType,
    );

    return fullQuery;
  }

  getSingleQuery(id: number, responseType: UserResponseEnumType) {
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

    const fullQuery = this.conditionallyJoin(baseQuery, responseType);

    return fullQuery;
  }
}
