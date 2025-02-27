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
import { stageTypeEnum, stageStatusEnum } from '@tournament-app/types';

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

async function createStages() {
  const tournaments = await db.select().from(tables.tournament);
  const stages = [];

  for (const tournament of tournaments) {
    // Create 2-4 stages per tournament
    const numStages = faker.number.int({ min: 2, max: 4 });

    for (let i = 0; i < numStages; i++) {
      const startDate =
        i === 0
          ? tournament.startDate
          : faker.date.between({
              from: tournament.startDate,
              to: tournament.endDate,
            });

      const endDate = faker.date.between({
        from: startDate,
        to: tournament.endDate,
      });

      stages.push({
        id: stages.length + 1,
        name: i === 0 ? 'Group Stage' : `Playoff Stage ${i}`,
        description: faker.lorem.paragraph(),
        startDate,
        endDate,
        stageType: i === 0 ? stageTypeEnum.ROUND_ROBIN : stageTypeEnum.KNOCKOUT,
        stageStatus: faker.helpers.arrayElement(Object.values(stageStatusEnum)),
        stageLocation: faker.helpers.arrayElement(
          Object.values(tournamentLocationEnum),
        ),
        minPlayersPerTeam: faker.number.int({ min: 1, max: 10 }),
        maxPlayersPerTeam: faker.number.int({ min: 1, max: 10 }),
        tournamentId: tournament.id,
      });
    }
  }

  await db.insert(tables.stage).values(stages);

  await db.execute(
    sql<string>`ALTER SEQUENCE event_id_seq RESTART WITH ${sql.raw(
      String(stages.length + 1),
    )}`,
  );
}

async function createParticipations() {
  const NUM_PARTICIPATIONS_TO_CREATE = process.env.SEED_PARTICIPATIONS_COUNT
    ? parseInt(process.env.SEED_PARTICIPATIONS_COUNT, 10)
    : 100;

  const participations = [];
  const tournaments = await db.select().from(tables.tournament);
  const users = await db.select().from(tables.user);
  const groupMemberships = await db.select().from(tables.groupToUser);

  for (let i = 0; i < NUM_PARTICIPATIONS_TO_CREATE; i++) {
    const tournament = faker.helpers.arrayElement(tournaments);
    const user = faker.helpers.arrayElement(users);

    let groupId = null;
    if (tournament.affiliatedGroupId) {
      const userMembership = groupMemberships.find(
        (gm) =>
          gm.userId === user.id && gm.groupId === tournament.affiliatedGroupId,
      );
      if (userMembership) {
        groupId = tournament.affiliatedGroupId;
      }
    }

    participations.push({
      id: i + 1,
      tournamentId: tournament.id,
      userId: user.id,
      groupId,
      points: faker.number.int({ min: 0, max: 1000 }),
      createdAt: faker.date.between({
        from: tournament.startDate,
        to: tournament.endDate,
      }),
    });
  }

  await db.insert(tables.participation).values(participations);

  await db.execute(
    sql<string>`ALTER SEQUENCE participation_participation_id_seq RESTART WITH ${sql.raw(
      String(NUM_PARTICIPATIONS_TO_CREATE + 1),
    )}`,
  );
}

async function createInterests() {
  const userInterests = [];
  const users = await db.select().from(tables.user);
  const categories = await db.select().from(tables.category);

  // Each user has 1-3 interests randomly
  for (const user of users) {
    const numberOfInterests = faker.number.int({ min: 1, max: 3 });
    const shuffledCategories = [...categories].sort(() => 0.5 - Math.random());
    const selectedCategories = shuffledCategories.slice(0, numberOfInterests);

    for (const category of selectedCategories) {
      userInterests.push({
        userId: user.id,
        categoryId: category.id,
        createdAt: faker.date.past(),
      });
    }
  }

  await db.insert(tables.interests).values(userInterests).execute();
}

async function createGroupInterests() {
  const NUM_OF_GROUPS = process.env.SEED_GROUPS_COUNT
    ? parseInt(process.env.SEED_GROUPS_COUNT, 10)
    : 20;

  const groupInterestsList = [];
  const groups = await db.select().from(tables.group);
  const categories = await db.select().from(tables.category);

  // Each group has 1-4 interests randomly
  for (const group of groups) {
    const numberOfInterests = faker.number.int({ min: 1, max: 4 });
    const shuffledCategories = [...categories].sort(() => 0.5 - Math.random());
    const selectedCategories = shuffledCategories.slice(0, numberOfInterests);

    for (const category of selectedCategories) {
      groupInterestsList.push({
        groupId: group.id,
        categoryId: category.id,
      });
    }
  }

  await db.insert(tables.groupInterests).values(groupInterestsList).execute();
}

async function createLocations() {
  const locations = [];
  const NUM_OF_LOCATIONS = process.env.SEED_LOCATIONS_COUNT
    ? parseInt(process.env.SEED_LOCATIONS_COUNT, 10)
    : 100;

  for (let i = 0; i < NUM_OF_LOCATIONS; i++) {
    locations.push({
      id: i + 1,
      name: faker.location.city(),
      coordinates: [faker.location.latitude(), faker.location.longitude()],
      apiId: faker.string.uuid(),
    });
  }

  await db.insert(tables.location).values(locations).execute();

  await db.execute(
    sql<string>`ALTER SEQUENCE location_id_seq RESTART WITH ${sql.raw(
      String(NUM_OF_LOCATIONS + 1), // TODO: check if this screws up indexes
    )}`,
  );
}

