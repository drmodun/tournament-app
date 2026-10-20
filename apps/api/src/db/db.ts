import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Also used directly for LISTEN/NOTIFY, which Drizzle does not cover
export const pgClient = postgres(
  process.env.DATABASE_URL ||
    'postgres://postgres:postgres@localhost:5432/tournament',
);

export const db = drizzle(pgClient, { schema });
