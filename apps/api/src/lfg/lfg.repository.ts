import { Injectable } from '@nestjs/common';
import { BaseQuery } from 'src/base/query/baseQuery';
import {
  user,
  category,
  categoryToLFG,
  categoryCareer,
  lookingForGroup,
} from 'src/db/schema';
import {
  LFGResponsesEnum,
  LFGResponsesEnumType,
  LFGSortingEnum,
  UserResponsesEnum,
  CategoryResponsesEnum,
} from '@tournament-app/types';
import { UserDrizzleRepository } from 'src/users/user.repository';
import { CategoryDrizzleRepository } from 'src/category/category.repository';
import {
  and,
  ColumnBaseConfig,
  ColumnDataType,
  eq,
  InferSelectModel,
  sql,
  SQL,
} from 'drizzle-orm';
import { PrimaryRepository } from 'src/base/repository/primaryRepository';
import {
  AnyPgSelectQueryBuilder,
  PgColumn,
  PgSelectJoinFn,
} from 'drizzle-orm/pg-core';
import { db } from 'src/db/db';

@Injectable()
export class LFGDrizzleRepository extends PrimaryRepository<
  typeof lookingForGroup,
  BaseQuery,
  Partial<InferSelectModel<typeof lookingForGroup>>
> {
  constructor(
    private readonly userDrizzleRepository: UserDrizzleRepository,
    private readonly categoryDrizzleRepository: CategoryDrizzleRepository,
  ) {
    super(lookingForGroup);
  }

  insertCategory(categoryId: number, lfgId: number) {
    return db
      .insert(categoryToLFG)
      .values({
        categoryId: categoryId,
        lfgId: lfgId,
      })
      .execute();
  }

  getMappingObject(responseType: LFGResponsesEnumType) {
    switch (responseType) {
      case LFGResponsesEnum.MINI:
        return {
          id: lookingForGroup.id,
          userId: lookingForGroup.userId,
          message: lookingForGroup.message,
          createdAt: lookingForGroup.createdAt,
        };
      case LFGResponsesEnum.MINI_WITH_USER:
        return {
          ...this.getMappingObject(LFGResponsesEnum.MINI),
          user: {
            ...this.userDrizzleRepository.getMappingObject(
              UserResponsesEnum.MINI,
            ),
          },
        };
      case LFGResponsesEnum.MINI_WITH_CATEGORY:
        return {
          ...this.getMappingObject(LFGResponsesEnum.MINI),
          categories: {
            ...this.categoryDrizzleRepository.getMappingObject(
              CategoryResponsesEnum.MINI,
            ),
          },
        };
      case LFGResponsesEnum.BASE:
        return {
          ...this.getMappingObject(LFGResponsesEnum.MINI),
          user: {
            ...this.userDrizzleRepository.getMappingObject(
              UserResponsesEnum.MINI_WITH_COUNTRY,
            ),
          },
          careers: {
            ...this.categoryDrizzleRepository.getMappingObject(
              CategoryResponsesEnum.MINI_WITH_LOGO,
            ),
          },
        };
      default:
        return this.getMappingObject(LFGResponsesEnum.BASE);
    }
  }

  public sortRecord: Record<
    LFGSortingEnum,
    PgColumn<ColumnBaseConfig<ColumnDataType, string>> | SQL<number>
  > = {
    [LFGSortingEnum.CREATED_AT]: lookingForGroup.createdAt,
    [LFGSortingEnum.UPDATED_AT]: lookingForGroup.createdAt,
    [LFGSortingEnum.USER_USERNAME]: sql`"user"."username"`,
    [LFGSortingEnum.CATEGORIES]: sql`"category"."name"`,
  };

  conditionallyJoin<TSelect extends AnyPgSelectQueryBuilder>(
    query: TSelect,
    typeEnum: string,
  ):
    | PgSelectJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right'>
    | TSelect {
    switch (typeEnum) {
      case LFGResponsesEnum.BASE:
        return query
          .leftJoin(categoryToLFG, eq(lookingForGroup.id, categoryToLFG.lfgId))
          .leftJoin(
            categoryCareer,
            and(
              eq(categoryToLFG.categoryId, categoryCareer.categoryId),
              eq(categoryCareer.userId, lookingForGroup.userId),
            ),
          )
          .leftJoin(category, eq(categoryCareer.categoryId, category.id));
      case LFGResponsesEnum.MINI_WITH_USER:
        return query.leftJoin(user, eq(lookingForGroup.userId, user.id));
      case LFGResponsesEnum.MINI_WITH_CATEGORY:
        return query.leftJoin(
          categoryToLFG,
          eq(lookingForGroup.id, categoryToLFG.lfgId),
        );
      default:
        return query;
    }
  }

  protected getBaseQuery() {
    return db.select().from(lookingForGroup);
  }

  getValidWhereClause(query: BaseQuery): SQL[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clauses = Object.entries(query).filter(([_, value]) => value);

    return clauses.map(([key, value]) => {
      const field = lookingForGroup[key];
      if (!field) return;
      const parsed = value;
      switch (key) {
        case 'userId':
          return eq(lookingForGroup.userId, +parsed);
        case 'categoryId':
          return eq(categoryToLFG.categoryId, +parsed);
        case 'message':
          return sql`${lookingForGroup.message} ILIKE ${`%${parsed}%`}`;
        default:
          return;
      }
    });
  }
}
