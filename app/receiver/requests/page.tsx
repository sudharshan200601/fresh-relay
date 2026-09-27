'use client';
import { useState, useEffect } from 'react';
import { Package, Clock, MessageSquare, ClipboardList, MapPin, Edit3, CheckCircle, Star } from 'lucide-react';
import Link from 'next/link';

export default function MyRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [availableDonations, setAvailableDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Toggle & Modal State
  const [isMakeRequestOpen, setIsMakeRequestOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'view' | 'edit' | 'feedback' | null>(null);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Feedback State
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  // Form State (Create & Edit)
  const [selectedDonationId, setSelectedDonationId] = useState('');
  const [reqQty, setReqQty] = useState('');
  const [reqWindow, setReqWindow] = useState('');
  const [reqDate, setReqDate] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState('');
  const [specialReqs, setSpecialReqs] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchAvailableDonations();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`/api/receiver/requests`);
      const data = await res.json();
      if (Array.isArray(data)) setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDonations = async () => {
    try {
      const res = await fetch(`/api/receiver/donations`);
      const data = await res.json();
      if (Array.isArray(data)) setAvailableDonations(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Sync Toggle with Modal Mode
  useEffect(() => {
    if (isMakeRequestOpen && modalMode !== 'create') {
      openModal(null, 'create');
    } else if (!isMakeRequestOpen && modalMode === 'create') {
      setModalMode(null);
    }
  }, [isMakeRequestOpen]);

  // Auto-suggest quantity based on people (approx 0.5kg per person)
  useEffect(() => {
    if (numberOfPeople && !isNaN(Number(numberOfPeople))) {
      const suggested = (Number(numberOfPeople) * 0.5).toString();
      setReqQty(suggested);
    }
  }, [numberOfPeople]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await fetch(`/api/receiver/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        donationId: selectedDonationId,
        requestedQuantity: reqQty,
        preferredPickupWindow: reqWindow,
        preferredDate: reqDate,
        pickupAddress,
        numberOfPeople,
        specialRequirements: specialReqs,
        notes
      })
    });
    setSubmitting(false);
    setIsMakeRequestOpen(false); // Closes modal automatically via effect
    fetchRequests();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await fetch(`/api/receiver/requests/${selectedReq.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestedQuantity: reqQty, notes })
    });
    setSubmitting(false);
    setModalMode(null);
    fetchRequests();
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await fetch(`/api/receiver/requests/${selectedReq.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, feedback, status: 'completed' })
    });
    setSubmitting(false);
    setModalMode(null);
    fetchRequests();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/receiver/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchRequests();
  };

  const openModal = (req: any, mode: 'create' | 'view' | 'edit' | 'feedback') => {
    setSelectedReq(req);
    setModalMode(mode);
    if (mode === 'edit' && req) {
      setReqQty(req.requestedQuantity);
      setNotes(req.notes || '');
    } else if (mode === 'create') {
      setSelectedDonationId('');
      setReqQty('');
      setReqWindow('');
      setReqDate('');
      setPickupAddress('');
      setNumberOfPeople('');
      setSpecialReqs('');
      setNotes('');
    }
  };

  const closeModal = () => {
    setModalMode(null);
    if (modalMode === 'create') setIsMakeRequestOpen(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-blue-100 text-blue-800 border-blue-200',
      picked_up: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Compute Stats
  const stats = {
    total: requests.length,
    approved: requests.filter(r => r.status === 'approved').length,
    pending: requests.filter(r => r.status === 'pending').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Toggle */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Requests</h1>
            <p className="text-gray-500 mt-2">Track your food requests or create a new one directly.</p>
          </div>
          
          <div className="flex items-center gap-6 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-3">
               <span className="text-sm font-bold text-gray-700" title="Turn on to create a new food request based on your needs.">Make Request</span>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" className="sr-only peer" checked={isMakeRequestOpen} onChange={(e) => setIsMakeRequestOpen(e.target.checked)} />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
               </label>
             </div>
             <Link href="/receiver/dashboard" className="text-sm font-medium text-blue-600 hover:underline border-l pl-4 border-gray-200">
               Browse Marketplace
             </Link>
          </div>
        </header>

        {/* Stats Section */}
        {!loading && requests.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-sm text-gray-500 font-medium">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm text-center">
              <p className="text-sm text-blue-600 font-medium">Approved</p>
              <p className="text-2xl font-bold text-blue-900">{stats.approved}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 shadow-sm text-center">
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm text-center">
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
            </div>
          </div>
        )}

        {/* Requests List */}
        {loading ? (
           <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
        ) : requests.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl border border-gray-100 border-dashed">
            <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No requests yet</h3>
            <p className="text-gray-500 mb-4">Turn on the "Make Request" toggle above to start.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer" onClick={() => openModal(r, 'view')}>
                   <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-gray-800 text-lg">{r.donation.eventName}</h3>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(r.status)}`}>
                          {r.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 flex items-center gap-2 mb-4"><MapPin size={16} className="text-gray-400 min-w-4"/> {r.donation.location}</p>
                      
                      <div className="space-y-2 mb-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        <p className="flex justify-between"><strong>People:</strong> {r.numberOfPeople || 'N/A'}</p>
                        <p className="flex justify-between border-t border-gray-200 pt-2"><strong>Requested:</strong> {r.requestedQuantity} kg</p>
                        {r.approvedQuantity && <p className="flex justify-between border-t border-gray-200 pt-2 text-green-700"><strong>Approved:</strong> {r.approvedQuantity} kg</p>}
                      </div>
                   </div>

                   <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100" onClick={e => e.stopPropagation()}>
                      {r.status === 'pending' && <button onClick={() => openModal(r, 'edit')} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"><Edit3 size={16}/> Edit</button>}
                      {r.status === 'pending' && <button onClick={() => updateStatus(r.id, 'cancelled')} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm font-medium transition-colors">Cancel</button>}
                      {r.status === 'approved' && <button onClick={() => updateStatus(r.id, 'picked_up')} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">Mark Picked Up</button>}
                      {r.status === 'picked_up' && <button onClick={() => openModal(r, 'feedback')} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">Complete & Rate</button>}
                   </div>
                </div>
            ))}
          </div>
        )}
      </div>

      {/* FLOATING MODAL - CREATE MODE */}
      {modalMode === 'create' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <form onSubmit={handleCreateSubmit} className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <button type="button" onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Request</h2>
              <p className="text-gray-500 text-sm mb-6 pb-4 border-b border-gray-100">Select an available donation and fill in your details.</p>
              
              <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Select Donation *</label>
                 <select required value={selectedDonationId} onChange={e => setSelectedDonationId(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="">-- Choose available food --</option>
                    {availableDonations.map(d => (
                       <option key={d.id} value={d.id}>{d.eventName} - {d.quantityKg}kg ({d.foodType})</option>
                    ))}
                 </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of People Served *</label>
                  <input type="number" required value={numberOfPeople} onChange={e => setNumberOfPeople(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requested Quantity (kg) *</label>
                  <input type="number" step="0.1" required value={reqQty} onChange={e => setReqQty(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Auto-suggests based on people" />
                  <p className="text-xs text-blue-600 mt-1">Auto-suggested: 0.5kg per person</p>
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
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={2}></textarea>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md">
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
           </form>
        </div>
      )}

      {/* FLOATING MODAL - VIEW MODE */}
      {modalMode === 'view' && selectedReq && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
              <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Details</h2>
              
              <div className="space-y-4 text-gray-700">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">Original Donation</h4>
                  <p className="text-sm"><strong>Event:</strong> {selectedReq.donation.eventName}</p>
                  <p className="text-sm"><strong>Type:</strong> {selectedReq.donation.foodType}</p>
                  <p className="text-sm"><strong>Location:</strong> {selectedReq.donation.location}</p>
                </div>

                <div>
                  <p><strong>Status:</strong> <span className={`px-2 py-1 text-xs font-bold rounded-full border ${getStatusColor(selectedReq.status)}`}>{selectedReq.status.toUpperCase()}</span></p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <p><strong>Requested:</strong> {selectedReq.requestedQuantity} kg</p>
                  <p><strong>People:</strong> {selectedReq.numberOfPeople || 'N/A'}</p>
                  <p><strong>Window:</strong> {selectedReq.preferredPickupWindow}</p>
                  <p><strong>Date:</strong> {selectedReq.preferredDate || 'Any'}</p>
                </div>

                {selectedReq.specialRequirements && (
                  <p><strong>Special Requirements:</strong> {selectedReq.specialRequirements}</p>
                )}

                {selectedReq.notes && (
                  <p><strong>Your Notes:</strong> {selectedReq.notes}</p>
                )}

                {selectedReq.status === 'approved' && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-green-900 mt-4">
                    <h4 className="font-bold mb-2 flex items-center gap-2"><CheckCircle size={18}/> Admin Approved Details</h4>
                    <p className="text-sm"><strong>Approved Quantity:</strong> {selectedReq.approvedQuantity} kg</p>
                    {selectedReq.adminNotes && <p className="text-sm mt-2"><strong>Instructions:</strong> {selectedReq.adminNotes}</p>}
                  </div>
                )}
              </div>
           </div>
        </div>
      )}

      {/* FLOATING MODAL - EDIT MODE */}
      {modalMode === 'edit' && selectedReq && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <form onSubmit={handleEditSubmit} className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
              <button type="button" onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Request</h2>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requested Quantity (kg)</label>
                  <input type="number" step="0.1" value={reqQty} onChange={e => setReqQty(e.target.value)} required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Instructions</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" rows={3}></textarea>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 border text-gray-700 py-2.5 rounded-lg font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">Save Changes</button>
              </div>
           </form>
        </div>
      )}

      {/* FLOATING MODAL - FEEDBACK MODE */}
      {modalMode === 'feedback' && selectedReq && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <form onSubmit={handleFeedbackSubmit} className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
              <button type="button" onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
              <div className="text-center mb-6">
                <Star size={48} className="mx-auto text-yellow-400 mb-4" fill="currentColor"/>
                <h2 className="text-2xl font-bold text-gray-900">Donation Complete</h2>
                <p className="text-gray-500 text-sm mt-1">Please leave feedback for the admin and donor.</p>
              </div>
              
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Rating</label>
                  <div className="flex justify-center gap-2">
                    {[1,2,3,4,5].map(num => (
                      <button key={num} type="button" onClick={() => setRating(num)} className={`p-2 rounded-full transition-colors ${rating >= num ? 'text-yellow-400' : 'text-gray-300'}`}>
                        <Star size={32} fill={rating >= num ? 'currentColor' : 'none'} strokeWidth={1} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Feedback (Optional)</label>
                  <textarea value={feedback} onChange={e => setFeedback(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500" rows={3} placeholder="How was the food quality and pickup process?"></textarea>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50">
                Submit Feedback
              </button>
           </form>
        </div>
      )}
    </div>
  );
}
