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
    return db
      .insert(this.model)
      .values(createRequest as InferInsertModel<TTable>)
      .execute();
  }

/**
 * This TypeScript function updates an entity in a database based on the provided ID and update
 * request, handling exceptions such as 'No values to set'.
 * @param {TCompositeKey} id - The `id` parameter in the `updateEntity` function is of type
 * `TCompositeKey`, which is used to uniquely identify the entity that needs to be updated. It is
 * typically a composite key consisting of multiple key-value pairs that uniquely identify the entity
 * in the database.
 * @param {TCreateRequest} updateRequest - The `updateRequest` parameter in the `updateEntity` function
 * is of type `TCreateRequest`. This parameter is used to provide the new values that will be updated
 * in the entity with the specified `id`. The function updates the entity in the database by setting
 * the values provided in the `update
 * @returns The `updateEntity` function is returning the result of executing an update operation on the
 * database. It sets the values provided in the `updateRequest` object for the entity with the
 * specified `id` (composite key) in the database table represented by `this.model`. The function uses
 * the `id` to construct the WHERE clause for the update operation. If the update operation is
 * successful, it returns
 */
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
