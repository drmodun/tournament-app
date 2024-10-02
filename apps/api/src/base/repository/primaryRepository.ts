import { ColumnBaseConfig, eq, InferInsertModel, sql } from 'drizzle-orm';
import { PgColumn, PgSelect, PgTable, TableConfig } from 'drizzle-orm/pg-core';
import { db } from '../../db/db';
import { NoValuesToSetException } from '../exception/custom/noValuesToSetException.exception';
import { BaseDrizzleRepository } from './baseRepository';
import { BaseQuery } from '../query/baseQuery';

export interface TableWithId extends PgTable<TableConfig> {
  id: PgColumn<ColumnBaseConfig<'number', 'PgSerial'>>;
}

export abstract class PrimaryRepository<
  TTable extends TableWithId,
  TQueryRequest extends BaseQuery,
  TCreateRequest extends Partial<InferInsertModel<TTable>> = Partial<
    InferInsertModel<TTable>
  >,
> extends BaseDrizzleRepository<TTable, TQueryRequest> {
  SingleQuery(id: number, responseType: string) {
    const selectedType = this.getMappingObject(responseType);
    const baseQuery = db
      .select(this.getMappingObject(responseType))
      .from(this.model)
      .where(eq(this.model.id, id))
      .$dynamic() as PgSelect<string, typeof selectedType>;

    const Query = this.conditionallyJoin(baseQuery, responseType);

    return Query;
  }

  createEntity(createRequest: TCreateRequest) {
    return db
      .insert(this.model)
      .values(createRequest)
      .returning({ id: this.model.id }); // If the id field is not called id then we messed up
  }

  updateEntity(id: number, updateRequest: TCreateRequest) {
    try {
      return db
        .update(this.model)
        .set(updateRequest)
        .where(eq(this.model.id, id))
        .returning({ id: this.model.id });
    } catch (e) {
      if (e.message === 'No values to set') {
        throw new NoValuesToSetException();
      }
      // TODO: potentially improve this
      throw e;
    }
  }

  deleteEntity(id: number) {
    return db.delete(this.model).where(eq(this.model.id, id)).returning({
      id: this.model.id,
    });
  }

  entityExists(id: number) {
    return db
      .select({
        exists: sql`exists(
        select 1 from ${this.model}
        where ${this.model.id} = ${id}
      )`,
      })
      .from(sql`dual`);
  }

  // TODO: think about making a child class or refactoring for composite keys, maybe just make those repositories override this one
}
