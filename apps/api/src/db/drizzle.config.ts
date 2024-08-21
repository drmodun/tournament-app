import 'dotenv/config';

import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import { env } from 'process';

if (env.MODE == 'test') {
  console.log('Test mode');
  try {
    config({ path: '../../../../.env.test.local' });
  } catch (err) {
    console.error(
      'Error loading test environment variables for .env.test.local, trying .env.test',
      err,
    );
    try {
      config({ path: '../../../../.env.test' });
    } catch (err) {
      console.error(
        'Error loading test environment variables for .env.test',
        err,
      );
    }
  }
} else {
  console.log('Not test mode');
  try {
    config({ path: '../../../../.env.local' });
  } catch (err) {
    console.error(
      'Error loading environment variables for .env.local, trying .env',
      err,
    );
    try {
      config({ path: '../../../../.env' });
    } catch (err) {
      console.error('Error loading environment variables for .env', err);
    }
  }
}

// TODO: untangle this both here and on the other instance of .env loading

export default defineConfig({
  dialect: 'postgresql',
  schema: './schema.ts',
  out: './drizzle',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      'postgres://postgres:postgres@localhost:5432/tournament', //default
  },
});
