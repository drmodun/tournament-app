import { seed } from './seedDefinition';

console.log(`Seeding: ${process.env.DATABASE_URL}`);

seed()
  .then(() => {
    console.log('Database seeded');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error seeding database', err);
    process.exit(1);
  });
