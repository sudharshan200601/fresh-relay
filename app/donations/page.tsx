'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRole } from '@/context/RoleContext';
import { CountdownBadge } from '@/components/CountdownBadge';
import { Map } from '@/components/Map';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Utensils,
  ShieldAlert,
  Flame,
  Apple,
  Cookie,
  Info,
  Navigation,
  Sparkles,
  RefreshCw,
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
  servings?: number;
  dietary_flags: string;
  pickup_address: string;
  latitude: number;
  longitude: number;
  pickup_instructions?: string;
  expiry_time: string;
  status: 'available' | 'claimed' | 'picked_up' | 'delivered';
  volunteer_id?: string | null;
  volunteer?: {
    name: string;
  } | null;
}

export default function DonationListingFeed() {
  const { currentUser, showToast } = useRole();
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'feed' | 'map'>('feed');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  async function loadDonations() {
    setLoading(true);
    try {
      const res = await fetch('/api/donations');
      const data = await res.json();
      if (Array.isArray(data)) {
        setDonations(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDonations();
  }, []);

  async function handleClaimPickup(donation: DonationItem) {
    setClaimingId(donation.id);
    try {
      const res = await fetch(`/api/donations/${donation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'claim',
          volunteer_id: currentUser.id,
        }),
      });

      const data = await res.json();

      if (res.status === 409 || data.alreadyClaimed) {
        showToast(`⚠️ Double-booking prevented! This donation was already claimed by another volunteer.`);
        loadDonations();
      } else if (res.ok) {
        setDonations((prev) =>
          prev.map((d) => (d.id === donation.id ? data : d))
        );
        showToast(`🎉 Successfully claimed ${donation.food_type}! Route generated.`);
      } else {
        showToast(`Error claiming donation: ${data.error}`);
      }
    } catch (err) {
      showToast('Failed to claim pickup. Please check your connection.');
    } finally {
      setClaimingId(null);
    }
  }

  // Filter donations based on category / search / urgency
  const now = new Date();
  const filteredDonations = donations.filter((d) => {
    // Search query
    const matchesSearch =
      searchQuery === '' ||
      d.food_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.pickup_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.donor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.donor?.organization.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'urgent') {
      const expiry = new Date(d.expiry_time).getTime();
      return expiry - now.getTime() <= 2 * 60 * 60 * 1000 && d.status === 'available';
    }
    if (activeFilter === 'produce') {
      return d.category === 'Raw Produce';
    }
    if (activeFilter === 'bakery') {
      return d.category === 'Baked Goods';
    }
    if (activeFilter === 'hot') {
      return d.category === 'Hot Meals';
    }

    return true;
  });

  const availableDonations = filteredDonations.filter((d) => d.status === 'available');
  const claimedByMe = donations.filter(
    (d) => (d.status === 'claimed' || d.status === 'picked_up') && d.volunteer_id === currentUser.id
  );

  const totalAvailableWeight = availableDonations.reduce((acc, d) => acc + d.quantity, 0);

  const mapMarkers = filteredDonations.map((d) => ({
    id: d.id,
    position: [d.latitude || 37.7749, d.longitude || -122.4194] as [number, number],
    title: `${d.donor?.name || 'Donor'} (${d.quantity} ${d.quantity_unit})`,
    address: d.pickup_address,
    status: d.status,
  }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-card border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700">
              {availableDonations.length} Live Listings • {totalAvailableWeight} lbs Available Nearby
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Surplus Food Rescue Feed
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Claim available surplus donations and route them to nearby community shelters.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'feed' ? 'map' : 'feed')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center space-x-1.5"
          >
            <Navigation className="w-4 h-4 text-sky-600" />
            <span>{viewMode === 'feed' ? 'Map View' : 'Feed View'}</span>
          </button>
          <button
            onClick={loadDonations}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Claimed Active Task Alert Banner */}
      {claimedByMe.length > 0 && (
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                You have {claimedByMe.length} active claimed pickup!
              </span>
              <h3 className="text-sm font-bold">{claimedByMe[0].food_type}</h3>
              <p className="text-xs opacity-90">{claimedByMe[0].pickup_address}</p>
            </div>
          </div>
          <Link
            href={`/pickup/${claimedByMe[0].id}`}
            className="px-4 py-2 bg-white text-sky-700 font-bold text-xs rounded-xl hover:bg-slate-100 shadow-md transition-all shrink-0"
          >
            Go to Active Route →
          </Link>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search donor name, food category, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1 shrink-0 ${
              activeFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>All ({donations.length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('urgent')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1 shrink-0 ${
              activeFilter === 'urgent'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500 group-hover:text-white" />
            <span>⚡ Urgent (&lt;2h)</span>
          </button>

          <button
            onClick={() => setActiveFilter('produce')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1 shrink-0 ${
              activeFilter === 'produce'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Apple className="w-3.5 h-3.5 text-emerald-500" />
            <span>Fresh Produce</span>
          </button>

          <button
            onClick={() => setActiveFilter('bakery')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1 shrink-0 ${
              activeFilter === 'bakery'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Cookie className="w-3.5 h-3.5 text-amber-600" />
            <span>Baked Goods</span>
          </button>

          <button
            onClick={() => setActiveFilter('hot')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1 shrink-0 ${
              activeFilter === 'hot'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Hot Meals</span>
          </button>
        </div>
      </div>

      {/* Map View Toggle */}
      {viewMode === 'map' ? (
        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-100 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">Interactive Food Rescue Map</h3>
          <Map markers={mapMarkers} className="h-96 w-full rounded-xl overflow-hidden shadow-inner" />
        </div>
      ) : (
        /* Feed Cards List */
        <div className="space-y-4">
          {filteredDonations.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center space-y-3 border border-slate-100">
              <Utensils className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No surplus donations match this filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try switching filters or check back shortly as food donors continuously publish surplus trays.
              </p>
            </div>
          ) : (
            filteredDonations.map((item) => {
              const isAvailable = item.status === 'available';
              const isClaimedByMe = item.volunteer_id === currentUser.id;
              const parseFlags: string[] = JSON.parse(item.dietary_flags || '[]');

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    isAvailable
                      ? 'border-slate-200/90 shadow-card hover:shadow-hover'
                      : item.status === 'claimed'
                      ? 'border-sky-200 bg-sky-50/20'
                      : 'border-slate-200 opacity-80'
                  }`}
                >
                  {/* Top Bar inside card */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-emerald-600 text-sm overflow-hidden shrink-0 border border-slate-200">
                          {item.donor?.avatar ? (
                            <img
                              src={item.donor.avatar}
                              alt={item.donor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                              {item.donor?.organization || item.donor?.name || 'Verified Partner'}
                            </h3>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          </div>
                          <p className="text-xs text-slate-500 flex items-center mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
                            {item.pickup_address}
                          </p>
                        </div>
                      </div>

                      {/* Expiry Badge */}
                      <CountdownBadge expiryTime={item.expiry_time} />
                    </div>

                    {/* Food Payload Banner */}
                    <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-lg font-black text-emerald-600">
                            {item.quantity} {item.quantity_unit}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            (~{item.servings || Math.round(item.quantity * 0.8)} meals)
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm mt-0.5">
                          {item.food_type}
                        </h4>
                      </div>

                      {/* Category Badge */}
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-200/80 shadow-2xs self-start sm:self-center">
                        {item.category}
                      </span>
                    </div>

                    {/* Dietary & Transport Tags */}
                    {parseFlags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {parseFlags.map((flag, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Instruction snippet */}
                    {item.pickup_instructions && (
                      <p className="text-xs text-slate-500 italic bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
                        📌 {item.pickup_instructions}
                      </p>
                    )}

                    {/* Action Button Section */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-400 font-medium">
                        Pickup window closes: {new Date(item.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>

                      {isAvailable ? (
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/pickup/${item.id}`}
                            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                            title="View details"
                          >
                            <Info className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleClaimPickup(item)}
                            disabled={claimingId === item.id}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center space-x-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                            <span>{claimingId === item.id ? 'Claiming...' : 'Claim Pickup'}</span>
                          </button>
                        </div>
                      ) : isClaimedByMe ? (
                        <Link
                          href={`/pickup/${item.id}`}
                          className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center space-x-1"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Active Task Route →</span>
                        </Link>
                      ) : (
                        <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold">
                          Status: {item.status.toUpperCase()} ({item.volunteer?.name || 'Assigned'})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
