import { db } from '../db';
import * as tables from '../schema';
import { faker } from '@faker-js/faker';
import { sql } from 'drizzle-orm';
import { categoryTypeEnum } from '@tournament-app/types';

export async function createCategories() {
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

export async function createInterests() {
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

export async function createCareers() {
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
