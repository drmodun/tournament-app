import { db } from '../db';
import * as tables from '../schema';
import { faker } from '@faker-js/faker';
import { sql } from 'drizzle-orm';

export async function createRosters() {
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

export async function createRosterMembers() {
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
