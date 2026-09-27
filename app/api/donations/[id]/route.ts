import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const donation = await db.donation.findUnique({
      where: { id },
      include: {
        donor: true,
        volunteer: true,
      },
    });

    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    return NextResponse.json(donation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, status, volunteer_id } = body;

    // Check existing donation state
    const existing = await db.donation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    // Workflow Action: Claim Pickup
    if (action === 'claim' || status === 'claimed') {
      if (existing.status !== 'available' && existing.status !== 'claimed') {
        return NextResponse.json(
          {
            error: `This donation has already been ${existing.status} by another volunteer!`,
            alreadyClaimed: true,
          },
          { status: 409 } // Conflict
        );
      }

      // Assign volunteer or fallback to first volunteer user
      let volId = volunteer_id || 'vol-1';
      const volUser = await db.user.findUnique({ where: { id: volId } });
      if (!volUser) {
        const firstVol = await db.user.findFirst({ where: { role: 'volunteer' } });
        volId = firstVol ? firstVol.id : 'vol-1';
      }

      const updated = await db.donation.update({
        where: { id },
        data: {
          status: 'claimed',
          volunteer_id: volId,
        },
        include: {
          donor: true,
          volunteer: true,
        },
      });

      return NextResponse.json(updated);
    }

    // Direct status updates (e.g., picked_up, delivered, available)
    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'delivered') {
        updateData.delivered_at = new Date();
      }
      if (status === 'available') {
        updateData.volunteer_id = null;
      }
    }

    if (volunteer_id) {
      updateData.volunteer_id = volunteer_id;
    }

    const updated = await db.donation.update({
      where: { id },
      data: updateData,
      include: {
        donor: true,
        volunteer: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating donation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
