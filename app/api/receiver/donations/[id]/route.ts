import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const donation = await prisma.donation.findUnique({
      where: { id: params.id },
      include: { donor: { select: { name: true, contactNumber: true, organizationName: true } } }
    });
    if (!donation) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(donation);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching donation' }, { status: 500 });
  }
}
