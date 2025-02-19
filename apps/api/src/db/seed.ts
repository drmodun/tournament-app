import { seed } from './seedDefinition';

async function main() {
  if (process.env.MODE !== 'production') {
    console.log(`Seeding: ${process.env.DATABASE_URL}`);
  }

  try {
    await seed();
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err.message);
    console.error('Stack trace:', err.stack);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
