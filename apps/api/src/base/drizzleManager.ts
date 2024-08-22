import {
  and,
  asc,
  desc,
  eq,
  InferInsertModel,
  sql,
  SQL,
  WithSubquery,
} from 'drizzle-orm';
import { PgColumn, PgSelect, PgTable, TableConfig } from 'drizzle-orm/pg-core';
import { BaseQuery } from '@tournament-app/types';
import { db } from '../db/db';
import { NoValuesToSetException } from './exception/custom/noValuesToSetException.exception';

export abstract class BaseDrizzleRepository<
  TTable extends PgTable<TableConfig>,
  TQueryRequest extends BaseQuery,
  TCreateRequest extends Partial<InferInsertModel<TTable>> = Partial<
    InferInsertModel<TTable>
  >,
> {
  constructor(private readonly model: TTable) {}
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
        .from(this.model)
        .groupBy(this.model['id']),
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

  getSingleQuery(id: number, responseType: string) {
    const selectedType = this.getMappingObject(responseType);
    const baseQuery = db
      .select(this.getMappingObject(responseType))
      .from(this.model)
      .where(eq(this.model['id'], id))
      .$dynamic() as PgSelect<string, typeof selectedType>;

    const fullQuery = this.conditionallyJoin(baseQuery, responseType);

    return fullQuery;
  }

  createEntity(createRequest: TCreateRequest) {
    return db
      .insert(this.model)
      .values(createRequest)
      .returning({ id: this.model['id'] }); // If the id field is not called id then we messed up
  }

  updateEntity(id: number, updateRequest: TCreateRequest) {
    try {
      return db
        .update(this.model)
        .set(updateRequest)
        .where(eq(this.model['id'], id))
        .returning({ id: this.model['id'] });
    } catch (e) {
      if (e.message === 'No values to set') {
        throw new NoValuesToSetException();
      }
      // TODO: potentially improve this
      throw e;
    }
  }

  deleteEntity(id: number) {
    return db.delete(this.model).where(eq(this.model['id'], id)).returning({
      id: this.model['id'],
    });
  }

  entityExists(id: number) {
    return db.select({ exists: sql`exists(${id})` }).from(this.model);
  }

  // TODO: possibly rewrite this function to follow a flow of modifyong the query insetad of having one query function with helper functions
}
