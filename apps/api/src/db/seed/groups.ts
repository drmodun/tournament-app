import { db } from '../db';
import * as tables from '../schema';
import { faker } from '@faker-js/faker';
import { InferInsertModel, sql } from 'drizzle-orm';
import {
  groupFocusEnum,
  groupRoleEnum,
  groupTypeEnum,
} from '@tournament-app/types';
import { CreateGroupRequest } from 'src/group/dto/requests.dto';
import { seedCount } from './seedCount';

export async function createGroups() {
  const NUM_GROUPS_TO_CREATE = seedCount('SEED_GROUPS_COUNT', 500);

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

export async function createGroupMemberships() {
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

export async function createGroupJoinRequests() {
  const NUM_OF_USERS = seedCount('SEED_USERS_COUNT', 100);
  const NUM_OF_GROUPS = seedCount('SEED_GROUPS_COUNT', 100);

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

export async function createGroupInvites() {
  const NUM_OF_USERS = seedCount('SEED_USERS_COUNT', 100);
  const NUM_OF_GROUPS = seedCount('SEED_GROUPS_COUNT', 100);

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

export async function createGroupInterests() {
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

export async function createGroupRequirements() {
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

export async function createBlockedUsers() {
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

export async function createUserGroupBlockList() {
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
