import { SQL, sql } from 'drizzle-orm';

export class LocationHelper {
  static ST_GeographyFromText(wktString: string): SQL<unknown> {
    return sql`ST_GeographyFromText(${wktString})`;
  }

  static ST_DWithin(
    geography1: SQL<unknown>,
    geography2: SQL<unknown>,
    distanceMeters: number,
  ): SQL<unknown> {
    return sql`ST_DWithin(${geography1}, ${geography2}, ${distanceMeters})`;
  }

  static ST_Distance(
    geography1: SQL<unknown>,
    geography2: SQL<unknown>,
  ): SQL<unknown> {
    return sql`ST_Distance(${geography1}, ${geography2})`;
  }

  static ST_Transform(geography: SQL<unknown>, srid: number): SQL<unknown> {
    return sql`ST_Transform(${geography}, ${srid})`;
  }

  static ConvertToWKT(longitude: number, latitude: number): string {
    return `POINT(${longitude} ${latitude})`;
  }
}
