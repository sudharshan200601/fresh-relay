import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-prod');

export async function POST(request: Request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const adminId = payload.userId as string;
    const { donationId, donorId } = await request.json();

    if (!donationId || !donorId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    // Create the assignment link between donor, donation, and admin
    const assignment = await prisma.assignment.create({
      data: {
        donationId,
        donorId,
        adminId,
        status: 'assigned'
      }
    });

    // Update parent donation to 'assigned'
    await prisma.donation.update({
      where: { id: donationId },
      data: { status: 'assigned' }
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}
