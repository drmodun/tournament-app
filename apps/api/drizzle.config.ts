import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './src/db/drizzle',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      'postgres://postgres:postgres@localhost:5432/tournament', //default for local env, not supposed to be used in prod
  },
});
