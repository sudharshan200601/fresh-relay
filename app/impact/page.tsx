'use client';

import React, { useState, useEffect } from 'react';
import { useRole } from '@/context/RoleContext';
import {
  Award,
  TrendingUp,
  Leaf,
  ShieldCheck,
  Share2,
  Download,
  Users,
  Utensils,
  BarChart2,
  HeartHandshake,
  CheckCircle2,
  Flame,
  Sparkles,
} from 'lucide-react';

interface StatsResponse {
  totalMealsRescued: number;
  totalPoundsWastePrevented: number;
  co2DivertedTons: number;
  communityKitchensCount: number;
}

export default function ImpactAnalyticsView() {
  const { showToast } = useRole();
  const [stats, setStats] = useState<StatsResponse>({
    totalMealsRescued: 42850,
    totalPoundsWastePrevented: 56200,
    co2DivertedTons: 51.4,
    communityKitchensCount: 28,
  });
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'ytd' | 'all'>('ytd');

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if (data.totalMealsRescued) {
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header & Time Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-card border border-slate-100">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600">
            <HeartHandshake className="w-4 h-4" />
            <span>COMMUNITY IMPACT METRICS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            Surplus Food Rescue Impact
          </h1>
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setTimeFilter('week')}
            className={`px-2.5 py-1.5 rounded-lg transition-all ${
              timeFilter === 'week' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeFilter('month')}
            className={`px-2.5 py-1.5 rounded-lg transition-all ${
              timeFilter === 'month' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeFilter('ytd')}
            className={`px-2.5 py-1.5 rounded-lg transition-all ${
              timeFilter === 'ytd' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
            }`}
          >
            Year to Date
          </button>
          <button
            onClick={() => setTimeFilter('all')}
            className={`px-2.5 py-1.5 rounded-lg transition-all ${
              timeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Hero Milestone Card */}
      <div className="bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-white/20 backdrop-blur-md text-white border border-white/30">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-200" />
            COMMUNITY MILESTONE REACHED
          </div>

          <div>
            <span className="text-xs uppercase font-bold text-emerald-100 block tracking-wider">
              Total Nourishment Delivered
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-4xl sm:text-5xl font-black tracking-tight">
                {stats.totalMealsRescued.toLocaleString()}
              </span>
              <span className="text-lg font-bold text-emerald-100">Meals Rescued</span>
            </div>
          </div>

          <p className="text-xs text-emerald-50 leading-relaxed max-w-lg">
            You and 312 neighborhood partners have diverted fresh, nutritious food from 89 landfills directly to warm dining tables across the city.
          </p>

          {/* Goal Progress Bar */}
          <div className="pt-2">
            <div className="flex justify-between text-[11px] font-bold text-emerald-100 mb-1">
              <span>Progress to 50K Goal</span>
              <span>85.7%</span>
            </div>
            <div className="w-full bg-emerald-950/30 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/20">
              <div className="bg-amber-300 h-full rounded-full transition-all duration-1000 w-[85.7%]" />
            </div>
          </div>
        </div>
      </div>

      {/* 3 Impact Stat Cards */}
      <div className="space-y-3">
        {/* Stat 1: CO2 Emissions */}
        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              CO2 Emissions Diverted
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900">
                {stats.co2DivertedTons}
              </span>
              <span className="text-xs font-bold text-slate-600">Metric Tons</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              🚘 Equal to taking <strong>11 cars</strong> off the road for 1 full year
            </p>
          </div>

          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
            <Leaf className="w-7 h-7" />
          </div>
        </div>

        {/* Stat 2: Food Waste Prevented */}
        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Food Waste Prevented
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-emerald-600">
                {stats.totalPoundsWastePrevented.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-600">lbs rescued</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              💰 <strong>$138,400</strong> estimated retail value saved
            </p>
          </div>

          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Utensils className="w-7 h-7" />
          </div>
        </div>

        {/* Stat 3: Community Kitchens */}
        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Community Frontline Reach
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-amber-600">
                {stats.communityKitchensCount}
              </span>
              <span className="text-xs font-bold text-slate-600">Community Kitchens</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              🍲 Serving hot meals to over <strong>4,600 guests</strong> weekly
            </p>
          </div>

          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Users className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Certified Quality Callout */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md flex items-center space-x-3">
        <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
            CERTIFIED SAFETY IMPACT
          </span>
          <p className="text-xs font-medium text-slate-200">
            100% of rescued loads inspected and logged within 45 minutes of receiver release.
          </p>
        </div>
      </div>

      {/* Monthly Rescue Volume Chart Component */}
      <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Monthly Rescue Volume</h3>
            <p className="text-xs text-slate-500">Food category distribution (Thousands lbs)</p>
          </div>

          <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
            <BarChart2 className="w-5 h-5" />
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs font-semibold">
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" />
            Fresh Produce
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 mr-1.5" />
            Prepared Foods
          </span>
          <span className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5" />
            Bakery & Grains
          </span>
        </div>

        {/* Custom Visual Stacked Bar Chart */}
        <div className="h-40 flex items-end justify-between pt-6 px-2 gap-4 border-b border-slate-200">
          {[
            { month: 'Oct', produce: 5, prepared: 4, bakery: 3 },
            { month: 'Nov', produce: 6, prepared: 4.5, bakery: 3.5 },
            { month: 'Dec', produce: 7, prepared: 5, bakery: 4 },
            { month: 'Jan', produce: 6.5, prepared: 4.8, bakery: 3.8 },
          ].map((bar) => {
            const total = bar.produce + bar.prepared + bar.bakery;
            return (
              <div key={bar.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="w-full max-w-[48px] rounded-t-lg overflow-hidden flex flex-col justify-end transition-transform group-hover:scale-105 shadow-2xs">
                  {/* Fresh Produce Bar */}
                  <div
                    className="bg-emerald-500 w-full"
                    style={{ height: `${(bar.produce / 16) * 120}px` }}
                    title={`Produce: ${bar.produce}k lbs`}
                  />
                  {/* Prepared Foods Bar */}
                  <div
                    className="bg-sky-400 w-full"
                    style={{ height: `${(bar.prepared / 16) * 120}px` }}
                    title={`Prepared: ${bar.prepared}k lbs`}
                  />
                  {/* Bakery Bar */}
                  <div
                    className="bg-amber-400 w-full"
                    style={{ height: `${(bar.bakery / 16) * 120}px` }}
                    title={`Bakery: ${bar.bakery}k lbs`}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600 mt-2">{bar.month}</span>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-center justify-between text-xs font-semibold text-emerald-800">
          <span className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-1.5 text-emerald-600" />
            +18.4% monthly rescue growth
          </span>
          <span>Produce is #1 category</span>
        </div>
      </div>

      {/* Leaderboard 1: Top Receiver Roll */}
      <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-base">Top Receiver Roll</h3>
          </div>
          <span className="text-xs font-bold text-sky-600">48 Receivers Registered</span>
        </div>

        <div className="space-y-2.5">
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-black text-xs flex items-center justify-center shadow-xs">
                🥇
              </span>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Grand Hyatt Banquets</h4>
                <p className="text-[11px] text-slate-500">Catering & Fresh Entrées</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-black text-xs text-slate-900">4,210 lbs</span>
              <span className="text-[10px] font-bold text-amber-700 block">Gold Hero</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center">
                🥈
              </span>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Metro Supermarkets</h4>
                <p className="text-[11px] text-slate-500">Daily Surplus Produce</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-black text-xs text-slate-900">3,890 lbs</span>
              <span className="text-[10px] font-bold text-slate-500 block">Silver Partner</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-7 h-7 rounded-full bg-amber-700/20 text-amber-900 font-black text-xs flex items-center justify-center">
                🥉
              </span>
              <div>
                <h4 className="font-bold text-xs text-slate-900">Green Valley Co-op</h4>
                <p className="text-[11px] text-slate-500">Artisan Breads & Dairy</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-black text-xs text-slate-900">2,450 lbs</span>
              <span className="text-[10px] font-bold text-amber-800 block">Bronze Champion</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard 2: Donor Rescue Champions */}
      <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-900 text-base">Rescue Champions Leaderboard</h3>
          </div>
          <span className="text-xs font-bold text-sky-600">142 Donors</span>
        </div>

        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
                alt="Sarah Jenkins"
                className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500"
              />
              <div>
                <h4 className="font-bold text-xs text-slate-900">Sarah Jenkins</h4>
                <p className="text-[11px] text-slate-500">District Central Fleet</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-black text-sm text-sky-700">64</span>
              <span className="text-[10px] font-semibold text-slate-500 block">Rescues</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt="David Kim"
                className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500"
              />
              <div>
                <h4 className="font-bold text-xs text-slate-900">David Kim</h4>
                <p className="text-[11px] text-slate-500">East Side Cargo Bike Route</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-black text-sm text-sky-700">48</span>
              <span className="text-[10px] font-semibold text-slate-500 block">Rescues</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
                alt="Elena Rostova"
                className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500"
              />
              <div>
                <h4 className="font-bold text-xs text-slate-900">Elena Rostova</h4>
                <p className="text-[11px] text-slate-500">Suburban Hub Dispatch</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-black text-sm text-sky-700">39</span>
              <span className="text-[10px] font-semibold text-slate-500 block">Rescues</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share / PDF Report Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          onClick={() => showToast('📄 Generating downloadable Impact Report (PDF)...')}
          className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Share Impact Report (PDF)</span>
        </button>

        <button
          onClick={() => showToast('🚀 Shared impact achievements to social channels!')}
          className="w-full py-3.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs shadow-md transition-colors flex items-center justify-center space-x-2"
        >
          <Share2 className="w-4 h-4" />
          <span>Celebrate on Social</span>
        </button>
      </div>
    </div>
  );
}
