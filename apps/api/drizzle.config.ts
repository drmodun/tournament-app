import { defineConfig } from 'drizzle-kit';

console.log(process.env.DATABASE_URL);

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './src/db/drizzle',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      'postgres://postgres:postgres@localhost:5432/tournament', //default
  },
});
