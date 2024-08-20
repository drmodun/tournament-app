import { seed } from './seedDefinition';

seed()
  .then(() => {
    console.log('Database seeded');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error seeding database', err);
    process.exit(1);
  });
