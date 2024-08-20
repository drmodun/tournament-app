import { resolve } from 'path';
import { config } from 'dotenv';
import { seed } from '../src/db/seedDefinition';

try {
  config({
    path: resolve('../../', '.env.test.local'),
  });
} catch (error) {
  console.error(
    'No .env.test.local file found, loading .env.test file instead',
  );
  config({
    path: resolve('../../', '.env.test'),
  }); // Load .env.test file, if this fails something is really wrong
}

const initSeed = async () => {
  await seed();
};

initSeed();
