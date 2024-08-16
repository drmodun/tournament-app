import { BaseDrizzleQueryManager } from 'src/base/drizzleManager';
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
} from 'src/db/schema';
import { alias, PgColumn, PgSelect } from 'drizzle-orm/pg-core';
import { db } from 'src/db/db';
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

  public mappingObjectRecord: Record<
    UserResponseEnumType,
    {
      [key: string]: PgColumn | SQL;
    }
  > = {
    [UserResponsesEnum.MINI]: {
      id: user.id,
      username: user.username,
    },
    [UserResponsesEnum.MINI_WITH_PFP]: {
      ...this.mappingObjectRecord.mini,
      profilePicture: user.profilePicture,
    },
    [UserResponsesEnum.MINI_WITH_COUNTRY]: {
      ...this.mappingObjectRecord['mini-with-pfp'],
      country: user.country,
    },
    [UserResponsesEnum.BASE]: {
      ...this.mappingObjectRecord['mini-with-country'],
      bio: user.bio,
      email: user.email,
      level: user.level,
      updatedAt: user.updatedAt,
      followers: countDistinct(follower),
    },
    [UserResponsesEnum.EXTENDED]: {
      ...this.mappingObjectRecord.base,
      following: countDistinct(alias(follower, 'followingAlias').userId), //TODO: think to implement this by alias later
    },
    [UserResponsesEnum.ADMIN]: {
      ...this.mappingObjectRecord.extended,
      subscription: user.subscription,
      password: user.password,
      role: user.role,
      code: user.code,
    },
  };

  public sortRecord: Record<UserSortingEnumType, PgColumn | SQL<number>> = {
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

      const typeCheck = typeof value === typeof field;
      if (!typeCheck) return;

      const typedValue = value as typeof field;

      switch (key) {
        case 'name':
          return eq(user.name, typedValue);
        case 'username':
          return eq(user.username, typedValue);
        case 'email':
          return eq(user.email, typedValue);
        case 'country':
          return eq(user.country, typedValue);
        case 'location':
          return eq(user.location, typedValue);
        default:
          return;
      }
    });
  }

  getQuery(query: FullUserQuery) {
    const selectedType = this.mappingObjectRecord[query.responseType || 'base'];

    const baseQuery = db
      .with(query.returnFullCount && this.getCount()) // Should just skip if not asked full count
      .select(selectedType)
      .from(user)
      .$dynamic() as PgSelect<'user', typeof selectedType>;

    if (query.query) {
      const whereClause = this.getValidWhereClause(query.query);
      if (whereClause.length) {
        baseQuery.where(and(...whereClause));
      }
    }

    if (query.sort) {
      baseQuery.orderBy(
        query.sort.order === 'asc'
          ? asc(this.sortRecord[query.sort.field])
          : desc(this.sortRecord[query.sort.field]),
      );
    }

    if (query.pagination) {
      baseQuery
        .limit(query.pagination.pageSize)
        .offset(query.pagination.page * (query.pagination.pageSize || 12));
    }

    const fullQuery = this.conditionallyJoin(baseQuery, query.responseType);

    return fullQuery;
  }

  getSingleQuery(id: number, responseType: UserResponseEnumType) {
    const selectedType = this.mappingObjectRecord[responseType];
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
      .$dynamic() as PgSelect<
      'user',
      (typeof this.mappingObjectRecord)[UserResponseEnumType]
    >;

    const fullQuery = this.conditionallyJoin(baseQuery, responseType);

    return fullQuery;
  }
}
