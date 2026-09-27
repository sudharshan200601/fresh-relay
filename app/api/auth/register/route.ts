import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, password, role, organizationName, contactNumber } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        organizationName,
        contactNumber,
      }
    });

    return NextResponse.json({ message: 'User created' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}
