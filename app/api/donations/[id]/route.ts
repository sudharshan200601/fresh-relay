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
        receiver: true,
        donor: true,
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
    const { action, status, donor_id } = body;

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
            error: `This donation has already been ${existing.status} by another donor!`,
            alreadyClaimed: true,
          },
          { status: 409 } // Conflict
        );
      }

      // Assign donor or fallback to first donor user
      let volId = donor_id || 'vol-1';
      const volUser = await db.user.findUnique({ where: { id: volId } });
      if (!volUser) {
        const firstVol = await db.user.findFirst({ where: { role: 'donor' } });
        volId = firstVol ? firstVol.id : 'vol-1';
      }

      const updated = await db.donation.update({
        where: { id },
        data: {
          status: 'claimed',
          donor_id: volId,
        },
        include: {
          receiver: true,
          donor: true,
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
        updateData.donor_id = null;
      }
    }

    if (donor_id) {
      updateData.donor_id = donor_id;
    }

    const updated = await db.donation.update({
      where: { id },
      data: updateData,
      include: {
        receiver: true,
        donor: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating donation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
