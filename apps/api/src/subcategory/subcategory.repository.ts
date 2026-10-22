import { Injectable } from '@nestjs/common';
import { and, eq, ilike, SQL } from 'drizzle-orm';
import {
  AnyPgSelectQueryBuilder,
  PgColumn,
  PgSelectJoinFn,
} from 'drizzle-orm/pg-core';
import {
  IUpdateSubcategoryRequest,
  SubcategoryResponsesEnum,
  SubcategorySortingEnum,
} from '@tournament-app/types';
import { PrimaryRepository } from '../base/repository/primaryRepository';
import { db } from '../db/db';
import { category, subcategory, tournament } from '../db/schema';
import { SubcategoryQuery } from './dto/requests.dto';

@Injectable()
export class SubcategoryDrizzleRepository extends PrimaryRepository<
  typeof subcategory,
  SubcategoryQuery,
  IUpdateSubcategoryRequest
> {
  constructor() {
    super(subcategory);
  }

  conditionallyJoin<TSelect extends AnyPgSelectQueryBuilder>(
    query: TSelect,
    typeEnum: SubcategoryResponsesEnum,
  ):
    | PgSelectJoinFn<TSelect, true, 'left' | 'full' | 'inner' | 'right', false>
    | TSelect {
    switch (typeEnum) {
      case SubcategoryResponsesEnum.EXTENDED:
        return query.leftJoin(
          category,
          eq(subcategory.categoryId, category.id),
        );
      default:
        return query;
    }
  }

  getValidWhereClause(query: SubcategoryQuery): SQL[] {
    const clauses = Object.entries(query).filter(([_, value]) => value);

    return clauses
      .map(([key, value]) => {
        switch (key) {
          case 'name':
            return eq(subcategory.name, value as string);
          case 'categoryId':
            return eq(subcategory.categoryId, value as number);
          case 'search':
            return ilike(subcategory.name, `${value}%`);
          default:
            return;
        }
      })
      .filter(Boolean);
  }

  sortRecord: Record<SubcategorySortingEnum, PgColumn | SQL<number>> = {
    [SubcategorySortingEnum.NAME]: subcategory.name,
    [SubcategorySortingEnum.CREATED_AT]: subcategory.createdAt,
    [SubcategorySortingEnum.TOURNAMENT_COUNT]: db.$count(
      tournament,
      eq(tournament.subcategoryId, subcategory.id),
    ),
  };

  getMappingObject(responseEnum: SubcategoryResponsesEnum) {
    switch (responseEnum) {
      case SubcategoryResponsesEnum.MINI:
        return {
          id: subcategory.id,
          name: subcategory.name,
        };
      case SubcategoryResponsesEnum.BASE:
        return {
          ...this.getMappingObject(SubcategoryResponsesEnum.MINI),
          description: subcategory.description,
          image: subcategory.image,
          categoryId: subcategory.categoryId,
          tournamentCount: db.$count(
            tournament,
            eq(tournament.subcategoryId, subcategory.id),
          ),
        };
      case SubcategoryResponsesEnum.EXTENDED:
        return {
          ...this.getMappingObject(SubcategoryResponsesEnum.BASE),
          category: {
            id: category.id,
            name: category.name,
            logo: category.image,
          },
          createdAt: subcategory.createdAt,
        };
      default:
        return null;
    }
  }

  async getCategoryId(id: number) {
    const [row] = await db
      .select({ categoryId: subcategory.categoryId })
      .from(subcategory)
      .where(eq(subcategory.id, id));

    return row?.categoryId;
  }

  async countTournaments(id: number) {
    return db.$count(tournament, eq(tournament.subcategoryId, id));
  }

  async isInCategory(id: number, categoryId: number) {
    const [row] = await db
      .select({ id: subcategory.id })
      .from(subcategory)
      .where(
        and(eq(subcategory.id, id), eq(subcategory.categoryId, categoryId)),
      );

    return !!row;
  }
}
