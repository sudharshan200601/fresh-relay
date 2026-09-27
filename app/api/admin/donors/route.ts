import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-prod');

export async function GET(request: Request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const donors = await prisma.user.findMany({
      where: { role: 'donor' },
      select: { id: true, name: true, organizationName: true }
    });

    return NextResponse.json(donors);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch donors' }, { status: 500 });
  }
}
