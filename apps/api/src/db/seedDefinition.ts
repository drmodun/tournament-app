import { db } from './db';
import * as tables from './schema';
import { PgTable } from 'drizzle-orm/pg-core';
import { faker } from '@faker-js/faker';
import { sql } from 'drizzle-orm';
import { CreateUserRequest } from 'src/users/dto/requests.dto';

async function teardown() {
  console.log('Teardown database...');

  try {
    const tablesToDelete = Object.entries(tables);

    const deletions = tablesToDelete.map(async ([tableName, table]) => {
      try {
        if (table instanceof PgTable) {
          console.log(`Dropping all rows from table ${tableName}`);
          await db.delete(table);
        }
      } catch (err) {
        console.error(`Error deleting table ${tableName}`, err);
      }
    });

    await Promise.all(deletions);
  } catch (err) {
    console.error('Error deleting tables', err);
  }
}

async function createUsers() {
  const DEFAULT_PASSWORD =
    '$2b$10$De5WinLZL9SL1qhKSHgeS.88OV5R1UcoRLeUEOnOTurMMk7mBVZhO'; // Password123!
  const NUM_USERS_TO_CREATE = process.env.SEED_USERS_COUNT
    ? parseInt(process.env.SEED_USERS_COUNT, 10)
    : 50;

  const randomUsers: CreateUserRequest[] = [];

  for (let i = 0; i < NUM_USERS_TO_CREATE; i++) {
    randomUsers.push({
      id: i + 1,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: DEFAULT_PASSWORD,
      // Password123!, default password for all seed users
      country: faker.location.country(),
      location: faker.location.city(),
      username: faker.internet.userName(),
      bio: faker.lorem.paragraph(),
      profilePicture: faker.image.avatar(),
    } as CreateUserRequest);
  }

  await db.insert(tables.user).values(randomUsers).execute();
  await db.execute(
    sql<string>`ALTER SEQUENCE user_id_seq RESTART WITH ${sql.raw(String(NUM_USERS_TO_CREATE + 1))}`,
  );
}
// TODO: Add other seed tables when developing other endpoints

export async function seed() {
  console.log('Seeding database...');

  await teardown();
  await createUsers();
}
