'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Phone, User, Package, Calendar, ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';

export default function AssignmentDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [assignment, setAssignment] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/receiver/assignments/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setAssignment(data);
        setLoading(false);
      });
  }, [params.id]);

  const submitFeedback = async () => {
    setSubmitting(true);
    await fetch(`/api/receiver/assignments/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, feedback, status: 'completed' })
    });
    router.push('/receiver/dashboard');
  };

  if (loading) return <div className="p-8 text-center flex justify-center mt-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  if (!assignment || assignment.error) return <div className="p-8 text-center text-red-500 font-bold">Assignment not found or unauthorized</div>;

  const d = assignment.donation;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link href="/receiver/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-medium">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-6">
             <div>
                <h1 className="text-3xl font-extrabold text-gray-900">{d.eventName}</h1>
                <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-800 text-sm font-bold rounded-full border border-gray-200">
                  STATUS: {assignment.status.replace('_', ' ').toUpperCase()}
                </span>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
             <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Pickup Location</h3>
                <p className="flex items-start gap-3 text-gray-600 mb-2"><MapPin size={20} className="text-gray-400 mt-1 min-w-5"/> {d.location}</p>
                <p className="flex items-center gap-3 text-gray-600 mb-2"><User size={20} className="text-gray-400 min-w-5"/> {d.contactName} ({d.donor.organizationName || 'Donor'})</p>
                <p className="flex items-center gap-3 text-gray-600"><Phone size={20} className="text-gray-400 min-w-5"/> {d.contactPhone}</p>
             </div>
             
             <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Food Details</h3>
                <p className="flex items-center gap-3 text-gray-600 mb-2"><Package size={20} className="text-gray-400 min-w-5"/> {d.quantityKg} kg • {d.foodType}</p>
                <p className="flex items-center gap-3 text-gray-600 mb-2"><span className="font-bold text-gray-400 uppercase text-xs tracking-wider min-w-5">DIET:</span> {d.foodCategory.toUpperCase()}</p>
                {d.pickupBy && <p className="flex items-center gap-3 text-gray-600"><Calendar size={20} className="text-gray-400 min-w-5"/> Pickup By: {new Date(d.pickupBy).toLocaleString()}</p>}
             </div>
          </div>

          {d.instructions && (
             <div className="bg-yellow-50 p-4 rounded-lg mb-8 border border-yellow-100">
                <h4 className="font-bold text-yellow-800 mb-2">Special Instructions</h4>
                <p className="text-yellow-700 text-sm">{d.instructions}</p>
             </div>
          )}

          {assignment.status === 'completed' && !assignment.rating && (
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mt-8">
               <h3 className="text-lg font-bold text-blue-900 mb-4">Rate Your Experience</h3>
               <div className="flex gap-2 mb-4">
                  {[1,2,3,4,5].map(star => (
                     <Star key={star} onClick={() => setRating(star)} className={`cursor-pointer transition-colors ${rating >= star ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} size={32} />
                  ))}
               </div>
               <textarea placeholder="Leave a comment (optional)..." onChange={e => setFeedback(e.target.value)} className="w-full border border-gray-300 p-3 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500"></textarea>
               <button onClick={submitFeedback} disabled={submitting} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors w-full sm:w-auto disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
               </button>
            </div>
          )}

          {assignment.rating && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-8 text-center">
               <h3 className="text-lg font-bold text-gray-800 mb-2">Thank you for your feedback!</h3>
               <div className="flex justify-center gap-1 mb-2">
                 {[...Array(assignment.rating)].map((_, i) => <Star key={i} className="text-yellow-500 fill-current" size={24} />)}
               </div>
               {assignment.feedback && <p className="text-gray-600 italic">"{assignment.feedback}"</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
