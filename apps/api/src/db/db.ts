import 'dotenv/config';

import { drizzle } from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres';

const sql = postgres(
  process.env.DATABASE_URL ||
    'postgres://postgres:postgres@localhost:5432/tournament',
);

export const db = drizzle(sql);
