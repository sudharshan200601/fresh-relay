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
    const donorId = payload.userId as string;

    const data = await request.json();

    const donation = await prisma.donation.create({
      data: {
        ...data,
        quantityKg: parseFloat(data.quantityKg),
        availableFrom: data.availableFrom ? new Date(data.availableFrom) : null,
        pickupBy: data.pickupBy ? new Date(data.pickupBy) : null,
        expiryTime: data.expiryTime ? new Date(data.expiryTime) : null,
        donorId,
        status: 'pending'
      }
    });
    return NextResponse.json(donation, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create donation' }, { status: 500 });
  }
}
