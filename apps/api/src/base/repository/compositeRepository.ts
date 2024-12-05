import { and, eq, InferInsertModel } from 'drizzle-orm';
import { PgSelect, PgTable, TableConfig } from 'drizzle-orm/pg-core';
import { db } from '../../db/db';
import { NoValuesToSetException } from '../exception/custom/noValuesToSetException.exception';
import { BaseDrizzleRepository } from './baseRepository';
import { BaseQuery } from '../query/baseQuery';

// TODO: try to make this nicer

export abstract class CompositeRepository<
  TTable extends PgTable<TableConfig>,
  TQueryRequest extends BaseQuery,
  TCreateRequest extends Partial<InferInsertModel<TTable>> = Partial<
    InferInsertModel<TTable>
  >,
  TCompositeKey extends Record<string, any> = Record<string, any>,
> extends BaseDrizzleRepository<TTable, TQueryRequest> {
  constructor(model: TTable) {
    super(model);
  }

  getSingleQuery(id: TCompositeKey, responseType: string = 'base') {
    const selectedType = this.getMappingObject(responseType);
    const baseQuery = db
      .select(this.getMappingObject(responseType))
      .from(this.model)
      .where(
        and(
          ...Object.entries(id).map(([key, value]) =>
            eq(this.model[key], value),
          ),
        ),
      )
      .$dynamic() as PgSelect<string, typeof selectedType>;

    const Query = this.conditionallyJoin(baseQuery, responseType);

    return Query;
  }

  createEntity(createRequest: TCreateRequest) {
    return db.insert(this.model).values(createRequest).execute();
  }

  updateEntity(id: TCompositeKey, updateRequest: TCreateRequest) {
    try {
      return db
        .update(this.model)
        .set(updateRequest)
        .where(
          and(
            ...Object.entries(id).map(([key, value]) =>
              eq(this.model[key], value),
            ),
          ),
        )
        .execute();
    } catch (e) {
      if (e.message === 'No values to set') {
        throw new NoValuesToSetException();
      }
      throw e;
    }
  }

  deleteEntity(id: TCompositeKey) {
    return db
      .delete(this.model)
      .where(
        and(
          ...Object.entries(id).map(([key, value]) =>
            eq(this.model[key], value),
          ),
        ),
      )
      .execute();
  }

  async entityExists(id: TCompositeKey) {
    return await db
      .select({})
      .from(this.model)
      .where(
        and(
          ...Object.entries(id).map(([key, value]) =>
            eq(this.model[key], value),
          ),
        ),
      )
      .execute()
      .then((res) => res.length > 0);
  }

  // TODO: think about making a child class or refactoring for composite keys, maybe just make those repositories override this one
}
