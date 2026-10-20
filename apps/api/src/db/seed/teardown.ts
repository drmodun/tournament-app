import { db } from '../db';
import { getTableName, sql } from 'drizzle-orm';
import * as tables from '../schema';

export async function teardown() {
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
      tables.ratingChange,
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
        console.log(`Dropping all rows from table ${getTableName(table)}`);
        await db.delete(table);
      } catch (err) {
        console.error(`Error deleting table ${getTableName(table)}:`, err);
      }
    }

    await restartSequences(tableDeleteOrder.map(getTableName));
  } catch (err) {
    console.error('Error during teardown:', err);
  }
}

// Deleting rows leaves ID sequences where they were. Seeders that insert without explicit IDs
// and then set the sequence to "row count + 1" would collide with those IDs on a reseed,
// so start the emptied tables from 1 again, as on a fresh database.
async function restartSequences(tableNames: string[]) {
  const sequences = await db.execute<{ name: string }>(sql`
    SELECT sequence.relname AS name
    FROM pg_class sequence
    JOIN pg_depend dependency ON dependency.objid = sequence.oid
    JOIN pg_class owner ON owner.oid = dependency.refobjid
    WHERE sequence.relkind = 'S'
      AND dependency.deptype IN ('a', 'i')
      AND owner.relname IN ${tableNames}
  `);

  for (const { name } of sequences) {
    await db.execute(
      sql`ALTER SEQUENCE ${sql.identifier(name)} RESTART WITH 1`,
    );
  }
}
