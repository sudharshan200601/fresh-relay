'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole, UserRole } from '@/context/RoleContext';
import { Bell, HeartHandshake, ShieldCheck, UserCheck, UtensilsCrossed } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { role, setRole, currentUser } = useRole();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Subtitle */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg text-slate-800 tracking-tight">Fresh Relay</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className="text-[11px] text-slate-500 font-medium tracking-wide block -mt-1">
                  Food Logistics Hub
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links for Admin & Receiver */}
            {role !== 'donor' && (
              <nav className="hidden md:flex items-center space-x-1 ml-6 border-l border-slate-200 pl-6">
                <Link
                  href="/"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === '/'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/donations"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname.startsWith('/donations')
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Feed
                </Link>
                <Link
                  href="/post"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === '/post'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Post Food
                </Link>
                <Link
                  href="/pickup"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname.startsWith('/pickup')
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Active Pickups
                </Link>
                <Link
                  href="/impact"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === '/impact'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Impact
                </Link>
              </nav>
            )}

            {/* Desktop Navigation Links for Donor */}
            {role === 'donor' && (
              <nav className="hidden md:flex items-center space-x-1 ml-6 border-l border-slate-200 pl-6">
                <Link
                  href="/donor/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname === '/donor/dashboard'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/donor/volunteer"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    pathname.startsWith('/donor/volunteer')
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Volunteer Tracker
                </Link>
              </nav>
            )}
          </div>

          {/* Right Section: Role Switcher Demo Control & Notifications & User Profile */}
          <div className="flex items-center space-x-3">
            {/* Role Switcher Pill */}
            {role !== 'donor' && (
              <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200">
                <button
                  onClick={() => setRole('admin')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all flex items-center space-x-1 ${
                    role === 'admin'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="View as Admin Coordinator"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
                <button
                  onClick={() => setRole('donor')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all flex items-center space-x-1 ${
                    role === 'donor'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="View as Donor"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Donor</span>
                </button>
                <button
                  onClick={() => setRole('receiver')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all flex items-center space-x-1 ${
                    role === 'receiver'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="View as Food Receiver"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Receiver</span>
                </button>
              </div>
            )}

            {/* Notification Bell */}
            <button className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                2
              </span>
            </button>

            {/* User Avatar & Org Tag */}
            <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
              />
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                  {currentUser.role} • {currentUser.organization}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
