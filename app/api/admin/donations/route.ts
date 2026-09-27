import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/donations
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let whereClause = {};
    if (status && status !== 'all') {
      whereClause = { status };
    }

    const donations = await prisma.donation.findMany({
      where: whereClause,
      include: {
        volunteer: {
          select: { name: true, contactNumber: true, organizationName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(donations);
  } catch (error) {
    console.error("Error fetching donations:", error);
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}
