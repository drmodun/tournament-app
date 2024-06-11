import 'dotenv/config';

import { defineConfig } from 'drizzle-kit';
import { env } from 'process';
export default defineConfig({
  dialect: 'postgresql',
  schema: './schema.ts',
  out: './drizzle',
  dbCredentials: {
    url:
      env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/tournament', //default
  },
});
