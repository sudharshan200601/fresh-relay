import { db } from '../lib/db';
import { mockUsers, getInitialDonations } from '../lib/seedData';

async function seed() {
  console.log('Seeding database...');
  await db.donation.deleteMany({});
  await db.user.deleteMany({});

  for (const user of mockUsers) {
    await db.user.create({ data: user });
  }

  const donations = getInitialDonations();
  for (const don of donations) {
    await db.donation.create({ data: don });
  }

  console.log('Seeding complete!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
