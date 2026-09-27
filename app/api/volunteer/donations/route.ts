import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-prod');

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const volunteerId = payload.userId as string;

    const donations = await prisma.donation.findMany({
      where: { volunteerId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(donations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}
