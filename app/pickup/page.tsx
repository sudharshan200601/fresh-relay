'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import { Map } from '@/components/Map';
import { CountdownBadge } from '@/components/CountdownBadge';
import { Navigation, MapPin, Truck, CheckCircle2 } from 'lucide-react';

interface DonationItem {
  id: string;
  food_type: string;
  category: string;
  quantity: number;
  quantity_unit: string;
  pickup_address: string;
  latitude: number;
  longitude: number;
  expiry_time: string;
  status: 'available' | 'claimed' | 'picked_up' | 'delivered';
  donor_id?: string | null;
  receiver?: {
    name: string;
    organization: string;
  };
}

export default function ActivePickupsOverview() {
  const router = useRouter();
  const { currentUser } = useRole();
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/donations');
        const data = await res.json();
        if (Array.isArray(data)) {
          setDonations(data);
          // If there is an active claimed or picked_up donation, automatically redirect to first one
          const active = data.find(
            (d) => d.status === 'claimed' || d.status === 'picked_up'
          );
          if (active) {
            router.push(`/pickup/${active.id}`);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const activeDonations = donations.filter(
    (d) => d.status === 'claimed' || d.status === 'picked_up'
  );

  const mapMarkers = donations.map((d) => ({
    id: d.id,
    position: [d.latitude || 37.7749, d.longitude || -122.4194] as [number, number],
    title: d.receiver?.name || d.food_type,
    address: d.pickup_address,
    status: d.status,
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">
            LOGISTICS DISPATCH
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Active Pickups</h1>
          <p className="text-xs text-slate-500">
            {activeDonations.length} active rescue missions in transit
          </p>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-100 space-y-3">
        <h3 className="font-bold text-slate-900 text-sm">Active Fleet Route Overview</h3>
        <Map markers={mapMarkers} className="h-72 w-full rounded-xl overflow-hidden shadow-inner" />
      </div>

      {/* Pickups List */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 text-sm">Select Mission Route</h3>
        {donations.map((item) => (
          <Link
            key={item.id}
            href={`/pickup/${item.id}`}
            className="block bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">#{item.id}</span>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
                  {item.food_type}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">{item.pickup_address}</p>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                  item.status === 'claimed'
                    ? 'bg-sky-100 text-sky-800'
                    : item.status === 'picked_up'
                    ? 'bg-amber-100 text-amber-800'
                    : item.status === 'delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {item.status}
              </span>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-emerald-700">
                {item.quantity} {item.quantity_unit}
              </span>
              <span className="text-sky-600 font-bold group-hover:underline">
                View Route & Instructions →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
