'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Phone, User, Package, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DonationDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [donation, setDonation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [reqQty, setReqQty] = useState('');
  const [reqWindow, setReqWindow] = useState('');
  const [reqDate, setReqDate] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState('');
  const [specialReqs, setSpecialReqs] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/receiver/donations/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setDonation(data);
        setLoading(false);
      });
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/receiver/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationId: donation.id,
          requestedQuantity: reqQty,
          preferredPickupWindow: reqWindow,
          preferredDate: reqDate,
          pickupAddress: pickupAddress,
          numberOfPeople: numberOfPeople,
          specialRequirements: specialReqs,
          notes
        })
      });
      if (res.ok) {
        router.push('/receiver/requests');
      } else {
        alert('Failed to submit request');
      }
    } catch (err) {
      alert('Error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center flex justify-center mt-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  if (!donation || donation.error) return <div className="p-8 text-center text-red-500 font-bold">Donation not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link href="/receiver/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-medium">
          <ArrowLeft size={16} /> Back to Marketplace
        </Link>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-6">
             <div>
                <h1 className="text-3xl font-extrabold text-gray-900">{donation.eventName}</h1>
                <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full border border-green-200">
                  OPEN FOR REQUESTS
                </span>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
             <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Location & Contact</h3>
                <p className="flex items-start gap-3 text-gray-600 mb-2"><MapPin size={20} className="text-gray-400 mt-1 min-w-5"/> {donation.location}</p>
                <p className="flex items-center gap-3 text-gray-600 mb-2"><User size={20} className="text-gray-400 min-w-5"/> {donation.contactName} ({donation.donor?.organizationName || 'Donor'})</p>
                <p className="flex items-center gap-3 text-gray-600"><Phone size={20} className="text-gray-400 min-w-5"/> {donation.contactPhone}</p>
             </div>
             
             <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Food Details</h3>
                <p className="flex items-center gap-3 text-gray-600 mb-2"><Package size={20} className="text-gray-400 min-w-5"/> {donation.quantityKg} kg • {donation.foodType}</p>
                <p className="flex items-center gap-3 text-gray-600 mb-2"><span className="font-bold text-gray-400 uppercase text-xs tracking-wider min-w-5">DIET:</span> {donation.foodCategory.toUpperCase()}</p>
                {donation.pickupBy && <p className="flex items-center gap-3 text-gray-600"><Calendar size={20} className="text-gray-400 min-w-5"/> Pickup By: {new Date(donation.pickupBy).toLocaleString()}</p>}
             </div>
          </div>

          <button onClick={() => setShowModal(true)} className="w-full bg-blue-600 text-white p-3.5 rounded-lg font-bold hover:bg-blue-700 transition-colors text-lg shadow-md">
             Request Food
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <button type="button" onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Detailed Food Request</h2>
              <p className="text-gray-500 text-sm mb-6 pb-4 border-b border-gray-100">Please provide full details so the admin can arrange logistics.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requested Quantity (kg) *</label>
                  <input type="number" step="0.1" max={donation.quantityKg} required value={reqQty} onChange={e => setReqQty(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder={`Max: ${donation.quantityKg} kg`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of People Served</label>
                  <input type="number" value={numberOfPeople} onChange={e => setNumberOfPeople(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 50" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date *</label>
                  <input type="date" required value={reqDate} onChange={e => setReqDate(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Window *</label>
                  <input type="text" required value={reqWindow} onChange={e => setReqWindow(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 4:00 PM - 6:00 PM" />
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Pickup Address *</label>
                  <textarea required value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={2} placeholder="Full destination address"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Requirements</label>
                  <input type="text" value={specialReqs} onChange={e => setSpecialReqs(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Needs insulated containers" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes to Admin</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={2} placeholder="Any other logistical notes?"></textarea>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md">
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
}
