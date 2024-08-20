import { db } from './db';
import * as tables from './schema';
import { PgTable } from 'drizzle-orm/pg-core';
import { faker } from '@faker-js/faker';
import { CreateUserRequest } from '@tournament-app/types';

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
  const randomUsers: CreateUserRequest[] = [];

  for (let i = 0; i < 50; i++) {
    randomUsers.push({
      id: i + 1,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: '$2b$10$De5WinLZL9SL1qhKSHgeS.88OV5R1UcoRLeUEOnOTurMMk7mBVZhO',
      // Password123!, default password for all seed users
      country: faker.location.country(),
      location: faker.location.city(),
      username: faker.internet.userName(),
      bio: faker.lorem.paragraph(),
      profilePicture: faker.image.avatar(),
    } as CreateUserRequest);
  }

  await db.insert(tables.user).values(randomUsers).execute();
}

// TODO: Add other seed tables when developing other endpoints

export async function seed() {
  console.log('Seeding database...');

  await teardown();
  await createUsers();
}
