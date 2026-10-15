import { db } from '../db';
import * as tables from '../schema';
import { faker } from '@faker-js/faker';
import { sql } from 'drizzle-orm';
import {
  tournamentLocationEnum,
  tournamentTypeEnum,
  tournamentTeamTypeEnum,
  stageTypeEnum,
  stageStatusEnum,
} from '@tournament-app/types';
import { LocationHelper } from '../../base/static/locationHelper';
import { seedCount } from './seedCount';

export async function createLocations() {
  const locations = [];
  const NUM_OF_LOCATIONS = seedCount('SEED_LOCATIONS_COUNT', 100);

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

export async function createTournaments() {
  const NUM_TOURNAMENTS_TO_CREATE = seedCount('SEED_TOURNAMENTS_COUNT', 20);

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

export async function createStages() {
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

export async function createParticipations() {
  const NUM_PARTICIPATIONS_TO_CREATE = seedCount(
    'SEED_PARTICIPATIONS_COUNT',
    1000,
  );

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
