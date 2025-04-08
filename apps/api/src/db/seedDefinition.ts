import { db } from './db';
import * as tables from './schema';
import { faker } from '@faker-js/faker';
import { InferInsertModel, sql, eq, asc, and } from 'drizzle-orm';
import { CreateUserRequest } from 'src/users/dto/requests.dto';
import {
  groupFocusEnum,
  groupRoleEnum,
  groupTypeEnum,
  userRoleEnum,
  quizQuestionTypeEnum,
} from '@tournament-app/types';
import { CreateGroupRequest } from 'src/group/dto/requests.dto';
import { categoryTypeEnum } from '@tournament-app/types';
import {
  tournamentLocationEnum,
  tournamentTypeEnum,
  tournamentTeamTypeEnum,
} from '@tournament-app/types';
import { stageTypeEnum, stageStatusEnum } from '@tournament-app/types';
import { LocationHelper } from '../base/static/locationHelper';
import { BracketGenerator } from '../matches/bracket.generator';
import { RosterDrizzleRepository } from '../roster/roster.repository';

async function teardown() {
  console.log('Teardown database...');

  try {
    // Delete tables in order of dependencies (child tables first)
    const tableDeleteOrder = [
      // Quiz-related tables first
      tables.quizAnswer,
      tables.quizAttempt,
      tables.quizOption,
      tables.quizQuestion,
      tables.quizTags,
      tables.quiz,

      // Relationship tables first
      tables.scoreToRoster,
      tables.score,
      tables.rosterToMatchup,
      tables.matchup,
      tables.stageRound,
      tables.categoryToLFP,
      tables.categoryToLFG,
      tables.categoryCareer,
      tables.interests,
      tables.groupInterests,
      tables.eloRequirement,
      tables.participation,
      tables.userToRoster,
      tables.roster,

      // Join/Request tables
      tables.groupJoinRequest,
      tables.groupInvite,
      tables.groupToUser,

      // Block lists
      tables.groupUserBlockList,
      tables.userGroupBlockList,

      // Activity tables
      tables.follower,
      tables.lookingForPlayers,
      tables.lookingForGroup,
      tables.stage,

      // Main entity tables with foreign keys
      tables.tournament,
      tables.groupRequirements,
      tables.group,
      tables.category,
      tables.location,

      // Base tables
      tables.user,
    ];

    for (const table of tableDeleteOrder) {
      try {
        console.log(`Dropping all rows from table ${table.name}`);
        await db.delete(table);
      } catch (err) {
        console.error(`Error deleting table ${table.name}:`, err);
      }
    }
  } catch (err) {
    console.error('Error during teardown:', err);
  }
}

async function createUsers() {
  const DEFAULT_PASSWORD =
    '$2b$10$De5WinLZL9SL1qhKSHgeS.88OV5R1UcoRLeUEOnOTurMMk7mBVZhO'; // Password123!
  const NUM_USERS_TO_CREATE = process.env.SEED_USERS_COUNT
    ? parseInt(process.env.SEED_USERS_COUNT, 10)
    : 100;

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
    : 100;

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
    : 100;
  const NUM_OF_GROUPS = process.env.SEED_GROUPS_COUNT
    ? parseInt(process.env.SEED_GROUPS_COUNT, 10)
    : 100;

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
    : 500;

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
      locationId: faker.number.int({ min: 1, max: 100 }),
      country: faker.location.country(),
    } satisfies CreateGroupRequest & { id: number });
  }

  await db.insert(tables.group).values(groupData).execute();

  await db.execute(
    sql<string>`ALTER SEQUENCE group_id_seq RESTART WITH ${sql.raw(
      String(groupData.length + 1),
    )}`,
  );
}

async function createGroupMemberships() {
  const groupMemberships = [];
  const users = await db.select().from(tables.user);
  const groups = await db.select().from(tables.group);

  // For each group, create a structured membership hierarchy
  for (const group of groups) {
    // 1. Always assign an owner (1 per group)
    const ownerUser = faker.helpers.arrayElement(users);
    groupMemberships.push({
      groupId: group.id,
      userId: ownerUser.id,
      role: groupRoleEnum.OWNER,
    });

    // 2. Assign 1-3 admins (excluding owner)
    const adminCount = faker.number.int({ min: 1, max: 3 });
    const potentialAdmins = users.filter((u) => u.id !== ownerUser.id);
    const selectedAdmins = faker.helpers.arrayElements(
      potentialAdmins,
      adminCount,
    );

    for (const admin of selectedAdmins) {
      groupMemberships.push({
        groupId: group.id,
        userId: admin.id,
        role: groupRoleEnum.ADMIN,
      });
    }

    // 3. Assign members (between 20% and 40% of remaining users, excluding owner and admins)
    const usedUserIds = new Set([
      ownerUser.id,
      ...selectedAdmins.map((a) => a.id),
    ]);
    const remainingUsers = users.filter((u) => !usedUserIds.has(u.id));

    // Calculate number of regular members (20-40% of remaining users)
    const memberCount = Math.floor(
      remainingUsers.length * faker.number.float({ min: 0.2, max: 0.4 }),
    );

    const selectedMembers = faker.helpers.arrayElements(
      remainingUsers,
      memberCount,
    );

    for (const member of selectedMembers) {
      groupMemberships.push({
        groupId: group.id,
        userId: member.id,
        role: groupRoleEnum.MEMBER,
      });
    }
  }

  // Ensure each user is in at least one group
  const usersInGroups = new Set(groupMemberships.map((m) => m.userId));
  const usersNotInGroups = users.filter((u) => !usersInGroups.has(u.id));

  for (const user of usersNotInGroups) {
    // Assign to a random group as a member
    const randomGroup = faker.helpers.arrayElement(groups);
    groupMemberships.push({
      groupId: randomGroup.id,
      userId: user.id,
      role: groupRoleEnum.MEMBER,
    });
  }

  await db.insert(tables.groupToUser).values(groupMemberships).execute();
}

