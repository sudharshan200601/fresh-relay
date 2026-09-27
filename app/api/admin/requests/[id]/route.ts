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
    if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const adminId = payload.userId as string;
    const { status, approvedQuantity, adminNotes } = await request.json();

    const existingReq = await prisma.foodRequest.findUnique({
      where: { id: params.id },
      include: { donation: true }
    });
    
    if (!existingReq) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    const updated = await prisma.foodRequest.update({
      where: { id: params.id },
      data: {
        status,
        approvedQuantity: approvedQuantity ? parseFloat(approvedQuantity) : undefined,
        adminNotes,
        adminId
      }
    });

    // Handle donation quantity deduction if approved
    if (status === 'approved' && approvedQuantity) {
      const deduction = parseFloat(approvedQuantity);
      if (existingReq.donation.quantityKg - deduction <= 0) {
        await prisma.donation.update({
          where: { id: existingReq.donationId },
          data: { status: 'closed', quantityKg: 0 }
        });
      } else {
        await prisma.donation.update({
           where: { id: existingReq.donationId },
           data: { 
             status: 'partially_allocated', 
             quantityKg: existingReq.donation.quantityKg - deduction 
           }
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
