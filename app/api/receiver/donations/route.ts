import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get('foodType');
    
    let whereClause: any = { 
      status: { in: ['verified', 'partially_allocated'] } 
    };
    
    if (filterType && filterType !== 'all') {
      whereClause.foodCategory = filterType;
    }

    const donations = await prisma.donation.findMany({
      where: whereClause,
      include: {
        donor: { select: { organizationName: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(donations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}