async function createGroupInvites() {
  const NUM_OF_USERS = process.env.SEED_USERS_COUNT
    ? parseInt(process.env.SEED_USERS_COUNT, 10)
    : 100;
  const NUM_OF_GROUPS = process.env.SEED_GROUPS_COUNT
    ? parseInt(process.env.SEED_GROUPS_COUNT, 10)
    : 100;

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
    {
      id: 6,
      name: 'Other',
      description: 'Other categories',
      logo: 'https://example.com/other.jpg',
      type: categoryTypeEnum.OTHER,
    },
    {
      id: 7,
      name: 'Programming Competitions',
      description: 'Competitive programming tournaments and hackathons',
      logo: 'https://example.com/programming.jpg',
      type: categoryTypeEnum.PROGRAMMING,
    },
    {
      id: 8,
      name: 'Chess Tournaments',
      description: 'Classical and speed chess competitions',
      logo: 'https://example.com/chess.jpg',
      type: categoryTypeEnum.OTHER,
    },
    {
      id: 9,
      name: 'Esports - League of Legends',
      description: 'Professional and amateur LoL tournaments',
      logo: 'https://example.com/lol.jpg',
      type: categoryTypeEnum.OTHER,
    },
    {
      id: 10,
      name: 'Basketball Leagues',
      description: '3v3 and 5v5 basketball tournaments',
      logo: 'https://example.com/basketball.jpg',
      type: categoryTypeEnum.OTHER,
    },
  ];

  await db.insert(tables.category).values(categories).execute();

  await db.execute(
    sql<string>`ALTER SEQUENCE category_id_seq RESTART WITH ${sql.raw(
      String(categories.length + 1),
    )}`,
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
      logo: faker.image.url(),
      locationId: faker.number.int({ min: 1, max: 100 }),
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

      const minPlayersPerTeam = faker.number.int({ min: 1, max: 5 });
      const maxPlayersPerTeam =
        minPlayersPerTeam + faker.number.int({ min: 0, max: 2 });

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
        locationId: faker.number.int({ min: 1, max: 100 }),
        maxChanges: faker.number.int({ min: 0, max: 10 }),
        minPlayersPerTeam,
        maxPlayersPerTeam,
        maxSubstitutes: faker.number.int({ min: 1, max: 3 }),
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

  return stages;
}

async function createStageRounds() {
  const stages = await db.select().from(tables.stage);
  const rounds = [];

  for (const stage of stages) {
    // For knockout stages, create rounds based on the number of teams (8 teams = 3 rounds, 16 teams = 4 rounds)
    if (stage.stageType === stageTypeEnum.KNOCKOUT) {
      // Calculate number of rounds needed based on tournament maxParticipants
      const tournament = await db
        .select()
        .from(tables.tournament)
        .where(eq(tables.tournament.id, stage.tournamentId))
        .limit(1);

      const maxParticipants = tournament[0].maxParticipants;
      const numRounds = Math.ceil(Math.log2(maxParticipants));

      for (let i = 0; i < numRounds; i++) {
        rounds.push({
          id: rounds.length + 1,
          stageId: stage.id,
          roundNumber: i + 1,
          createdAt: new Date(),
        });
      }
    }
    // For round-robin stages, create a single round
    else {
      rounds.push({
        id: rounds.length + 1,
        stageId: stage.id,
        roundNumber: 1,
        createdAt: new Date(),
      });
    }
  }

  await db.insert(tables.stageRound).values(rounds);

  await db.execute(
    sql<string>`ALTER SEQUENCE stage_round_id_seq RESTART WITH ${sql.raw(
      String(rounds.length + 1),
    )}`,
  );

  return rounds;
}

