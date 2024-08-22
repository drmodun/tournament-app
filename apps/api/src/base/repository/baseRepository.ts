import { and, asc, desc, sql, SQL, WithSubquery } from 'drizzle-orm';
import { PgColumn, PgSelect, PgTable, TableConfig } from 'drizzle-orm/pg-core';
import { BaseQuery } from '@tournament-app/types';
import { db } from '../../db/db';

export abstract class BaseDrizzleRepository<
  TTable extends PgTable<TableConfig>,
  TQueryRequest extends BaseQuery,
> {
  constructor(protected readonly model: TTable) {}
  public abstract sortRecord: Record<string, PgColumn | SQL<number>>;
  public abstract getMappingObject(responseEnum: string);
  abstract conditionallyJoin<TSelect extends PgSelect>(
    query: TSelect,
    typeEnum: string,
  );

  abstract getValidWhereClause(query: Record<string, unknown>): SQL[];

  getCount(): WithSubquery<'count', { value: unknown }> {
    return db.$with('count').as(
      db
        .select({
          value: sql`cast(count(*) as int`.as('value'),
        })
        .from(this.model),
    );
  }

  getQuery(query: TQueryRequest = {} as TQueryRequest) {
    const selectedType = this.getMappingObject(query.responseType || 'base');

    const baseQuery = query.returnFullCount
      ? (db
          .with(this.getCount())
          .select(selectedType)
          .from(this.model)
          .$dynamic() as PgSelect<string, typeof selectedType>)
      : (db.select(selectedType).from(this.model).$dynamic() as PgSelect<
          string,
          typeof selectedType
        >);

    const filterQuery = query.query
      ? baseQuery
          .where(and(...this.getValidWhereClause(query.query)))
          .$dynamic()
      : baseQuery;

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
          .offset(
            (query.pagination.page - 1) * (query.pagination.pageSize || 12),
          )
          .$dynamic()
      : sortedQuery.limit(12).offset(0).$dynamic();

    const fullQuery = this.conditionallyJoin(
      paginatedQuery,
      query.responseType || 'base',
    );

    return fullQuery;
  }

  // TODO: think about making a child class or refactoring for composite keys, maybe just make those repositories override this one
}
