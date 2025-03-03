import { Injectable } from '@nestjs/common';
import { location } from '../db/schema';
import { PrimaryRepository } from '../base/repository/primaryRepository';
import { BaseQuery } from 'src/base/query/baseQuery';
import { eq, sql, SQL } from 'drizzle-orm';
import {
  LocationResponsesEnum,
  LocationSortingEnum,
} from '@tournament-app/types';
import {
  AnyPgSelectQueryBuilder,
  PgColumn,
  PgSelectJoinFn,
} from 'drizzle-orm/pg-core';
import { db } from 'src/db/db';
import { LocationHelper } from 'src/base/static/locationHelper';

@Injectable()
export class LocationDrizzleRepository extends PrimaryRepository<
  typeof location,
  BaseQuery,
  Partial<{
    name: string;
    apiId: string;
    coordinates: string;
  }>
> {
  constructor() {
    super(location);
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
          return eq(location.name, value as string);
        case 'apiId':
          return eq(location.apiId, value as string);
        case 'distance':
          if (!query['lat'] || !query['lng']) {
            throw new Error('lat and lng are required for distance query');
          }

          const point = LocationHelper.ConvertToWKT(query['lng'], query['lat']);
          const convertedPoint = LocationHelper.ST_GeographyFromText(point);

          return sql`ST_DWithin(
            ${location.coordinates},
            ${convertedPoint},
            ${query['distance']}
          )`;
        default:
          return;
      }
    });
  }

  sortRecord: Record<LocationSortingEnum, PgColumn | SQL<number>> = {
    [LocationSortingEnum.NAME]: location.name,
    [LocationSortingEnum.CREATED_AT]: location.createdAt,
    [LocationSortingEnum.UPDATED_AT]: location.createdAt,
    [LocationSortingEnum.LAT]: location.coordinates[1],
    [LocationSortingEnum.LNG]: location.coordinates[0],
    // separate lat and lng for distance query since distance query is most likely separated from the other queries
  };

  getMappingObject(responseEnum: LocationResponsesEnum) {
    switch (responseEnum) {
      case LocationResponsesEnum.MINI:
        return {
          id: location.id,
          apiId: location.apiId,
        };
      case LocationResponsesEnum.BASE:
        return {
          ...this.getMappingObject(LocationResponsesEnum.MINI),
          name: location.name,
          coordinates: sql`ST_AsGeoJSON(${location.coordinates})`.mapWith(
            (x) => JSON.parse(x).coordinates,
          ),
        };
      case LocationResponsesEnum.EXTENDED:
        return {
          ...this.getMappingObject(LocationResponsesEnum.BASE),
          createdAt: location.createdAt,
        };
      default:
        return null;
    }
  }

  async getMap() {
    return db
      .select({
        id: location.id,
        name: location.name,
        coordinates: sql`ST_AsGeoJSON(${location.coordinates})`.mapWith(
          (x) => JSON.parse(x).coordinates,
        ),
      })
      .from(location);
  }
}
