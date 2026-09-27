import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mockUsers, getInitialDonations } from '@/lib/seedData';

export async function GET() {
  try {
    // Clear existing data
    await db.donation.deleteMany({});
    await db.user.deleteMany({});

    // Create users
    for (const user of mockUsers) {
      await db.user.create({ data: user });
    }

    // Create initial donations
    const donations = getInitialDonations();
    for (const don of donations) {
      await db.donation.create({ data: don });
    }

    return NextResponse.json({
      success: true,
      message: `Database seeded successfully with ${mockUsers.length} users and ${donations.length} donations.`,
    });
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