async function createMatchups() {
  const BATCH_SIZE = 50;
  let totalMatchups = 0;
  const stages = await db.select().from(tables.stage);

  for (const stage of stages) {
    const matchupBatch = [];

    // Get the tournament to determine max participants
    const tournament = await db
      .select()
      .from(tables.tournament)
      .where(eq(tables.tournament.id, stage.tournamentId))
      .limit(1);

    if (!tournament.length) continue;

    // Get rounds for this stage
    const stageRounds = await db
      .select()
      .from(tables.stageRound)
      .where(eq(tables.stageRound.stageId, stage.id))
      .orderBy(asc(tables.stageRound.roundNumber));

    if (stage.stageType === stageTypeEnum.KNOCKOUT) {
      const maxParticipants = tournament[0].maxParticipants;
      const numRounds = Math.ceil(Math.log2(maxParticipants));
      const matchupsByRound = new Map<number, number[]>();

      // Create matchups from final to first round
      for (let roundIdx = numRounds - 1; roundIdx >= 0; roundIdx--) {
        const round = stageRounds[roundIdx];
        if (!round) continue;

        const matchupsInRound = Math.pow(2, roundIdx);
        const roundMatchupIds: number[] = [];

        for (let matchIdx = 0; matchIdx < matchupsInRound; matchIdx++) {
          totalMatchups++;
          roundMatchupIds.push(totalMatchups);

          // For non-final rounds, get the parent matchup ID from the next round
          const parentMatchupId =
            roundIdx < numRounds - 1
              ? matchupsByRound.get(roundIdx + 1)?.[Math.floor(matchIdx / 2)]
              : null;

          matchupBatch.push({
            id: totalMatchups,
            stageId: stage.id,
            roundId: round.id,
            parentMatchupId,
            startDate: faker.date.between({
              from: stage.startDate,
              to: stage.endDate,
            }),
            endDate: null,
            isFinished: false,
            matchupType: 'one_vs_one',
            createdAt: new Date(),
          });

          // Insert batch if we've reached the batch size
          if (matchupBatch.length >= BATCH_SIZE) {
            await db.insert(tables.matchup).values(matchupBatch);
            matchupBatch.length = 0;
          }
        }

        matchupsByRound.set(roundIdx, roundMatchupIds);
      }
    } else if (stage.stageType === stageTypeEnum.ROUND_ROBIN) {
      const round = stageRounds[0];
      if (!round) continue;

      const numTeams = tournament[0].maxParticipants;
      const numMatchups = (numTeams * (numTeams - 1)) / 2;

      for (let i = 0; i < numMatchups; i++) {
        totalMatchups++;

        matchupBatch.push({
          id: totalMatchups,
          stageId: stage.id,
          roundId: round.id,
          parentMatchupId: null,
          startDate: faker.date.between({
            from: stage.startDate,
            to: stage.endDate,
          }),
          endDate: null,
          isFinished: false,
          matchupType: 'one_vs_one',
          createdAt: new Date(),
        });

        // Insert batch if we've reached the batch size
        if (matchupBatch.length >= BATCH_SIZE) {
          await db.insert(tables.matchup).values(matchupBatch);
          matchupBatch.length = 0;
        }
      }
    }

    // Insert any remaining matchups in the batch
    if (matchupBatch.length > 0) {
      await db.insert(tables.matchup).values(matchupBatch);
      matchupBatch.length = 0;
    }
  }

  // Reset the sequence
  if (totalMatchups > 0) {
    await db.execute(
      sql`ALTER SEQUENCE matchup_id_seq RESTART WITH ${sql.raw(
        String(totalMatchups + 1),
      )}`,
    );
  }

  return totalMatchups;
}

async function assignRostersToMatchups() {
  const matchups = await db.select().from(tables.matchup);
  const stages = await db.select().from(tables.stage);
  const rosters = await db.select().from(tables.roster);
  const rosterAssignments = [];

  for (const stage of stages) {
    const stageMatchups = matchups.filter((m) => m.stageId === stage.id);
    const stageRosters = rosters.filter((r) => r.stageId === stage.id);

    if (stage.stageType === stageTypeEnum.KNOCKOUT) {
      // For knockout stages, assign rosters to first round matchups only
      const firstRoundMatchups = stageMatchups.filter(
        (m) => !stageMatchups.some((om) => om.parentMatchupId === m.id),
      );

      // Randomly assign rosters to first round matchups
      const shuffledRosters = [...stageRosters].sort(() => 0.5 - Math.random());

      for (let i = 0; i < firstRoundMatchups.length; i++) {
        const matchup = firstRoundMatchups[i];
        // Assign two rosters to each matchup
        for (let j = 0; j < 2; j++) {
          const rosterIndex = i * 2 + j;
          if (rosterIndex < shuffledRosters.length) {
            rosterAssignments.push({
              rosterId: shuffledRosters[rosterIndex].id,
              matchupId: matchup.id,
              isWinner: false,
              createdAt: new Date(),
            });
          }
        }
      }
    } else {
      // For round-robin stages, create matchups between all teams
      for (let i = 0; i < stageRosters.length; i++) {
        for (let j = i + 1; j < stageRosters.length; j++) {
          const matchup = stageMatchups.shift();
          if (matchup) {
            rosterAssignments.push(
              {
                rosterId: stageRosters[i].id,
                matchupId: matchup.id,
                isWinner: false,
                createdAt: new Date(),
              },
              {
                rosterId: stageRosters[j].id,
                matchupId: matchup.id,
                isWinner: false,
                createdAt: new Date(),
              },
            );
          }
        }
      }
    }
  }

  if (rosterAssignments.length > 0) {
    await db.insert(tables.rosterToMatchup).values(rosterAssignments);
  }

  return rosterAssignments;
}

async function createParticipations() {
  const NUM_PARTICIPATIONS_TO_CREATE = process.env.SEED_PARTICIPATIONS_COUNT
    ? parseInt(process.env.SEED_PARTICIPATIONS_COUNT, 10)
    : 1000;

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
      coordinates: LocationHelper.ConvertToWKT(
        faker.location.latitude(),
        faker.location.longitude(),
      ),
      apiId: faker.string.uuid(),
    });
  }

  await db.insert(tables.location).values(locations).execute();

  await db.execute(
    sql<string>`ALTER SEQUENCE location_id_seq RESTART WITH ${sql.raw(
      String(NUM_OF_LOCATIONS + 1),
    )}`,
  );
}

