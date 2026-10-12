import { db } from '../db';
import * as tables from '../schema';
import { faker } from '@faker-js/faker';
import { sql } from 'drizzle-orm';

export async function createLFG() {
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

export async function createCategoryToLFG() {
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

export async function createLFP() {
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
