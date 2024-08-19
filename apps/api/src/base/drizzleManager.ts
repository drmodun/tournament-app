import { SQL, WithSubquery } from 'drizzle-orm';
import { PgColumn, PgSelect } from 'drizzle-orm/pg-core';
import { BaseQuery } from '@tournament-app/types';

export abstract class BaseDrizzleRepository<
  TQueryRequest extends BaseQuery,
  TCreateRequest,
> {
  constructor() {}
  public abstract sortRecord: Record<string, PgColumn | SQL<number>>;
  public abstract getMappingObject(responseEnum: string);
  abstract conditionallyJoin<TSelect extends PgSelect>(
    query: TSelect,
    typeEnum: string,
  );

  abstract getValidWhereClause(query: Record<string, unknown>): SQL[];

  abstract getCount(): WithSubquery<string, { value: unknown }>;

  abstract getQuery(query: TQueryRequest);

  abstract getSingleQuery(id: number, responseType: string);

  abstract createEntity(createRequest: TCreateRequest);

  abstract updateEntity(id: number, updateRequest: Partial<TCreateRequest>);

  abstract deleteEntity(id: number);

  abstract entityExists(id: number);

  // TODO: possibly rewrite this function to follow a flow of modifyong the query insetad of having one query function with helper functions
}
