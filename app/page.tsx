'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRole } from '@/context/RoleContext';
import { CountdownBadge } from '@/components/CountdownBadge';
import { Map } from '@/components/Map';
import {
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  PhoneCall,
  MapPin,
  RefreshCw,
  CloudRain,
  Flame,
} from 'lucide-react';

interface DonationItem {
  id: string;
  donor_id: string;
  donor: {
    name: string;
    organization: string;
    avatar?: string;
  };
  food_type: string;
  category: string;
  quantity: number;
  quantity_unit: string;
  pickup_address: string;
  latitude: number;
  longitude: number;
  expiry_time: string;
  status: 'available' | 'claimed' | 'picked_up' | 'delivered';
  volunteer_id?: string | null;
  volunteer?: {
    name: string;
    organization?: string;
  } | null;
  delivered_at?: string;
}

export default function CoordinatorDashboard() {
  const { role, currentUser, showToast } = useRole();
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'kanban' | 'feed'>('kanban');

  async function fetchDonations() {
    setLoading(true);
    try {
      const res = await fetch('/api/donations');
      const data = await res.json();
      if (Array.isArray(data)) {
        setDonations(data);
      }
    } catch (err) {
      console.error('Failed to fetch donations:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDonations();
  }, []);

  // Update status handler
  async function handleStatusChange(id: string, newStatus: string) {
    try {
      const res = await fetch(`/api/donations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setDonations((prev) =>
          prev.map((item) => (item.id === id ? data : item))
        );
        showToast(`Updated status of ${id} to ${newStatus.toUpperCase()}`);
      } else {
        showToast(`Error: ${data.error}`);
      }
    } catch (err) {
      showToast('Failed to update status');
    }
  }

  const activeRescues = donations.filter(
    (d) => d.status === 'claimed' || d.status === 'picked_up'
  );
  const pendingCount = donations.filter((d) => d.status === 'available').length;
  const deliveredCount = donations.filter((d) => d.status === 'delivered').length;
  const now = new Date();
  const expiringSoonCount = donations.filter(
    (d) =>
      d.status === 'available' &&
      new Date(d.expiry_time).getTime() - now.getTime() < 2 * 60 * 60 * 1000
  ).length;

  const mapMarkers = donations.map((d) => ({
    id: d.id,
    position: [d.latitude || 37.7749, d.longitude || -122.4194] as [number, number],
    title: d.donor?.name || d.food_type,
    address: d.pickup_address,
    status: d.status,
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner / Role Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-card border border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              CENTRAL HUB DISPATCH
            </span>
            <span className="text-xs text-slate-400 font-medium">Zone 4 Active</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Good morning, {currentUser.name}!
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            4 hubs reporting optimal capacity • High volume morning dispatch active
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchDonations}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center text-xs font-semibold"
            title="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <Link
            href="/post"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Post New Surplus</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Pickups */}
        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-100 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Rescues
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">
              {activeRescues.length}
            </span>
            <span className="text-xs font-semibold text-sky-600">in transit</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, activeRescues.length * 25)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Expiring < 2h */}
        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-100 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Expiring &lt; 2h
            </span>
            <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-amber-500 text-white uppercase">
              Urgent
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-amber-600">
              {expiringSoonCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">need match</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, expiringSoonCount * 33)}%` }}
            />
          </div>
        </div>

        {/* Card 3: Pending & Meals Routed */}
        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Listings
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">{pendingCount}</span>
            <span className="text-xs font-bold text-emerald-600">available</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            +18% rescue throughput vs yesterday
          </p>
        </div>

        {/* Card 4: Delivered */}
        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Delivered Today
            </span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-600">{deliveredCount}</span>
            <span className="text-xs font-semibold text-slate-500">rescued</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            9 active volunteers en route
          </p>
        </div>
      </div>

      {/* Main Content Area: Kanban Logistics Board vs Map/Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Kanban Board */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100">
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-800">Logistics Kanban Dispatch</h2>
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {donations.length} Total
              </span>
            </div>

            <div className="flex items-center space-x-1 text-xs">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('available')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  filterStatus === 'available'
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Available ({pendingCount})
              </button>
            </div>
          </div>

          {/* Kanban Columns (4 Status Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 overflow-x-auto pb-2">
            {/* Column 1: Available */}
            <div className="bg-slate-100/70 p-3 rounded-2xl border border-slate-200/60 min-w-[200px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                  Available
                </span>
                <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full shadow-2xs">
                  {donations.filter((d) => d.status === 'available').length}
                </span>
              </div>

              <div className="space-y-3">
                {donations
                  .filter((d) => d.status === 'available')
                  .map((d) => (
                    <div
                      key={d.id}
                      className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-bold text-slate-400">
                          #{d.id}
                        </span>
                        <CountdownBadge expiryTime={d.expiry_time} compact />
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mt-1 line-clamp-1">
                        {d.food_type}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {d.donor?.organization || d.donor?.name}
                      </p>
                      <div className="mt-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md inline-block">
                        {d.quantity} {d.quantity_unit}
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <Link
                          href={`/pickup/${d.id}`}
                          className="text-[11px] text-sky-600 font-bold hover:underline"
                        >
                          Details
                        </Link>
                        <button
                          onClick={() => handleStatusChange(d.id, 'claimed')}
                          className="px-2 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold transition-colors"
                        >
                          Claim
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Column 2: Claimed */}
            <div className="bg-sky-50/60 p-3 rounded-2xl border border-sky-100 min-w-[200px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-black text-sky-800 uppercase tracking-wider flex items-center">
                  <span className="w-2 h-2 rounded-full bg-sky-500 mr-2" />
                  Claimed
                </span>
                <span className="text-xs font-bold text-sky-700 bg-white px-2 py-0.5 rounded-full shadow-2xs">
                  {donations.filter((d) => d.status === 'claimed').length}
                </span>
              </div>

              <div className="space-y-3">
                {donations
                  .filter((d) => d.status === 'claimed')
                  .map((d) => (
                    <div
                      key={d.id}
                      className="bg-white p-3 rounded-xl border border-sky-200/70 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-bold text-slate-400">
                          #{d.id}
                        </span>
                        <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                          Assigned
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mt-1 line-clamp-1">
                        {d.food_type}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Vol: {d.volunteer?.name || 'Marcus T.'}
                      </p>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <Link
                          href={`/pickup/${d.id}`}
                          className="text-[11px] text-sky-600 font-bold hover:underline"
                        >
                          Track Route
                        </Link>
                        <button
                          onClick={() => handleStatusChange(d.id, 'picked_up')}
                          className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold transition-colors"
                        >
                          Mark Picked Up
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Column 3: Picked Up */}
            <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-100 min-w-[200px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-ping" />
                  In Transit
                </span>
                <span className="text-xs font-bold text-amber-700 bg-white px-2 py-0.5 rounded-full shadow-2xs">
                  {donations.filter((d) => d.status === 'picked_up').length}
                </span>
              </div>

              <div className="space-y-3">
                {donations
                  .filter((d) => d.status === 'picked_up')
                  .map((d) => (
                    <div
                      key={d.id}
                      className="bg-white p-3 rounded-xl border border-amber-200/70 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-bold text-slate-400">
                          #{d.id}
                        </span>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          En Route
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mt-1 line-clamp-1">
                        {d.food_type}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Carrier: {d.volunteer?.name || 'Sarah J.'}
                      </p>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <Link
                          href={`/pickup/${d.id}`}
                          className="text-[11px] text-sky-600 font-bold hover:underline"
                        >
                          Live Route
                        </Link>
                        <button
                          onClick={() => handleStatusChange(d.id, 'delivered')}
                          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-colors"
                        >
                          Mark Delivered
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Column 4: Delivered */}
            <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100 min-w-[200px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                  Delivered
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full shadow-2xs">
                  {donations.filter((d) => d.status === 'delivered').length}
                </span>
              </div>

              <div className="space-y-3">
                {donations
                  .filter((d) => d.status === 'delivered')
                  .map((d) => (
                    <div
                      key={d.id}
                      className="bg-white p-3 rounded-xl border border-emerald-200/60 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-bold text-slate-400">
                          #{d.id}
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mt-1 line-clamp-1">
                        {d.food_type}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Completed: St. Jude Shelter
                      </p>

                      <div className="mt-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                        {d.quantity} {d.quantity_unit} saved
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Regional Map & Alert & Live Activity */}
        <div className="space-y-6">
          {/* Weather Alert Notice */}
          <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200/80 space-y-3 shadow-sm">
            <div className="flex items-center space-x-2 text-sky-800 font-bold text-xs">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-600">
                <CloudRain className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Rainstorm Inbound • Eastside
                </h4>
                <p className="text-[11px] text-slate-600 font-normal">
                  Expect 15m courier delays along Route 9. Waterproof insulated crates required.
                </p>
              </div>
            </div>
            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => showToast('Dispatched comms broadcast to 14 active couriers')}
                className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-colors shadow-xs text-center"
              >
                Dispatch Comms Channel
              </button>
            </div>
          </div>

          {/* Regional Hotspot Map */}
          <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Regional Hotspot Map</h3>
                <p className="text-xs text-slate-500">
                  {donations.filter((d) => d.status !== 'delivered').length} Active Pickups in Perimeter
                </p>
              </div>
              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">
                Live Feed
              </span>
            </div>

            <Map markers={mapMarkers} className="h-56 w-full rounded-xl overflow-hidden shadow-inner" />

            <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                3 vans within 1.2 miles
              </span>
              <Link
                href="/pickup"
                className="text-sky-600 font-bold hover:underline flex items-center"
              >
                Full Map View <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Live Activity Feed</h3>
              <Link href="/donations" className="text-xs font-bold text-sky-600 hover:underline">
                View All ({donations.length})
              </Link>
            </div>

            <div className="space-y-3">
              {donations.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      {item.donor?.name || item.food_type}
                    </span>
                    <CountdownBadge expiryTime={item.expiry_time} compact />
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {item.quantity} {item.quantity_unit} • {item.category}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-500">
                    <span>
                      {item.status === 'claimed'
                        ? `Claimed by ${item.volunteer?.name || 'Volunteer'}`
                        : item.status === 'delivered'
                        ? 'Delivered to Shelter'
                        : 'Pending pickup'}
                    </span>
                    <Link
                      href={`/pickup/${item.id}`}
                      className="font-bold text-sky-600 hover:underline"
                    >
                      Track Route →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
