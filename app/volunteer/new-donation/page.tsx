'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewDonation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    eventName: '', location: '', contactName: '', contactPhone: '',
    foodType: '', foodCategory: 'veg', quantityKg: '', packaging: '',
    availableFrom: '', pickupBy: '', expiryTime: '', instructions: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        router.push('/volunteer/dashboard');
      } else {
        alert('Failed to post donation');
      }
    } catch (err) {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link href="/volunteer/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-medium transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Post Surplus Food</h2>
        
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Event/Venue Name</label>
              <input type="text" name="eventName" required onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
              <input type="text" name="location" required onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
              <input type="text" name="contactName" required onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input type="tel" name="contactPhone" required onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="col-span-2 border-t border-gray-100 pt-6 mt-2"></div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Type (e.g. Cooked Buffet)</label>
              <input type="text" name="foodType" required onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="col-span-2 md:col-span-1 grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg)</label>
                  <input type="number" step="0.1" name="quantityKg" required onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select name="foodCategory" required onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non-Veg</option>
                    <option value="both">Both</option>
                  </select>
               </div>
            </div>

            <div className="col-span-2 border-t border-gray-100 pt-6 mt-2"></div>

            <div className="col-span-2 md:col-span-1">
               <label className="block text-sm font-medium text-gray-700 mb-1">Available From</label>
               <input type="datetime-local" name="availableFrom" onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="col-span-2 md:col-span-1">
               <label className="block text-sm font-medium text-gray-700 mb-1">Pickup By</label>
               <input type="datetime-local" name="pickupBy" onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
              <textarea name="instructions" rows={3} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
            </div>
          </div>
          
          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3.5 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">
              {loading ? 'Submitting...' : 'Post Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
