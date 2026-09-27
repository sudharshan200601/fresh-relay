'use client';
import { useState, useEffect } from 'react';
import { PlusCircle, Package, Clock, Truck, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function VolunteerDashboard() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/volunteer/donations')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setDonations(data);
        setLoading(false);
      });
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      verified: 'bg-blue-100 text-blue-800 border-blue-200',
      assigned: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      picked_up: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-teal-100 text-teal-800 border-teal-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Volunteer Dashboard</h1>
            <p className="text-gray-500 mt-2">Manage your surplus food donations.</p>
          </div>
          <Link href="/volunteer/new-donation" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium shadow-sm transition-colors">
            <PlusCircle size={20} /> Post New Donation
          </Link>
        </div>

        {loading ? (
           <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
        ) : donations.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl border border-gray-100 border-dashed">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No donations yet</h3>
            <p className="text-gray-500">You haven't posted any food donations yet. Click the button above to start!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map(d => (
              <div key={d.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                 <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{d.eventName}</h3>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(d.status)}`}>
                        {d.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2 mb-6">
                      <p className="text-sm text-gray-600 flex items-center gap-2"><Package size={14} className="text-gray-400"/> {d.quantityKg} kg • {d.foodCategory}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-2"><Clock size={14} className="text-gray-400"/> {new Date(d.createdAt).toLocaleDateString()}</p>
                    </div>
                 </div>
                 <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200">
                    View Details
                 </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
