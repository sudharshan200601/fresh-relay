import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-do-not-use-in-prod');

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    const { status, rating, feedback } = await request.json();
    
    const existing = await prisma.foodRequest.findUnique({ where: { id: params.id } });
    if (!existing || existing.receiverId !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const updated = await prisma.foodRequest.update({
      where: { id: params.id },
      data: { status, rating, feedback }
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating request' }, { status: 500 });
  }
}
