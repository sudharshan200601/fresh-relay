import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-prod');

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'donor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const donorId = payload.userId as string;

    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
      include: {
        donation: {
          include: {
            volunteer: {
              select: { name: true, contactNumber: true, organizationName: true }
            }
          }
        }
      }
    });

    if (!assignment || assignment.donorId !== donorId) {
      return NextResponse.json({ error: 'Not Found or Forbidden' }, { status: 404 });
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch assignment' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const donorId = payload.userId as string;

    const { status, rating, feedback } = await request.json();

    // Verify ownership
    const assignment = await prisma.assignment.findUnique({ where: { id: params.id } });
    if (!assignment || assignment.donorId !== donorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update assignment
    const updatedAssignment = await prisma.assignment.update({
      where: { id: params.id },
      data: { 
        status: status || undefined,
        rating: rating || undefined,
        feedback: feedback || undefined 
      }
    });

    // Keep parent donation status in sync if progressing towards completion
    if (status && ['picked_up', 'delivered', 'completed'].includes(status)) {
      await prisma.donation.update({
        where: { id: updatedAssignment.donationId },
        data: { status }
      });
    }

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 });
  }
}
