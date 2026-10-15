import { teardown } from './seed/teardown';
import { createUsers, createFollowers } from './seed/users';
import {
  createGroups,
  createGroupMemberships,
  createGroupJoinRequests,
  createGroupInvites,
  createGroupInterests,
  createGroupRequirements,
  createBlockedUsers,
  createUserGroupBlockList,
} from './seed/groups';
import {
  createCategories,
  createInterests,
  createCareers,
} from './seed/categories';
import {
  createLocations,
  createTournaments,
  createStages,
  createParticipations,
} from './seed/tournaments';
import { createLFG, createCategoryToLFG, createLFP } from './seed/lfg';
import { createRosters, createRosterMembers } from './seed/rosters';
import { createMatches, createInitialMatchScores } from './seed/matches';
import {
  createQuizzes,
  createQuizAttempts,
  createQuizAnswers,
} from './seed/quizzes';
import { withDeterministicRandom } from './seed/deterministic';

export async function seed() {
  console.log('Seeding database...');

  await withDeterministicRandom(runSeeders);
}

async function runSeeders() {
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
