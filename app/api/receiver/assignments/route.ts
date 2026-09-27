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
    if (payload.role !== 'receiver') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const receiverId = payload.userId as string;
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    let whereClause: any = { receiverId };
    if (statusFilter && statusFilter !== 'all') {
      whereClause.status = statusFilter;
    }

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        donation: {
          include: {
            donor: {
              select: { name: true, contactNumber: true, organizationName: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}
