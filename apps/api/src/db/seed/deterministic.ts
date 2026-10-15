import { faker } from '@faker-js/faker';
import { seedCount } from './seedCount';

// The e2e suite relies on specific seeded rows (for example "user 3 has not blocked group 5"),
// so the generated data has to be the same on every run. Set SEED_RANDOM to get a different dataset.
const DEFAULT_RANDOM_SEED = 20250101;

// Runs the callback with faker and Math.random both driven by one fixed seed
export async function withDeterministicRandom<T>(
  callback: () => Promise<T>,
): Promise<T> {
  let state = seedCount('SEED_RANDOM', DEFAULT_RANDOM_SEED);
  const originalRandom = Math.random;

  faker.seed(state);
  // Reference date for faker's relative dates stays "now": tests expect seeded tournaments in the future

  // mulberry32
  Math.random = () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  try {
    return await callback();
  } finally {
    Math.random = originalRandom;
  }
}
