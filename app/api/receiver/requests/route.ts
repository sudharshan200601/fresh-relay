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
    
    const requests = await prisma.foodRequest.findMany({
      where: { receiverId: payload.userId as string },
      include: { donation: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching requests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    const data = await request.json();
    const newReq = await prisma.foodRequest.create({
      data: {
        donationId: data.donationId,
        receiverId: payload.userId as string,
        requestedQuantity: parseFloat(data.requestedQuantity),
        preferredDate: data.preferredDate,
        preferredPickupWindow: data.preferredPickupWindow,
        pickupAddress: data.pickupAddress,
        numberOfPeople: data.numberOfPeople ? parseInt(data.numberOfPeople) : null,
        specialRequirements: data.specialRequirements,
        notes: data.notes,
        status: 'pending'
      }
    });
    return NextResponse.json(newReq, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating request' }, { status: 500 });
  }
}
