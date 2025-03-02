import { Injectable } from '@nestjs/common';
import { category, tournament } from '../db/schema';
import { IUpdateCategoryRequest } from '@tournament-app/types/src/category';
import { PrimaryRepository } from '../base/repository/primaryRepository';
import { BaseQuery } from 'src/base/query/baseQuery';
import { and, asc, eq, gte, ilike, lte, sql, SQL } from 'drizzle-orm';
import {
  CategoryResponsesEnum,
  CategorySortingEnum,
  ICategoryMiniResponseWithLogo,
} from '@tournament-app/types';
import {
  AnyPgSelectQueryBuilder,
  PgColumn,
  PgSelectJoinFn,
} from 'drizzle-orm/pg-core';
import { db } from 'src/db/db';

@Injectable()
export class CategoryDrizzleRepository extends PrimaryRepository<
  typeof category,
  BaseQuery,
  IUpdateCategoryRequest
> {
  constructor() {
    super(category);
  }

  conditionallyJoin<TSelect extends AnyPgSelectQueryBuilder>(
    query: TSelect,
  ):
    | PgSelectJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right'>
    | TSelect {
    return query;
  }

  getValidWhereClause(query: BaseQuery): SQL[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const clauses = Object.entries(query).filter(([_, value]) => value);

    return clauses.map(([key, value]) => {
      switch (key) {
        case 'name':
          return eq(category.name, value as string);
        case 'type':
          return eq(category.type, value as string);
        case 'search':
          return ilike(category.name, `${value}%`);
        default:
          return;
      }
    });
  }

  sortRecord: Record<CategorySortingEnum, PgColumn | SQL<number>> = {
    [CategorySortingEnum.NAME]: category.name,
    [CategorySortingEnum.CREATED_AT]: category.createdAt,
    [CategorySortingEnum.UPDATED_AT]: category.updatedAt,
    [CategorySortingEnum.TOURNAMENT_COUNT]: db.$count(
      tournament,
      eq(tournament.categoryId, category.id),
    ),
  };

  async categoryAutoComplete(
    search: string,
    pageSize: number = 10,
    page: number = 1,
  ): Promise<ICategoryMiniResponseWithLogo[]> {
    return (await db
      .select({
        ...this.getMappingObject(CategoryResponsesEnum.MINI_WITH_LOGO),
      })
      .from(category)
      .where(ilike(category.name, `${search}%`))
      .orderBy(
        sql<number>`CASE WHEN ${category.name} = ${search} THEN 0 ELSE 1 END`,
        asc(category.name),
      )
      .limit(pageSize)
      .offset(
        page ? (page - 1) * pageSize : 0,
      )) as ICategoryMiniResponseWithLogo[];
  }

  getMappingObject(responseEnum: CategoryResponsesEnum) {
    switch (responseEnum) {
      case CategoryResponsesEnum.MINI:
        return {
          id: category.id,
          name: category.name,
        };
      case CategoryResponsesEnum.MINI_WITH_LOGO:
        return {
          ...this.getMappingObject(CategoryResponsesEnum.MINI),
          logo: category.image,
        };
      case CategoryResponsesEnum.BASE:
        const date = new Date();

        return {
          ...this.getMappingObject(CategoryResponsesEnum.MINI_WITH_LOGO),
          description: category.description,
          type: category.type,
          activeTournamentCount: db.$count(
            tournament,
            and(
              eq(tournament.categoryId, category.id),
              gte(tournament.startDate, date),
              lte(tournament.endDate, date),
            ),
          ),
          tournamentCount: db.$count(
            tournament,
            eq(tournament.categoryId, category.id),
          ),
        };
      case CategoryResponsesEnum.EXTENDED:
        return {
          ...this.getMappingObject(CategoryResponsesEnum.BASE),
          updatedAt: category.updatedAt,
          createdAt: category.createdAt,
        };
      default:
        return {};
    }
  }
}
