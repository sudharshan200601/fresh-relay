import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json();
    const id = params.id;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const updatedDonation = await prisma.donation.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updatedDonation);
  } catch (error) {
    console.error("Error updating donation:", error);
    return NextResponse.json({ error: 'Failed to update donation' }, { status: 500 });
  }
}
