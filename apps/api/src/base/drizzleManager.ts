import { SelectedFields, SQL, WithSubquery } from 'drizzle-orm';
import { AnyPgTable, PgColumn, PgSelect, PgTable } from 'drizzle-orm/pg-core';
import { BaseQuery } from '@tournament-app/types';

export declare abstract class BaseDrizzleQueryManager<
  TTable extends AnyPgTable,
  TQueryRequest extends BaseQuery,
> {
  constructor();
  public abstract sortRecord: Record<string, PgColumn | SQL<number>>;
  public abstract mappingObjectRecord: Record<
    string,
    SelectedFields<PgColumn, TTable | PgTable>
  >;
  abstract conditionallyJoin<TSelect extends PgSelect>(
    query: TSelect,
    typeEnum: string,
  );

  abstract getValidWhereClause(query: Record<string, unknown>): SQL[];

  abstract getCount(): WithSubquery<string, { value: unknown }>;

  abstract getQuery(query: TQueryRequest);

  abstract getSingleQuery(id: number, responseType: string);

  // TODO: possibly rewrite this function to follow a flow of modifyong the query insetad of having one query function with helper functions
}
