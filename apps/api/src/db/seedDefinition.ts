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
import { categoryTypeEnum } from '@tournament-app/types';
import {
  tournamentLocationEnum,
  tournamentTypeEnum,
  tournamentTeamTypeEnum,
} from '@tournament-app/types';

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
    email: 'admin@example.com',
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
    sql<string>`ALTER SEQUENCE user_id_seq RESTART WITH ${sql.raw(String(NUM_USERS_TO_CREATE + 3))}`,
  );
}

async function createFollowers() {
  const NUM_OF_USERS = process.env.SEED_USERS_COUNT
    ? parseInt(process.env.SEED_USERS_COUNT, 10)
    : 50;

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

async function createGroupJoinRequests() {
  const NUM_OF_USERS = process.env.SEED_USERS_COUNT
    ? parseInt(process.env.SEED_USERS_COUNT, 10)
    : 50;
  const NUM_OF_GROUPS = process.env.SEED_GROUPS_COUNT
    ? parseInt(process.env.SEED_GROUPS_COUNT, 10)
    : 20;

  const groupJoinRequests = new Set<string>();
  const userIds = Array.from({ length: NUM_OF_USERS }, (_, i) => i + 1);
  const groupIds = Array.from({ length: NUM_OF_GROUPS }, (_, i) => i + 1);

  // Each user requests to join ~10% of groups randomly
  for (const userId of userIds) {
    const numberOfRequests = Math.floor(NUM_OF_GROUPS * 0.1);
    const potentialGroups = groupIds.slice();

    // Shuffle the potential groups array
    for (let i = potentialGroups.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [potentialGroups[i], potentialGroups[j]] = [
        potentialGroups[j],
        potentialGroups[i],
      ];
    }

    // Take the first numberOfRequests groups from the shuffled array
    const requestedGroups = potentialGroups.slice(0, numberOfRequests);

    for (const groupId of requestedGroups) {
      // Create a unique key for this relationship to prevent duplicates
      const relationshipKey = `${groupId}-${userId}`;
      if (!groupJoinRequests.has(relationshipKey)) {
        groupJoinRequests.add(relationshipKey);
      }
    }
  }

  // Convert the Set of relationship keys into actual group join request objects
  const groupJoinRequestObjects = Array.from(groupJoinRequests).map((key) => {
    const [groupId, userId] = key.split('-').map(Number);
    return {
      groupId,
      userId,
      message: faker.lorem.sentence(),
      createdAt: faker.date.past(),
    } satisfies {
      groupId: number;
      userId: number;
      message: string;
      createdAt: Date;
    };
  });

  await db
    .insert(tables.groupJoinRequest)
    .values(groupJoinRequestObjects)
    .execute();
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

  for (let i = 0; i < NUM_OF_GROUPS; i++) {
    for (let j = 0; j < Math.floor(NUM_OF_USERS / 2); j++) {
      groupMemberships.push({
        groupId: i + 1,
        userId: j + 1,
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

async function createGroupInvites() {
  const NUM_OF_USERS = process.env.SEED_USERS_COUNT
    ? parseInt(process.env.SEED_USERS_COUNT, 10)
    : 50;
  const NUM_OF_GROUPS = process.env.SEED_GROUPS_COUNT
    ? parseInt(process.env.SEED_GROUPS_COUNT, 10)
    : 20;

  const groupInvites = new Set<string>();
  const userIds = Array.from({ length: NUM_OF_USERS }, (_, i) => i + 1);
  const groupIds = Array.from({ length: NUM_OF_GROUPS }, (_, i) => i + 1);

  // Each group invites ~10% of users randomly
  for (const groupId of groupIds) {
    const numberOfInvites = Math.floor(NUM_OF_USERS * 0.1);
    const potentialUsers = userIds.slice();

    // Shuffle the potential users array
    for (let i = potentialUsers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [potentialUsers[i], potentialUsers[j]] = [
        potentialUsers[j],
        potentialUsers[i],
      ];
    }

    // Take the first numberOfInvites users from the shuffled array
    const invitedUsers = potentialUsers.slice(0, numberOfInvites);

    for (const userId of invitedUsers) {
      // Create a unique key for this relationship to prevent duplicates
      const relationshipKey = `${groupId}-${userId}`;
      if (!groupInvites.has(relationshipKey)) {
        groupInvites.add(relationshipKey);
      }
    }
  }

  // Convert the Set of relationship keys into actual group invite objects
  const groupInviteObjects = Array.from(groupInvites).map((key) => {
    const [groupId, userId] = key.split('-').map(Number);
    return {
      groupId,
      userId,
      message: faker.lorem.sentence(),
      createdAt: faker.date.past(),
    } satisfies {
      groupId: number;
      userId: number;
      message: string;
      createdAt: Date;
    };
  });

  await db.insert(tables.groupInvite).values(groupInviteObjects).execute();
}

async function createCategories() {
  const categories = [
    {
      id: 1,
      name: 'Programming Competitions',
      description: 'Competitive programming tournaments and hackathons',
      logo: 'https://example.com/programming.jpg',
      type: categoryTypeEnum.PROGRAMMING,
    },
    {
      id: 2,
      name: 'Chess Tournaments',
      description: 'Classical and speed chess competitions',
      logo: 'https://example.com/chess.jpg',
      type: categoryTypeEnum.OTHER,
    },
    {
      id: 3,
      name: 'Esports - League of Legends',
      description: 'Professional and amateur LoL tournaments',
      logo: 'https://example.com/lol.jpg',
      type: categoryTypeEnum.OTHER,
    },
    {
      id: 4,
      name: 'Basketball Leagues',
      description: '3v3 and 5v5 basketball tournaments',
      logo: 'https://example.com/basketball.jpg',
      type: categoryTypeEnum.OTHER,
    },
    {
      id: 5,
      name: 'Quiz Competitions',
      description: 'General knowledge and specialized quiz tournaments',
      logo: 'https://example.com/quiz.jpg',
      type: categoryTypeEnum.OTHER,
    },
  ];

  await db.insert(tables.category).values(categories).execute();

  await db.execute(
    sql<string>`ALTER SEQUENCE category_id_seq RESTART WITH ${sql.raw('6')}`,
  );
}

async function createTournaments() {
  const NUM_TOURNAMENTS_TO_CREATE = process.env.SEED_TOURNAMENTS_COUNT
    ? parseInt(process.env.SEED_TOURNAMENTS_COUNT, 10)
    : 20;

  const tournaments = [];
  const categories = await db.select().from(tables.category);
  const users = await db.select().from(tables.user);
  const groups = await db.select().from(tables.group);

  for (let i = 0; i < NUM_TOURNAMENTS_TO_CREATE; i++) {
    const startDate = faker.date.future();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + faker.number.int({ min: 1, max: 30 }));

    tournaments.push({
      id: i + 1,
      name: faker.company.name() + ' Tournament',
      description: faker.lorem.paragraph(),
      tournamentLocation: faker.helpers.arrayElement(
        Object.values(tournamentLocationEnum),
      ),
      country: faker.location.countryCode(),
      startDate,
      endDate,
      isPublic: faker.datatype.boolean(),
      links: faker.internet.url(),
      tournamentType: faker.helpers.arrayElement(
        Object.values(tournamentTypeEnum),
      ),
      minimumMMR: faker.number.int({ min: 0, max: 2000 }),
      maximumMMR: faker.number.int({ min: 2001, max: 5000 }),
      location: faker.location.city(),
      isMultipleTeamsPerGroupAllowed: faker.datatype.boolean(),
      isFakePlayersAllowed: faker.datatype.boolean(),
      isRanked: faker.datatype.boolean(),
      maxParticipants: faker.helpers.arrayElement([8, 16, 32, 64, 128]),
      tournamentTeamType: faker.helpers.arrayElement(
        Object.values(tournamentTeamTypeEnum),
      ),
      categoryId: faker.helpers.arrayElement(categories).id,
      creatorId: faker.helpers.arrayElement(users).id,
      affiliatedGroupId: faker.datatype.boolean()
        ? faker.helpers.arrayElement(groups).id
        : null,
    });
  }

  await db.insert(tables.tournament).values(tournaments);

  await db.execute(
    sql<string>`ALTER SEQUENCE tournament_id_seq RESTART WITH ${sql.raw(
      String(NUM_TOURNAMENTS_TO_CREATE + 1),
    )}`,
  );
}

// TODO: Add other seed tables when developing other endpoints

export async function seed() {
  console.log('Seeding database...');

  await teardown();
  await createUsers();
  await createFollowers();
  await createGroups();
  await createGroupMemberships();
  await createGroupInvites();
  await createGroupJoinRequests();
  await createCategories();
  await createTournaments();
}