async function createGroupRequirements() {
  const groups = await db.select().from(tables.group);
  const categories = await db.select().from(tables.category);
  const requirements = [];
  const eloRequirements = [];

  // Create requirements for about 50% of groups
  for (const group of groups) {
    if (Math.random() < 0.5) {
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

async function createMatches() {
  const stages = await db.select().from(tables.stage);

  for (const stage of stages) {
    const bracketGenerator = new BracketGenerator(
      new RosterDrizzleRepository(),
    );
    await bracketGenerator.generateInitialRosters(stage.id);
  }
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

async function createUserGroupBlockList() {
  const users = await db.select().from(tables.user);
  const groups = await db.select().from(tables.group);
  const blockedGroups = [];

  // Each user blocks ~5% of groups
  for (const user of users) {
    const numberOfBlockedGroups = Math.floor(groups.length * 0.05);
    const shuffledGroups = [...groups].sort(() => 0.5 - Math.random());
    const selectedGroups = shuffledGroups.slice(0, numberOfBlockedGroups);

    for (const group of selectedGroups) {
      blockedGroups.push({
        userId: user.id,
        blockedGroupId: group.id,
      } satisfies InferInsertModel<typeof tables.userGroupBlockList>);
    }
  }

  if (blockedGroups.length > 0) {
    await db.insert(tables.userGroupBlockList).values(blockedGroups);
    await db.execute(
      sql<string>`ALTER SEQUENCE user_group_block_list_id_seq RESTART WITH ${sql.raw(
        String(blockedGroups.length + 1),
      )}`,
    );
  }
}

async function createRosters() {
  const participations = await db.select().from(tables.participation);
  const stages = await db.select().from(tables.stage);
  const rosters = [];

  // Create rosters for each participation in the first stage of each tournament
  for (const participation of participations) {
    // Find the first stage for this tournament
    const tournamentStages = stages
      .filter((stage) => stage.tournamentId === participation.tournamentId)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    if (tournamentStages.length === 0) continue;

    const firstStage = tournamentStages[0];

    // Create a roster for this participation in the first stage
    rosters.push({
      id: rosters.length + 1,
      stageId: firstStage.id,
      participationId: participation.id,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    });

    // For some participations, create rosters for later stages too (about 30%)
    if (tournamentStages.length > 1 && Math.random() < 0.3) {
      // Get the second stage
      const secondStage = tournamentStages[1];

      rosters.push({
        id: rosters.length + 1,
        stageId: secondStage.id,
        participationId: participation.id,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      });
    }
  }

  if (rosters.length > 0) {
    await db.insert(tables.roster).values(rosters);
    await db.execute(
      sql<string>`ALTER SEQUENCE roster_id_seq RESTART WITH ${sql.raw(
        String(rosters.length + 1),
      )}`,
    );
  }

  return rosters;
}

async function createRosterMembers() {
  const rosters = await db.select().from(tables.roster);
  const users = await db.select().from(tables.user);
  const participations = await db.select().from(tables.participation);
  const stages = await db.select().from(tables.stage);
  const rosterMembers = [];

  for (const roster of rosters) {
    // Find the participation for this roster
    const participation = participations.find(
      (p) => p.id === roster.participationId,
    );
    if (!participation) continue;

    // Find the stage for this roster
    const stage = stages.find((s) => s.id === roster.stageId);
    if (!stage) continue;

    // Determine how many players to add based on stage settings
    const minPlayers = stage.minPlayersPerTeam || 3;
    const maxPlayers = stage.maxPlayersPerTeam || 5;
    const maxSubstitutes = stage.maxSubstitutes || 2;

    // Determine total roster size (main players + substitutes)
    const mainPlayerCount = faker.number.int({
      min: minPlayers,
      max: maxPlayers,
    });
    const substituteCount = faker.number.int({ min: 0, max: maxSubstitutes });
    const totalRosterSize = mainPlayerCount + substituteCount;

    // Get random users for this roster
    const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
    const selectedUsers = shuffledUsers.slice(0, totalRosterSize);

    // Add main players
    for (let i = 0; i < mainPlayerCount; i++) {
      if (i < selectedUsers.length) {
        rosterMembers.push({
          rosterId: roster.id,
          userId: selectedUsers[i].id,
          isSubstitute: false,
        });
      }
    }

    // Add substitutes
    for (let i = mainPlayerCount; i < totalRosterSize; i++) {
      if (i < selectedUsers.length) {
        rosterMembers.push({
          rosterId: roster.id,
          userId: selectedUsers[i].id,
          isSubstitute: true,
        });
      }
    }
  }

  if (rosterMembers.length > 0) {
    await db.insert(tables.userToRoster).values(rosterMembers);
  }

  return rosterMembers;
}

async function createLFP() {
  const groups = await db.select().from(tables.group);
  const categories = await db.select().from(tables.category);
  const lfpEntries = [];
  const categoryConnections = [];

  // Create LFP entries for about 30% of groups
  for (const group of groups) {
    if (Math.random() < 0.3) {
      const lfpEntry = {
        id: lfpEntries.length + 1,
        groupId: group.id,
        message: faker.lorem.paragraph(),
        createdAt: faker.date.recent(),
      };
      lfpEntries.push(lfpEntry);

      // Connect each LFP entry to 1-3 categories
      const numCategories = faker.number.int({ min: 1, max: 3 });
      const shuffledCategories = [...categories].sort(
        () => 0.5 - Math.random(),
      );
      const selectedCategories = shuffledCategories.slice(0, numCategories);

      for (const category of selectedCategories) {
        categoryConnections.push({
          lfpId: lfpEntry.id,
          categoryId: category.id,
          createdAt: faker.date.recent(),
        });
      }
    }
  }

  if (lfpEntries.length > 0) {
    await db.insert(tables.lookingForPlayers).values(lfpEntries);
    await db.execute(
      sql<string>`ALTER SEQUENCE looking_for_players_id_seq RESTART WITH ${sql.raw(
        String(lfpEntries.length + 1),
      )}`,
    );
  }

  if (categoryConnections.length > 0) {
    await db.insert(tables.categoryToLFP).values(categoryConnections);
  }
}

async function createInitialMatchScores() {
  // Get all first round matchups
  const firstRoundMatchups = await db
    .select({
      matchup: tables.matchup,
      round: tables.stageRound,
      rosterMatchups: tables.rosterToMatchup,
    })
    .from(tables.matchup)
    .innerJoin(
      tables.stageRound,
      eq(tables.matchup.roundId, tables.stageRound.id),
    )
    .leftJoin(
      tables.rosterToMatchup,
      eq(tables.rosterToMatchup.matchupId, tables.matchup.id),
    )
    .where(eq(tables.stageRound.roundNumber, 1));

  // Group matchups by their ID to get both rosters for each matchup
  const matchupGroups = firstRoundMatchups.reduce(
    (acc, curr) => {
      if (!acc[curr.matchup.id]) {
        acc[curr.matchup.id] = {
          matchup: curr.matchup,
          rosters: [],
        };
      }
      if (curr.rosterMatchups) {
        acc[curr.matchup.id].rosters.push(curr.rosterMatchups);
      }
      return acc;
    },
    {} as Record<
      number,
      {
        matchup: typeof tables.matchup.$inferSelect;
        rosters: (typeof tables.rosterToMatchup.$inferSelect)[];
      }
    >,
  );

  // Create scores for ~40% of first round matches
  const matchupEntries = Object.entries(matchupGroups);
  const matchupsToScore = matchupEntries.slice(
    0,
    Math.floor(matchupEntries.length * 0.4),
  );

  for (const [, { matchup: currentMatchup, rosters }] of matchupsToScore) {
    if (rosters.length !== 2) continue; // Skip if we don't have exactly 2 rosters

    // Randomly decide if it's a 2-0 or 2-1 victory
    const isSweep = Math.random() > 0.3;
    const rounds = isSweep ? 2 : 3;
    const winningRosterIndex = Math.floor(Math.random() * 2);
    const winningRoster = rosters[winningRosterIndex];
    const losingRoster = rosters[1 - winningRosterIndex];

    // Create scores for each round
    const scores = [];
    for (let i = 0; i < rounds; i++) {
      const [score1, score2] =
        i === rounds - 1 || isSweep
          ? [13, Math.floor(Math.random() * 8)] // Winning round
          : winningRosterIndex === 0
            ? [Math.floor(Math.random() * 8), 13] // Losing round for roster 1
            : [13, Math.floor(Math.random() * 8)]; // Losing round for roster 2

      const scoreEntry = await db
        .insert(tables.score)
        .values({
          matchupId: currentMatchup.id,
          roundNumber: i + 1,
        })
        .returning();

      // Create score details for each roster
      await db.insert(tables.scoreToRoster).values([
        {
          scoreId: scoreEntry[0].id,
          rosterId: winningRoster.rosterId,
          points: winningRosterIndex === 0 ? score1 : score2,
          isWinner:
            score1 > score2
              ? winningRosterIndex === 0
              : winningRosterIndex === 1,
        },
        {
          scoreId: scoreEntry[0].id,
          rosterId: losingRoster.rosterId,
          points: winningRosterIndex === 0 ? score2 : score1,
          isWinner:
            score1 > score2
              ? winningRosterIndex === 1
              : winningRosterIndex === 0,
        },
      ]);

      scores.push(scoreEntry[0]);
    }

    // Update matchup status and winner
    await db
      .update(tables.matchup)
      .set({
        isFinished: true,
        endDate: new Date(),
      })
      .where(eq(tables.matchup.id, currentMatchup.id));

    // Update roster-to-matchup to set winner
    await db
      .update(tables.rosterToMatchup)
      .set({
        isWinner: true,
      } as Partial<InferInsertModel<typeof tables.rosterToMatchup>>)
      .where(
        and(
          eq(tables.rosterToMatchup.matchupId, currentMatchup.id),
          eq(tables.rosterToMatchup.rosterId, winningRoster.rosterId),
        ),
      );

    // If there's a parent matchup, advance the winner
    if (currentMatchup.parentMatchupId) {
      await db.insert(tables.rosterToMatchup).values({
        matchupId: currentMatchup.parentMatchupId,
        rosterId: winningRoster.rosterId,
        isWinner: false,
      } as InferInsertModel<typeof tables.rosterToMatchup>);
    }
  }
}

async function createQuizzes() {
  console.log('Creating quizzes...');
  const NUM_QUIZZES_TO_CREATE = process.env.SEED_QUIZZES_COUNT
    ? parseInt(process.env.SEED_QUIZZES_COUNT, 10)
    : 30;

  const users = await db.select().from(tables.user);
  const stages = await db.select().from(tables.stage);
  const matchups = await db.select().from(tables.matchup);
  const tags = await db.select().from(tables.tags);

  // Create quiz topics as tags if they don't exist
  const quizTopics = [
    'Programming',
    'Mathematics',
    'Science',
    'History',
    'Geography',
    'Literature',
    'Sports',
    'Gaming',
    'Technology',
    'General Knowledge',
  ];

  const existingTagNames = new Set(tags.map((tag) => tag.name));
  const newTagsToCreate = quizTopics.filter(
    (topic) => !existingTagNames.has(topic),
  );

  let quizTags = [...tags];

  if (newTagsToCreate.length > 0) {
    const newTags = newTagsToCreate.map((name, index) => ({
      id: tags.length + index + 1,
      name,
    }));

    await db.insert(tables.tags).values(newTags);

    // Update the sequence
    if (newTags.length > 0) {
      await db.execute(
        sql`ALTER SEQUENCE tags_id_seq RESTART WITH ${sql.raw(
          String(tags.length + newTags.length + 1),
        )}`,
      );
    }

    // Fetch all tags again
    quizTags = await db.select().from(tables.tags);
  }

  // Prepare quiz data
  const quizzes = [];
  for (let i = 0; i < NUM_QUIZZES_TO_CREATE; i++) {
    const startDate = faker.date.future();
    const isRetakeable = faker.datatype.boolean();
    const isAnonymousAllowed = faker.datatype.boolean();
    const isImmediateFeedback = faker.datatype.boolean();
    const isRandomizedQuestions = faker.datatype.boolean();
    const hasMatchup = faker.datatype.boolean() && i < matchups.length;
    const hasStage = faker.datatype.boolean() && i < stages.length;
    const isTest = faker.datatype.boolean();

    quizzes.push({
      id: i + 1,
      name: faker.lorem.sentence().slice(0, 50),
      startDate,
      timeLimitTotal: faker.number.int({ min: 300, max: 3600 }),
      passingScore: faker.number.int({ min: 60, max: 90 }),
      maxAttempts: faker.datatype.boolean()
        ? faker.number.int({ min: 1, max: 5 })
        : null,
      isImmediateFeedback,
      isRandomizedQuestions,
      isAnonymousAllowed,
      isRetakeable: isRetakeable,
      description: faker.lorem.paragraph(),
      matchupId: hasMatchup ? matchups[i].id : null,
      stageId: hasStage ? stages[i].id : null,
      isTest,
      coverImage: faker.image.url(),
      userId: faker.helpers.arrayElement(users).id,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    });
  }

  // Insert quizzes
  await db.insert(tables.quiz).values(quizzes);

  // Reset sequence
  await db.execute(
    sql`ALTER SEQUENCE quiz_id_seq RESTART WITH ${sql.raw(
      String(NUM_QUIZZES_TO_CREATE + 1),
    )}`,
  );

  // Create quiz tags relationships
  const quizTagsRelations = [];
  for (const quiz of quizzes) {
    // Assign 1-3 tags per quiz
    const numTags = faker.number.int({ min: 1, max: 3 });
    const shuffledTags = [...quizTags].sort(() => 0.5 - Math.random());
    const selectedTags = shuffledTags.slice(0, numTags);

    for (const tag of selectedTags) {
      quizTagsRelations.push({
        quizId: quiz.id,
        tagId: tag.id,
      });
    }
  }

  // Insert quiz tags
  if (quizTagsRelations.length > 0) {
    await db.insert(tables.quizTags).values(quizTagsRelations);
  }

  // Create quiz questions
  await createQuizQuestions(quizzes);

  return quizzes;
}

async function createQuizQuestions(quizzes) {
  console.log('Creating quiz questions...');
  const questions = [];
  let questionId = 1;

  // Question templates for different types
  const multipleChoiceTemplates = [
    'What is the capital of {country}?',
    'Which of the following is {category}?',
    'Who invented {invention}?',
    'Which year did {event} happen?',
    'What is the primary function of {concept}?',
  ];

  const trueFalseTemplates = [
    '{statement} is true.',
    '{person} invented {invention}.',
    '{country} is in {continent}.',
    '{event} happened in {year}.',
    '{fact} affects {subject}.',
  ];

  const shortAnswerTemplates = [
    'Name three {category}.',
    'Explain the concept of {concept}.',
    'What are the consequences of {event}?',
    'Describe the relationship between {subject1} and {subject2}.',
    'How does {process} work?',
  ];

  // Define available question types
  const questionTypes = [
    quizQuestionTypeEnum.MULTIPLE_CHOICE,
    quizQuestionTypeEnum.TRUE_FALSE,
    quizQuestionTypeEnum.SHORT_ANSWER,
    quizQuestionTypeEnum.HOTSPOT,
    quizQuestionTypeEnum.PROGRAMMING,
  ];

  // Create 5-15 questions per quiz
  for (const quiz of quizzes) {
    const numQuestions = faker.number.int({ min: 5, max: 15 });

    for (let i = 0; i < numQuestions; i++) {
      const questionType = faker.helpers.arrayElement(questionTypes);
      let questionTemplate;

      // Get appropriate template based on question type
      switch (questionType) {
        case quizQuestionTypeEnum.MULTIPLE_CHOICE:
          questionTemplate = faker.helpers.arrayElement(
            multipleChoiceTemplates,
          );
          break;
        case quizQuestionTypeEnum.TRUE_FALSE:
          questionTemplate = faker.helpers.arrayElement(trueFalseTemplates);
          break;
        case quizQuestionTypeEnum.SHORT_ANSWER:
        case quizQuestionTypeEnum.ORDER:
        case quizQuestionTypeEnum.HOTSPOT:
        case quizQuestionTypeEnum.PROGRAMMING:
          questionTemplate = faker.helpers.arrayElement(shortAnswerTemplates);
          break;
        default:
          questionTemplate = faker.helpers.arrayElement(
            multipleChoiceTemplates,
          );
      }

      // Replace placeholders in templates
      const question = questionTemplate
        .replace('{country}', faker.location.country())
        .replace('{category}', faker.commerce.department())
        .replace('{invention}', faker.commerce.productName())
        .replace('{event}', faker.lorem.words(3))
        .replace('{concept}', faker.lorem.word())
        .replace('{statement}', faker.lorem.sentence())
        .replace('{person}', faker.person.fullName())
        .replace(
          '{continent}',
          faker.helpers.arrayElement([
            'Europe',
            'Asia',
            'Africa',
            'North America',
            'South America',
            'Australia',
            'Antarctica',
          ]),
        )
        .replace('{year}', faker.date.past().getFullYear().toString())
        .replace('{fact}', faker.lorem.sentence())
        .replace('{subject}', faker.lorem.word())
        .replace('{topic}', faker.lorem.word())
        .replace('{subject1}', faker.lorem.word())
        .replace('{subject2}', faker.lorem.word())
        .replace('{discovery}', faker.lorem.word())
        .replace('{field}', faker.commerce.department())
        .replace('{process}', faker.lorem.word());

      // Generate appropriate correct answers based on question type
      let correctAnswers = [];
      if (questionType === quizQuestionTypeEnum.TRUE_FALSE) {
        correctAnswers = [faker.datatype.boolean() ? 'True' : 'False'];
      } else if (
        questionType === quizQuestionTypeEnum.SHORT_ANSWER ||
        questionType === quizQuestionTypeEnum.ORDER ||
        questionType === quizQuestionTypeEnum.HOTSPOT
      ) {
        correctAnswers = [faker.lorem.sentence()];
      } else if (questionType === quizQuestionTypeEnum.PROGRAMMING) {
        correctAnswers = [faker.lorem.paragraph()];
      }

      questions.push({
        id: questionId,
        quizId: quiz.id,
        question,
        questionImage: faker.datatype.boolean() ? faker.image.url() : null,
        type: questionType,
        order: i + 1,
        timeLimit: faker.number.int({ min: 30, max: 300 }),
        points: faker.number.int({ min: 1, max: 10 }),
        explanation: faker.lorem.paragraph(),
        isImmediateFeedback: quiz.isImmediateFeedback,
        correctAnswers: correctAnswers.join(','),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      questionId++;
    }
  }

  // Insert questions in batches to avoid potential issues
  const BATCH_SIZE = 50;
  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE);
    await db.insert(tables.quizQuestion).values(batch);
  }

  // Reset sequence
  await db.execute(
    sql`ALTER SEQUENCE quiz_question_id_seq RESTART WITH ${sql.raw(
      String(questionId),
    )}`,
  );

  // Create options for multiple choice questions
  await createQuizOptions(
    questions.filter(
      (q) =>
        q.type === quizQuestionTypeEnum.MULTIPLE_CHOICE ||
        q.type === quizQuestionTypeEnum.TRUE_FALSE,
    ),
  );

  return questions;
}

async function createQuizOptions(questions) {
  console.log('Creating quiz options...');
  const options = [];
  let optionId = 1;

  for (const question of questions) {
    // For true/false questions, just create two options
    if (question.type === quizQuestionTypeEnum.TRUE_FALSE) {
      const correctOption =
        question.correctAnswers === 'True' ? 'True' : 'False';

      options.push({
        id: optionId++,
        quizQuestionId: question.id,
        option: 'True',
        isCorrect: correctOption === 'True',
        createdAt: new Date(),
      });

      options.push({
        id: optionId++,
        quizQuestionId: question.id,
        option: 'False',
        isCorrect: correctOption === 'False',
        createdAt: new Date(),
      });
    }
    // For multiple choice questions, create 3-5 options
    else if (question.type === quizQuestionTypeEnum.MULTIPLE_CHOICE) {
      const numOptions = faker.number.int({ min: 3, max: 5 });
      const correctOptionIndex = faker.number.int({
        min: 0,
        max: numOptions - 1,
      });

      for (let i = 0; i < numOptions; i++) {
        options.push({
          id: optionId++,
          quizQuestionId: question.id,
          option: faker.lorem.sentence(),
          isCorrect: i === correctOptionIndex,
          createdAt: new Date(),
        });
      }

      // Update correctAnswers for the question
      const correctOption = options.find(
        (o) => o.quizQuestionId === question.id && o.is_correct,
      );
      if (correctOption) {
        await db
          .update(tables.quizQuestion)
          .set({ correctAnswers: correctOption.option } as Partial<
            InferInsertModel<typeof tables.quizQuestion>
          >)
          .where(eq(tables.quizQuestion.id, question.id));
      }
    }
  }

  // Insert options in batches to avoid potential issues
  const BATCH_SIZE = 100;
  for (let i = 0; i < options.length; i += BATCH_SIZE) {
    const batch = options.slice(i, i + BATCH_SIZE);
    await db.insert(tables.quizOption).values(batch);
  }

  // Reset sequence
  await db.execute(
    sql`ALTER SEQUENCE quiz_option_id_seq RESTART WITH ${sql.raw(
      String(optionId),
    )}`,
  );

  return options;
}

async function createQuizAttempts() {
  console.log('Creating quiz attempts...');
  const users = await db.select().from(tables.user);
  const quizzes = await db.select().from(tables.quiz);

  const attempts = [];
  let attemptId = 1;

  // For each quiz, create attempts for ~30% of users
  for (const quiz of quizzes) {
    const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
    const numAttempts = Math.floor(users.length * 0.3);
    const selectedUsers = shuffledUsers.slice(0, numAttempts);

    for (const user of selectedUsers) {
      // Create 1-3 attempts per user if quiz is retakeable
      const numAttemptsPerUser = quiz.isRetakeable
        ? faker.number.int({ min: 1, max: 3 })
        : 1;

      for (let i = 0; i < numAttemptsPerUser; i++) {
        const isSubmitted = faker.datatype.boolean();
        const startTime = faker.date.between({
          from: quiz.startDate,
          to: new Date(quiz.startDate.getTime() + 1000 * 60 * 60 * 24 * 30),
        });
        const endTime = isSubmitted
          ? faker.date.between({
              from: startTime,
              to: new Date(startTime.getTime() + 1000 * 60 * 60 * 24 * 30),
            })
          : null;

        attempts.push({
          id: attemptId++,
          userId: user.id,
          quizId: quiz.id,
          currentQuestion: isSubmitted
            ? faker.number.int({ min: 0, max: 15 })
            : 0,
          endTime,
          score: isSubmitted ? faker.number.int({ min: 0, max: 100 }) : 0,
          isSubmitted,
          createdAt: startTime,
        });
      }
    }
  }

  if (attempts.length > 0) {
    await db.insert(tables.quizAttempt).values(attempts);
    await db.execute(
      sql<string>`ALTER SEQUENCE quiz_attempt_id_seq RESTART WITH ${sql.raw(
        String(attemptId),
      )}`,
    );
  }

  return attempts;
}

async function createQuizAnswers(attempts: any[]) {
  console.log('Creating quiz answers...');
  const questions = await db.select().from(tables.quizQuestion);
  const options = await db.select().from(tables.quizOption);
  const answers = [];
  let answerId = 1;

  // Group questions by quiz
  const questionsByQuiz = questions.reduce((acc, question) => {
    if (!acc[question.quizId]) {
      acc[question.quizId] = [];
    }
    acc[question.quizId].push(question);
    return acc;
  }, {});

  // Group options by question
  const optionsByQuestion = options.reduce((acc, option) => {
    if (!acc[option.quizQuestionId]) {
      acc[option.quizQuestionId] = [];
    }
    acc[option.quizQuestionId].push(option);
    return acc;
  }, {});

  for (const attempt of attempts) {
    if (!attempt.isSubmitted && !faker.datatype.boolean()) continue; // Skip some non-submitted attempts

    const quizQuestions = questionsByQuiz[attempt.quizId] || [];
    const numAnswers = attempt.isSubmitted
      ? quizQuestions.length
      : faker.number.int({ min: 1, max: quizQuestions.length });

    // Create answers for questions
    for (let i = 0; i < numAnswers; i++) {
      const question = quizQuestions[i];
      if (!question) continue;

      const isFinal = question.isImmediateFeedback || attempt.isSubmitted;
      let isCorrect = false;
      let answer = '';
      let selectedOptionId = null;

      // Handle different question types
      if (
        question.type === 'multiple_choice' ||
        question.type === 'true_false'
      ) {
        const questionOptions = optionsByQuestion[question.id] || [];
        const selectedOption = faker.helpers.arrayElement(
          questionOptions,
        ) as any;
        if (selectedOption) {
          selectedOptionId = selectedOption.id;
          answer = selectedOption.option;
          isCorrect = selectedOption.isCorrect;
        }
      } else {
        // For other question types
        answer = faker.lorem.sentence();
        if (question.correctAnswers) {
          const correctAnswers = question.correctAnswers.split(',');
          isCorrect =
            faker.datatype.boolean() &&
            faker.helpers.arrayElement([true, false, false]); // 33% chance of correct answer
          if (isCorrect) {
            answer = faker.helpers.arrayElement(correctAnswers);
          }
        }
      }

      answers.push({
        id: answerId++,
        userId: attempt.userId,
        quizAttemptId: attempt.id,
        quizQuestionId: question.id,
        answer,
        selectedOptionId,
        isCorrect,
        isFinal,
        createdAt: faker.date.between({
          from: attempt.createdAt,
          to:
            attempt.endTime ||
            new Date(attempt.createdAt.getTime() + 1000 * 60 * 60 * 24 * 30),
        }),
      });
    }
  }

  if (answers.length > 0) {
    // Insert answers in batches to avoid memory issues
    const BATCH_SIZE = 100;
    for (let i = 0; i < answers.length; i += BATCH_SIZE) {
      const batch = answers.slice(i, i + BATCH_SIZE);
      await db.insert(tables.quizAnswer).values(batch);
    }

    await db.execute(
      sql<string>`ALTER SEQUENCE quiz_answer_id_seq RESTART WITH ${sql.raw(
        String(answerId),
      )}`,
    );
  }

  // Update attempt scores for submitted attempts
  for (const attempt of attempts) {
    if (attempt.isSubmitted) {
      const attemptAnswers = answers.filter(
        (a) => a.quizAttemptId === attempt.id,
      );
      const attemptQuestions = questionsByQuiz[attempt.quizId] || [];

      let totalScore = 0;
      for (const answer of attemptAnswers) {
        if (answer.isCorrect) {
          const question = attemptQuestions.find(
            (q) => q.id === answer.quizQuestionId,
          );
          if (question) {
            totalScore += question.points || 0;
          }
        }
      }

      await db
        .update(tables.quizAttempt)
        .set({
          score: totalScore,
          isSubmitted: true,
          endTime: new Date(),
        } as Partial<InferInsertModel<typeof tables.quizAttempt>>)
        .where(eq(tables.quizAttempt.id, attempt.id));
    }
  }
}

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
  await createUserGroupBlockList();
  await createLFP();
  await createTournaments();
  await createStages();
  await createParticipations();
  await createInterests();
  await createGroupInterests();
  await createGroupRequirements();
  await createRosters();
  await createRosterMembers();
  console.log('Creating matches...');
  await createMatches();
  console.log('Creating initial match scores...');
  await createInitialMatchScores();
  console.log('Creating quizzes and related data...');
  await createQuizzes();
  console.log('Creating quiz attempts...');
  const attempts = await createQuizAttempts();
  console.log('Creating quiz answers...');
  await createQuizAnswers(attempts);
}