async function createGroupRequirements() {
  const groups = await db.select().from(tables.group);
  const categories = await db.select().from(tables.category);
  const requirements = [];
  const eloRequirements = [];

  // Create requirements for about 30% of groups
  for (const group of groups) {
    if (Math.random() < 0.3) {
      const requirement = {
        id: requirements.length + 1,
        groupId: group.id,
        minimumAge: faker.number.int({ min: 13, max: 25 }),
        maximumAge: faker.number.int({ min: 26, max: 60 }),
        isSameCountry: faker.datatype.boolean(),
      };
      requirements.push(requirement);

      // Add 1-3 elo requirements per group
      const numEloRequirements = faker.number.int({ min: 1, max: 3 });
      const shuffledCategories = [...categories].sort(
        () => 0.5 - Math.random(),
      );
      const selectedCategories = shuffledCategories.slice(
        0,
        numEloRequirements,
      );

      for (const category of selectedCategories) {
        const minElo = faker.number.int({ min: 800, max: 2000 });
        eloRequirements.push({
          groupRequirementId: requirement.id,
          categoryId: category.id,
          minimumElo: minElo,
          maximumElo: minElo + faker.number.int({ min: 500, max: 1500 }),
        });
      }
    }
  }

  if (requirements.length > 0) {
    await db.insert(tables.groupRequirements).values(requirements);
    await db.execute(
      sql<string>`ALTER SEQUENCE group_requirements_id_seq RESTART WITH ${sql.raw(
        String(requirements.length + 1),
      )}`,
    );
  }

  if (eloRequirements.length > 0) {
    await db.insert(tables.eloRequirement).values(eloRequirements);
  }
}

async function createCareers() {
  const users = await db.select().from(tables.user);
  const categories = await db.select().from(tables.category);
  const careers = [];

  // Give each user 1-3 careers with specific ELO ranges
  for (const user of users) {
    const numCareers = faker.number.int({ min: 1, max: 3 });
    const shuffledCategories = [...categories].sort(() => 0.5 - Math.random());
    const selectedCategories = shuffledCategories.slice(0, numCareers);

    for (const category of selectedCategories) {
      careers.push({
        userId: user.id,
        categoryId: category.id,
        elo: faker.number.int({ min: 800, max: 3500 }), // Wide range to match filters
        createdAt: faker.date.past(),
      });
    }
  }

  await db.insert(tables.categoryCareer).values(careers);
}

async function createLFG() {
  const users = await db.select().from(tables.user);
  const lfgEntries = [];

  // Create LFG entries for about 40% of users
  for (const user of users) {
    if (Math.random() < 0.4) {
      lfgEntries.push({
        userId: user.id,
        message: faker.lorem.sentence(),
        createdAt: faker.date.recent(),
      });
    }
  }

  await db.insert(tables.lookingForGroup).values(lfgEntries);
}

async function createCategoryToLFG() {
  const lfgEntries = await db.select().from(tables.lookingForGroup);
  const categories = await db.select().from(tables.category);
  const connections = [];

  // Connect each LFG entry to 1-2 categories
  for (const lfg of lfgEntries) {
    const numCategories = faker.number.int({ min: 1, max: 2 });
    const shuffledCategories = [...categories].sort(() => 0.5 - Math.random());
    const selectedCategories = shuffledCategories.slice(0, numCategories);

    for (const category of selectedCategories) {
      connections.push({
        lfgId: lfg.id,
        categoryId: category.id,
      });
    }
  }

  await db.insert(tables.categoryToLFG).values(connections);
}

async function createBlockedUsers() {
  const groups = await db.select().from(tables.group);
  const users = await db.select().from(tables.user);
  const blockedUsers = [];

  // Block 1-3 users in about 20% of groups
  for (const group of groups) {
    if (Math.random() < 0.2) {
      const numBlocked = faker.number.int({ min: 1, max: 3 });
      const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
      const selectedUsers = shuffledUsers.slice(0, numBlocked);

      for (const user of selectedUsers) {
        blockedUsers.push({
          groupId: group.id,
          blockedUserId: user.id,
          createdAt: faker.date.past(),
        });
      }
    }
  }

  await db.insert(tables.groupUserBlockList).values(blockedUsers);
}

// TODO: Add other seed tables when developing other endpoints

export async function seed() {
  console.log('Seeding database...');

  await teardown();
  await createUsers();
  await createLocations();
  await createFollowers();
  await createGroups();
  await createGroupMemberships();
  await createGroupJoinRequests();
  await createGroupInvites();
  await createCategories();
  await createCareers();
  await createLFG();
  await createCategoryToLFG();
  await createBlockedUsers();
  await createTournaments();
  await createStages();
  await createParticipations();
  await createInterests();
  await createGroupInterests();
  await createGroupRequirements();
}
