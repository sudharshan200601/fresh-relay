'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Car, Clock, CheckCircle2, Navigation, MessageSquare, ShieldCheck, Map as MapIcon, User } from 'lucide-react';
import Link from 'next/link';

export default function VolunteerTracker() {
  const [progress, setProgress] = useState(2); // 0, 1, 2, 3
  const [activeDonation, setActiveDonation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock Data for driver (since we don't have driver backend yet)
  const volunteer = {
    name: 'Alex Johnson',
    phone: '+1 (555) 932-1144',
    rating: '4.9',
    deliveries: 142,
    vehicle: 'Honda Civic (Blue)',
    plate: '7XYZ892',
    eta: '14 min',
    distance: '3.2 miles'
  };

  const steps = [
    { id: 0, label: 'Donation Posted', time: '10:00 AM' },
    { id: 1, label: 'Volunteer Assigned', time: '10:05 AM' },
    { id: 2, label: 'On the Way to Pickup', time: '10:12 AM' },
    { id: 3, label: 'Arrived at Pickup', time: 'Pending' }
  ];

  // Simulate progress and fetch donation data
  useEffect(() => {
    async function fetchActiveDonation() {
      try {
        const res = await fetch('/api/donor/donations');
        if (res.ok) {
          const donations = await res.json();
          // Find an active donation (e.g., verified, assigned, or picked_up) or just the most recent one
          const active = donations.find((d: any) => d.status !== 'completed' && d.status !== 'rejected') || donations[0];
          setActiveDonation(active);
        }
      } catch (error) {
        console.error("Failed to fetch donation data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchActiveDonation();

    const timer = setTimeout(() => {
      setProgress(3);
    }, 15000); // Wait 15 seconds then advance
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!activeDonation) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md text-center">
          <CheckCircle2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">No Active Pickups</h2>
          <p className="text-slate-500 mb-6">You don't have any active food donations waiting for a volunteer driver right now.</p>
          <Link href="/donor/dashboard" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-colors inline-block">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active Pickup</h1>
            <p className="text-slate-500 mt-1">
              Order #{activeDonation.id.slice(0, 8).toUpperCase()} • {activeDonation.quantityKg}kg {activeDonation.foodType}
            </p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl font-bold">
              <Clock className="w-5 h-5" />
              <span>ETA: {progress === 3 ? 'Arrived' : volunteer.eta}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Map & Driver Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Mock Map UI */}
            <div className="bg-slate-200 h-80 rounded-2xl border-4 border-white shadow-md relative overflow-hidden flex items-center justify-center">
              {/* Real Map Embed (Potheri, Chennai) */}
              <iframe 
                src="https://maps.google.com/maps?q=Potheri,Chennai&t=&z=14&ie=UTF8&iwloc=&output=embed" 
                className="absolute inset-0 w-full h-full opacity-60" 
                frameBorder="0" 
                style={{ border: 0 }} 
                allowFullScreen 
                aria-hidden="false" 
                tabIndex={0} 
              />

              {/* Pins */}
              <div className="absolute left-[80px] bottom-[50px] flex flex-col items-center animate-bounce">
                <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white"><Car size={20} /></div>
              </div>
              <div className="absolute right-[30%] top-[40%] flex flex-col items-center">
                <div className="bg-emerald-500 text-white p-2 rounded-full shadow-lg border-2 border-white z-10"><MapPin size={24} /></div>
                <div className="bg-white px-3 py-1 rounded-full text-xs font-bold shadow-sm mt-1">Pickup Loc</div>
              </div>

              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm text-sm font-bold text-slate-700 flex items-center gap-2 border border-slate-200">
                <Navigation size={16} className="text-blue-600" />
                Live Tracking Enabled
              </div>
            </div>

            {/* Driver Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-emerald-500">
                     <User size={32} className="text-slate-400" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">{volunteer.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                     <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs">★ {volunteer.rating}</span>
                     <span>• {volunteer.deliveries} deliveries</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-6 py-3 rounded-xl font-bold transition-colors">
                   <Phone size={18} /> Call
                </button>
                <button className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition-colors">
                   <MessageSquare size={18} /> Chat
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Status & Vehicle */}
          <div className="space-y-6">
            
            {/* Vehicle Details */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Vehicle Details</h3>
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-slate-600 font-medium">Model</span>
                   <span className="font-bold text-slate-900">{volunteer.vehicle}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-slate-600 font-medium">License Plate</span>
                   <span className="bg-yellow-100 text-yellow-900 px-2 py-1 rounded font-mono font-bold">{volunteer.plate}</span>
                 </div>
               </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Delivery Status</h3>
               <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
                  {steps.map((step, idx) => {
                    const isCompleted = idx <= progress;
                    const isCurrent = idx === progress;
                    
                    return (
                      <div key={step.id} className="relative pl-6">
                        {/* Dot */}
                        <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                           {isCompleted && <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>}
                        </div>
                        
                        <div>
                          <h4 className={`font-bold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</h4>
                          <p className="text-xs text-slate-500 font-medium mt-1">{isCompleted ? step.time : 'Waiting...'}</p>
                        </div>
                      </div>
                    );
                  })}
               </div>
            </div>
            
            {progress === 3 && (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl shadow-sm text-center animate-in fade-in zoom-in duration-300">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-emerald-900 mb-1">Volunteer Arrived!</h3>
                <p className="text-emerald-700 text-sm">Please hand over the food to {volunteer.name.split(' ')[0]}.</p>
                <button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors">
                  Confirm Handover
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
