import { db } from './db';
import * as tables from './schema';
import { PgTable } from 'drizzle-orm/pg-core';
import { faker } from '@faker-js/faker';
import { sql } from 'drizzle-orm';
import { CreateUserRequest } from 'src/users/dto/requests.dto';
import {
  groupFocusEnum,
  groupRoleEnum,
  groupTypeEnum,
  userRoleEnum,
} from '@tournament-app/types';
import { CreateGroupRequest } from 'src/group/dto/requests.dto';

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

  const adminUser = {
    id: NUM_USERS_TO_CREATE + 1,
    name: 'Admin User',
    email: 'admin@example',
    password: DEFAULT_PASSWORD,
    country: 'United States',
    location: 'San Francisco',
    username: 'admin',
    bio: 'I am an admin user',
    profilePicture: 'https://example.com/admin.jpg',
    isEmailVerified: true,
    role: userRoleEnum.ADMIN,
  } as CreateUserRequest & { isEmailVerified: boolean; role: string };

  const nonAdminUser = {
    id: NUM_USERS_TO_CREATE + 2,
    name: 'Non-Admin User',
    email: 'nonadmin@example',
    password: DEFAULT_PASSWORD,
    country: 'United States',
    location: 'San Francisco',
    username: 'nonadmin',
    bio: 'I am a non-admin user',
    profilePicture: 'https://example.com/nonadmin.jpg',
    isEmailVerified: true,
    role: userRoleEnum.USER,
  } as CreateUserRequest & { isEmailVerified: boolean; role: string };

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
      isEmailVerified: true,
      role: i <= 5 ? userRoleEnum.ADMIN : userRoleEnum.USER,
    } as CreateUserRequest & { isEmailVerified: boolean; role: string });
  }

  await db
    .insert(tables.user)
    .values([...randomUsers, adminUser, nonAdminUser])
    .execute();

  await db.execute(
    sql<string>`ALTER SEQUENCE user_id_seq RESTART WITH ${sql.raw(String(NUM_USERS_TO_CREATE + 1))}`,
  );
}

async function createGroups() {
  const NUM_GROUPS_TO_CREATE = process.env.SEED_GROUPS_COUNT
    ? parseInt(process.env.SEED_GROUPS_COUNT, 10)
    : 50;

  const groupData = [];
  for (let i = 1; i <= NUM_GROUPS_TO_CREATE; i++) {
    groupData.push({
      id: i,
      name: faker.company.name(),
      abbreviation: faker.datatype.string(3),
      description: faker.lorem.sentence(),
      type: groupTypeEnum.PUBLIC,
      focus: groupFocusEnum.HYBRID,
      logo: faker.image.imageUrl(),
      location: faker.location.city(),
      country: faker.location.country(),
    } satisfies CreateGroupRequest & { id: number });
  }

  //TODO: if needed add a few more set seeds for testing

  await db.insert(tables.group).values(groupData).execute();

  await db.execute(
    sql<string>`ALTER SEQUENCE group_id_seq RESTART WITH ${sql.raw(String(NUM_GROUPS_TO_CREATE + 1))}`,
  );
}

async function createGroupMemberships() {
  const NUM_OF_GROUPS = process.env.SEED_GROUPS_COUNT
    ? parseInt(process.env.SEED_GROUPS_COUNT, 10)
    : 50;
  const NUM_OF_USERS = process.env.SEED_USERS_COUNT
    ? parseInt(process.env.SEED_USERS_COUNT, 10)
    : 50;

  const groupMemberships = [];

  const groupIds = Array.from({ length: NUM_OF_GROUPS }, (_, i) => i + 1);
  const userIds = Array.from({ length: NUM_OF_USERS }, (_, i) => i + 1);

  for (let i = 0; i < NUM_OF_GROUPS; i++) {
    for (let j = 0; j < Math.floor(NUM_OF_USERS / 2); j++) {
      groupMemberships.push({
        groupId: groupIds[i],
        userId: userIds[j],
        role:
          i <= 5
            ? i === 0
              ? groupRoleEnum.OWNER
              : groupRoleEnum.ADMIN
            : groupRoleEnum.MEMBER,
      } satisfies {
        groupId: number;
        userId: number;
        role: groupRoleEnum;
      });
    }
  }

  await db.insert(tables.groupToUser).values(groupMemberships).execute();
}

// TODO: Add other seed tables when developing other endpoints

export async function seed() {
  console.log('Seeding database...');

  await teardown();

  await Promise.all([createUsers(), createGroups()]);
  await createGroupMemberships();
}
