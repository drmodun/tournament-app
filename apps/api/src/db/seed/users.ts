import { db } from '../db';
import * as tables from '../schema';
import { faker } from '@faker-js/faker';
import { sql } from 'drizzle-orm';
import { CreateUserRequest } from 'src/users/dto/requests.dto';
import { userRoleEnum } from '@tournament-app/types';
import { seedCount } from './seedCount';

export async function createUsers() {
  const DEFAULT_PASSWORD =
    '$2b$10$De5WinLZL9SL1qhKSHgeS.88OV5R1UcoRLeUEOnOTurMMk7mBVZhO'; // Password123!
  const NUM_USERS_TO_CREATE = seedCount('SEED_USERS_COUNT', 100);

  const randomUsers: CreateUserRequest[] = [];

  const adminUser = {
    id: NUM_USERS_TO_CREATE + 1,
    name: 'Admin User',
    email: 'admin@example.com',
    password: DEFAULT_PASSWORD,
    country: 'United States',
    username: 'admin',
    bio: 'I am an admin user',
    profilePicture: 'https://example.com/admin.jpg',
    isEmailVerified: true,
    dateOfBirth: faker.date.birthdate(),
    isFake: false,
    role: userRoleEnum.ADMIN,
  } as CreateUserRequest & { isEmailVerified: boolean; role: string };

  const nonAdminUser = {
    id: NUM_USERS_TO_CREATE + 2,
    name: 'Non-Admin User',
    dateOfBirth: faker.date.birthdate(),
    email: 'nonadmin@example',
    password: DEFAULT_PASSWORD,
    country: 'United States',
    isFake: false,
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
      username: faker.internet.userName(),
      bio: faker.lorem.paragraph(),
      isFake: false,
      profilePicture: faker.image.avatar(),
      isEmailVerified: true,
      dateOfBirth: faker.date.birthdate(),
      role: i <= 5 ? userRoleEnum.ADMIN : userRoleEnum.USER,
    } as CreateUserRequest & { isEmailVerified: boolean; role: string });
  }

  await db
    .insert(tables.user)
    .values([...randomUsers, adminUser, nonAdminUser])
    .execute();

  await db.execute(
    sql<string>`ALTER SEQUENCE user_id_seq RESTART WITH ${sql.raw(String(NUM_USERS_TO_CREATE + 3))}`,
  );
}

export async function createFollowers() {
  const NUM_OF_USERS = seedCount('SEED_USERS_COUNT', 100);

  const followers = new Set<string>();
  const userIds = Array.from({ length: NUM_OF_USERS }, (_, i) => i + 1);

  // Each user follows ~20% of other users randomly, without duplicates
  for (const userId of userIds) {
    const numberOfFollowings = Math.floor(NUM_OF_USERS * 0.2);
    const potentialFollowees = userIds.filter((id) => id !== userId);

    // Shuffle the potential followees array
    for (let i = potentialFollowees.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [potentialFollowees[i], potentialFollowees[j]] = [
        potentialFollowees[j],
        potentialFollowees[i],
      ];
    }

    // Take the first numberOfFollowings users from the shuffled array
    const followees = potentialFollowees.slice(0, numberOfFollowings);

    for (const followeeId of followees) {
      // Create a unique key for this relationship to prevent duplicates
      const relationshipKey = `${followeeId}-${userId}`;
      if (!followers.has(relationshipKey)) {
        followers.add(relationshipKey);
      }
    }
  }

  // Convert the Set of relationship keys into actual follower objects
  const followerObjects = Array.from(followers).map((key) => {
    const [userId, followerId] = key.split('-').map(Number);
    return {
      userId,
      followerId,
    } satisfies {
      userId: number;
      followerId: number;
    };
  });

  await db.insert(tables.follower).values(followerObjects).execute();
}
