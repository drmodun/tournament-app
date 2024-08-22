import { eq, InferInsertModel, sql } from 'drizzle-orm';
import { PgSelect, PgTable, TableConfig } from 'drizzle-orm/pg-core';
import { BaseQuery } from '@tournament-app/types';
import { db } from '../../db/db';
import { NoValuesToSetException } from '../exception/custom/noValuesToSetException.exception';
import { BaseDrizzleRepository } from './baseRepository';

export abstract class PrimaryRepository<
  TTable extends PgTable<TableConfig>,
  TQueryRequest extends BaseQuery,
  TCreateRequest extends Partial<InferInsertModel<TTable>> = Partial<
    InferInsertModel<TTable>
  >,
> extends BaseDrizzleRepository<TTable, TQueryRequest> {
  constructor(model: TTable) {
    super(model);
  }

  SingleQuery(id: number, responseType: string) {
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

  // TODO: think about making a child class or refactoring for composite keys, maybe just make those repositories override this one
}
