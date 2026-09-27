'use client';
import { useState, useEffect } from 'react';
import { Package, MapPin, Clock, Search, Bell } from 'lucide-react';
import Link from 'next/link';

export default function DonorDashboard() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDonations('');
  }, []);

  const fetchDonations = async (queryParam: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/donor/donations${queryParam}`);
      const data = await res.json();
      if (Array.isArray(data)) setDonations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFilter = (type: string) => {
    if (type === 'all') fetchDonations('');
    if (type === 'veg') fetchDonations('?foodType=veg');
    if (type === 'non-veg') fetchDonations('?foodType=non-veg');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-start">
          <div>
             <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Food Marketplace</h1>
             <p className="text-gray-500 mt-2">Browse available food donations and submit requests.</p>
          </div>
          <div className="flex items-center gap-4">
             <button className="relative p-2 text-gray-500 hover:text-gray-900 bg-white rounded-full border shadow-sm">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
             <Link href="/donor/requests" className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm border border-gray-800">
               My Requests
             </Link>
          </div>
        </header>

        {/* Quick Filters */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
           <button onClick={() => handleQuickFilter('all')} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 shadow-sm whitespace-nowrap">Show All</button>
           <button onClick={() => handleQuickFilter('veg')} className="px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm font-medium hover:bg-green-100 shadow-sm whitespace-nowrap">🥕 Veg Only</button>
           <button onClick={() => handleQuickFilter('non-veg')} className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-full text-sm font-medium hover:bg-red-100 shadow-sm whitespace-nowrap">🍗 Non-Veg</button>
           <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 shadow-sm whitespace-nowrap">📍 Near Me</button>
           <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 shadow-sm whitespace-nowrap">📦 Large Quantity</button>
        </div>

        {loading ? (
           <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
        ) : donations.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl border border-gray-100 border-dashed shadow-sm">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No open donations found</h3>
            <p className="text-gray-500">There is no food currently available matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map(d => (
                <div key={d.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                   <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{d.eventName}</h3>
                        <span className="px-3 py-1 text-[10px] font-bold rounded-full border bg-green-100 text-green-800 border-green-200 tracking-wider">
                          AVAILABLE
                        </span>
                      </div>
                      
                      <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700 flex items-center gap-3"><MapPin size={16} className="text-gray-400 min-w-4"/> {d.location}</p>
                        <p className="text-sm text-gray-700 flex items-center gap-3"><Package size={16} className="text-gray-400 min-w-4"/> <span className="font-bold text-gray-900">{d.quantityKg} kg</span> • <span className="uppercase text-xs font-bold">{d.foodCategory}</span></p>
                        {d.pickupBy && <p className="text-sm text-gray-700 flex items-center gap-3"><Clock size={16} className="text-gray-400 min-w-4"/> By {new Date(d.pickupBy).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>}
                      </div>
                   </div>

                   <Link href={`/donor/donations/${d.id}`} className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm">
                     View Details
                   </Link>
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
