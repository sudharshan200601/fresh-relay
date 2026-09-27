import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const urgentOnly = searchParams.get('urgentOnly') === 'true';

    const whereClause: any = {};

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { food_type: { contains: search } },
        { pickup_address: { contains: search } },
        { donor: { name: { contains: search } } },
        { donor: { organization: { contains: search } } },
      ];
    }

    if (urgentOnly) {
      const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
      whereClause.expiry_time = {
        lte: twoHoursFromNow,
        gte: new Date(),
      };
    }

    const donations = await db.donation.findMany({
      where: whereClause,
      include: {
        donor: true,
        volunteer: true,
      },
      orderBy: {
        expiry_time: 'asc',
      },
    });

    return NextResponse.json(donations);
  } catch (error: any) {
    console.error('Error fetching donations:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      donor_id = 'donor-1',
      food_type,
      category = 'Prepared Foods',
      quantity,
      quantity_unit = 'lbs',
      servings = 50,
      dietary_flags = [],
      pickup_address,
      latitude = 37.7749,
      longitude = -122.4194,
      pickup_instructions = '',
      expiry_time,
    } = body;

    // Validation 1: Required fields
    if (!food_type || !quantity || !pickup_address || !expiry_time) {
      return NextResponse.json(
        { error: 'Missing required fields: food_type, quantity, pickup_address, and expiry_time are required.' },
        { status: 400 }
      );
    }

    // Validation 2: Expiry date must not be in the past
    const expiryDate = new Date(expiry_time);
    if (isNaN(expiryDate.getTime())) {
      return NextResponse.json({ error: 'Invalid expiry date format.' }, { status: 400 });
    }

    if (expiryDate <= new Date()) {
      return NextResponse.json(
        { error: 'Expiry time cannot be in the past. Please select a future time.' },
        { status: 400 }
      );
    }

    // Ensure donor exists or fallback to default donor
    let donor = await db.user.findUnique({ where: { id: donor_id } });
    if (!donor) {
      donor = await db.user.findFirst({ where: { role: 'donor' } });
    }

    const newDonation = await db.donation.create({
      data: {
        donor_id: donor ? donor.id : 'donor-1',
        food_type,
        category,
        quantity: Number(quantity),
        quantity_unit,
        servings: Number(servings) || Math.round(Number(quantity) * 0.8),
        dietary_flags: typeof dietary_flags === 'string' ? dietary_flags : JSON.stringify(dietary_flags),
        pickup_address,
        latitude: Number(latitude),
        longitude: Number(longitude),
        pickup_instructions,
        expiry_time: expiryDate,
        status: 'available',
      },
      include: {
        donor: true,
        volunteer: true,
      },
    });

    return NextResponse.json(newDonation, { status: 201 });
  } catch (error: any) {
    console.error('Error creating donation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
