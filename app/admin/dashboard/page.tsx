'use client';
import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, MapPin, Package, ClipboardList, CheckSquare, MessageSquare } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('donations');
  
  // Donations State
  const [donations, setDonations] = useState<any[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(true);
  
  // Requests State
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Modal State for Approving Request
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [approveQty, setApproveQty] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === 'donations') fetchDonations();
    if (activeTab === 'requests') fetchRequests();
  }, [activeTab]);

  const fetchDonations = async () => {
    setLoadingDonations(true);
    try {
      const res = await fetch('/api/admin/donations');
      const data = await res.json();
      if(Array.isArray(data)) setDonations(data);
    } catch(e) {} finally { setLoadingDonations(false); }
  };

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch('/api/admin/requests');
      const data = await res.json();
      if(Array.isArray(data)) setRequests(data);
    } catch(e) {} finally { setLoadingRequests(false); }
  };

  const updateDonationStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/donations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchDonations();
  };

  const rejectRequest = async (id: string) => {
    await fetch(`/api/admin/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' })
    });
    fetchRequests();
  };

  const openApproveModal = (req: any) => {
    setSelectedReq(req);
    setApproveQty(req.requestedQuantity);
    setIsModalOpen(true);
  };

  const confirmApprove = async () => {
    setSubmitting(true);
    await fetch(`/api/admin/requests/${selectedReq.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved', approvedQuantity: approveQty, adminNotes })
    });
    setSubmitting(false);
    setIsModalOpen(false);
    setAdminNotes('');
    fetchRequests();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Control Center</h1>
          <p className="text-gray-500 mt-2">Verify incoming food donations and approve receiver requests.</p>
        </header>

        {/* TABS */}
        <div className="flex space-x-4 mb-8 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('donations')}
            className={`pb-4 px-4 font-bold text-sm transition-colors ${activeTab === 'donations' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Verify Food Posts
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`pb-4 px-4 font-bold text-sm transition-colors ${activeTab === 'requests' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Manage Receiver Requests
          </button>
        </div>

        {/* DONATIONS TAB */}
        {activeTab === 'donations' && (
          <div>
            {loadingDonations ? <div className="p-12 text-center">Loading...</div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {donations.filter(d => d.status === 'pending').map(d => (
                   <div key={d.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                     <div>
                       <h3 className="font-bold text-lg mb-2">{d.eventName}</h3>
                       <p className="text-sm text-gray-600 flex items-center gap-2 mb-1"><MapPin size={14}/> {d.location}</p>
                       <p className="text-sm text-gray-600 flex items-center gap-2 mb-6"><Package size={14}/> {d.quantityKg} kg • {d.foodType}</p>
                     </div>
                     <div className="flex gap-2 mt-auto">
                       <button onClick={() => updateDonationStatus(d.id, 'verified')} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">Approve & Publish</button>
                       <button onClick={() => updateDonationStatus(d.id, 'rejected')} className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-lg text-sm font-medium hover:bg-red-100">Reject</button>
                     </div>
                   </div>
                ))}
                {donations.filter(d => d.status === 'pending').length === 0 && (
                   <div className="col-span-full p-12 text-center text-gray-500 border border-dashed rounded-xl">No pending donations to verify.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div>
            {loadingRequests ? <div className="p-12 text-center">Loading...</div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.filter(r => r.status === 'pending').map(r => (
                   <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                     <div>
                       <div className="flex justify-between items-start mb-4">
                         <h3 className="font-bold text-lg text-gray-900">{r.receiver.organizationName || r.receiver.name}</h3>
                         <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">PENDING</span>
                       </div>
                       
                       <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-2">
                         <p className="text-sm"><span className="text-gray-500">Event:</span> <span className="font-medium">{r.donation.eventName}</span></p>
                         <p className="text-sm flex justify-between"><span className="text-gray-500">Requesting:</span> <span className="font-bold text-blue-600">{r.requestedQuantity} kg</span></p>
                         <p className="text-sm"><span className="text-gray-500">Available:</span> {r.donation.quantityKg} kg</p>
                         <p className="text-sm"><span className="text-gray-500">Pickup:</span> {r.preferredPickupWindow}</p>
                       </div>

                       {r.notes && (
                         <div className="mb-4 text-sm text-gray-600 italic">"{r.notes}"</div>
                       )}
                     </div>

                     <div className="flex gap-2 border-t border-gray-100 pt-4">
                       <button onClick={() => openApproveModal(r)} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700">Approve</button>
                       <button onClick={() => rejectRequest(r.id)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200">Reject</button>
                     </div>
                   </div>
                ))}
                {requests.filter(r => r.status === 'pending').length === 0 && (
                   <div className="col-span-full p-12 text-center text-gray-500 border border-dashed rounded-xl">No pending requests to approve.</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* APPROVE MODAL */}
      {isModalOpen && selectedReq && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Approve Request</h2>
              <p className="text-sm text-gray-500 mb-6">Confirm the quantity and add any pickup instructions.</p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approved Quantity (kg)</label>
                  <input type="number" step="0.1" value={approveQty} onChange={e => setApproveQty(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
                  <p className="text-xs text-gray-400 mt-1">Requested: {selectedReq.requestedQuantity} kg (Max Available: {selectedReq.donation.quantityKg} kg)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructions for Receiver</label>
                  <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Please bring insulated boxes" rows={3}></textarea>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={confirmApprove} disabled={submitting} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50">
                   {submitting ? 'Approving...' : 'Confirm Approval'}
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
