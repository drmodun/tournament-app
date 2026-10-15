// How many rows a seeder creates: the SEED_* environment variable when set, otherwise its default
export function seedCount(variable: string, fallback: number): number {
  return process.env[variable] ? parseInt(process.env[variable], 10) : fallback;
}
