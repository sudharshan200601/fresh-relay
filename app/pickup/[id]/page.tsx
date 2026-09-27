'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRole } from '@/context/RoleContext';
import { CountdownBadge } from '@/components/CountdownBadge';
import { Map } from '@/components/Map';
import {
  ArrowLeft,
  Navigation,
  CheckCircle2,
  PhoneCall,
  FileText,
  AlertTriangle,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  Box,
  Thermometer,
  Users,
} from 'lucide-react';

interface DonationDetails {
  id: string;
  receiver_id: string;
  receiver: {
    name: string;
    organization: string;
    phone?: string;
    avatar?: string;
  };
  food_type: string;
  category: string;
  quantity: number;
  quantity_unit: string;
  servings?: number;
  dietary_flags: string;
  pickup_address: string;
  latitude: number;
  longitude: number;
  pickup_instructions?: string;
  expiry_time: string;
  status: 'available' | 'claimed' | 'picked_up' | 'delivered';
  donor_id?: string | null;
  donor?: {
    name: string;
    phone?: string;
  } | null;
}

export default function PickupDetailsView() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, showToast } = useRole();
  const id = (params?.id as string) || 'DON-4082';

  const [donation, setDonation] = useState<DonationDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  async function loadDetails() {
    setLoading(true);
    try {
      const res = await fetch(`/api/donations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDonation(data);
      } else {
        // Fallback to list
        const listRes = await fetch('/api/donations');
        const listData = await listRes.json();
        if (Array.isArray(listData) && listData.length > 0) {
          setDonation(listData[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDetails();
  }, [id]);

  async function handleProgressStep(nextStatus: 'claimed' | 'picked_up' | 'delivered') {
    if (!donation) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/donations/${donation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          donor_id: currentUser.id,
        }),
      });

      const updatedData = await res.json();
      if (res.ok) {
        setDonation(updatedData);
        showToast(
          nextStatus === 'picked_up'
            ? '🚚 Marked surplus food as Picked Up! En route to shelter.'
            : nextStatus === 'delivered'
            ? '🎉 Mission Accomplished! Surplus food delivered to shelter.'
            : `Status updated to ${nextStatus}`
        );
      } else {
        showToast(`Error: ${updatedData.error}`);
      }
    } catch (err) {
      showToast('Failed to update status');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading pickup route details...</p>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <p className="text-sm font-bold text-slate-800">Donation not found</p>
        <Link href="/donations" className="text-xs font-bold text-emerald-600 hover:underline">
          Return to Feed
        </Link>
      </div>
    );
  }

  // Calculate current step index (1-5)
  // 1: Claimed, 2: En Route, 3: Loaded (picked_up), 4: Transit, 5: Drop (delivered)
  const stepIndex =
    donation.status === 'delivered'
      ? 5
      : donation.status === 'picked_up'
      ? 3
      : donation.status === 'claimed'
      ? 2
      : 1;

  const parseFlags: string[] = JSON.parse(donation.dietary_flags || '[]');

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-8">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/donations"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>

        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Mission ID
          </span>
          <span className="text-xs font-extrabold text-slate-800">#{donation.id}</span>
        </div>
      </div>

      {/* Interactive Map Section */}
      <div className="bg-white p-2.5 rounded-2xl shadow-card border border-slate-100 space-y-2 relative overflow-hidden">
        {/* Navigation Floating Header Overlay */}
        <div className="absolute top-4 left-4 right-4 z-10 bg-slate-900/90 text-white p-3 rounded-xl backdrop-blur-md flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-sky-500 rounded-lg">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold">In 300 ft, Turn Right</div>
              <div className="text-[10px] opacity-80">Market St & 4th Ave • 8 min away</div>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-sky-600 text-white text-[11px] font-bold rounded-md">
            0.6 mi
          </span>
        </div>

        <Map
          center={[donation.latitude || 37.7749, donation.longitude || -122.4194]}
          zoom={14}
          markers={[
            {
              id: donation.id,
              position: [donation.latitude || 37.7749, donation.longitude || -122.4194],
              title: donation.receiver?.name || 'Pickup Point',
              address: donation.pickup_address,
              status: donation.status,
              type: 'pickup',
            },
          ]}
          showRoute={true}
          className="h-64 w-full rounded-xl overflow-hidden shadow-inner pt-14"
        />
      </div>

      {/* Active Pickup Mission Card */}
      <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-sky-100 text-sky-800 uppercase tracking-wider">
                Mission #{donation.id}
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">Priority Dispatch</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              Pickup Route Active
            </h2>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 block">Arrival Target</span>
            <span className="text-sm font-extrabold text-emerald-600">10:45 AM</span>
          </div>
        </div>

        {/* Mission Step Timeline Progress Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Mission Progress</span>
            <span className="text-emerald-600">Step {stepIndex} of 5</span>
          </div>

          {/* Stepper Dots */}
          <div className="relative flex items-center justify-between">
            {/* Background Line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 z-0 transition-all duration-500"
              style={{ width: `${((stepIndex - 1) / 4) * 100}%` }}
            />

            {['Claimed', 'En Route', 'Loaded', 'Transit', 'Drop'].map((label, idx) => {
              const stepNum = idx + 1;
              const isDone = stepNum <= stepIndex;

              return (
                <div key={label} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                      isDone
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-white text-slate-400 border-2 border-slate-300'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : stepNum}
                  </div>
                  <span
                    className={`text-[10px] font-bold mt-1 ${
                      isDone ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payload Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                {donation.receiver?.organization || donation.receiver?.name}
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {donation.quantity} {donation.quantity_unit} • {donation.food_type}
              </p>
            </div>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-lg border border-amber-200 flex items-center">
              <Thermometer className="w-3.5 h-3.5 mr-1" />
              Hot Hold (140°F+)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
              <span className="text-[10px] text-slate-400 font-bold block">Container Info</span>
              <span className="font-bold text-slate-800">6 Deep Aluminum Trays</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
              <span className="text-[10px] text-slate-400 font-bold block">Est. Volume</span>
              <span className="font-bold text-slate-800">
                ~{donation.servings || Math.round(donation.quantity * 0.8)} Servings
              </span>
            </div>
          </div>
        </div>

        {/* Action Call & Contact Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => showToast(`Calling Receiver (${donation.receiver?.phone || '415-555-0189'})`)}
            className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors flex items-center justify-center space-x-1"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Receiver</span>
          </button>

          <button
            onClick={() => showToast('Shelter Note: Delivery door on 4th Ave entrance')}
            className="py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold transition-colors flex items-center justify-center space-x-1"
          >
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            <span>Shelter Note</span>
          </button>

          <button
            onClick={() => showToast('🚨 Emergency dispatch alerted for courier assistance')}
            className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors flex items-center justify-center space-x-1"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Emergency</span>
          </button>
        </div>

        {/* Loading Dock Instructions */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-900 font-bold">
            <span className="flex items-center">
              <Truck className="w-4 h-4 mr-1.5 text-slate-700" />
              Loading Dock Instructions
            </span>
            <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
              Gate #8821
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed pt-1">
            {donation.pickup_instructions ||
              'Park in designated yellow bay #2 behind the alley roll-up door. Buzz buzzer on left if unattended. Food safety protocol: temp probes and HACCP signatures required before handoff.'}
          </p>
        </div>

        {/* Primary Action Button: Workflow Progression */}
        <div className="pt-2">
          {donation.status === 'claimed' && (
            <button
              onClick={() => handleProgressStep('picked_up')}
              disabled={updating}
              className="w-full py-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-sm shadow-lg shadow-sky-500/20 active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
            >
              <Truck className="w-5 h-5" />
              <span>{updating ? 'Updating...' : 'Arrived at Pickup • Mark as Picked Up'}</span>
            </button>
          )}

          {donation.status === 'picked_up' && (
            <button
              onClick={() => handleProgressStep('delivered')}
              disabled={updating}
              className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              <span>{updating ? 'Updating...' : 'Arrived at Shelter • Mark as Delivered'}</span>
            </button>
          )}

          {donation.status === 'delivered' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="font-extrabold text-sm text-emerald-900">
                Mission Completed & Delivered!
              </h4>
              <p className="text-xs text-emerald-700">
                This surplus food was successfully delivered to St. Jude Shelter. Thank you for your service!
              </p>
            </div>
          )}

          {donation.status === 'available' && (
            <button
              onClick={() => handleProgressStep('claimed')}
              disabled={updating}
              className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              <span>{updating ? 'Updating...' : 'Claim Pickup Task'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
