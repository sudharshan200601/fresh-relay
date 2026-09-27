'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import { Map } from '@/components/Map';
import {
  Utensils,
  Apple,
  Cookie,
  Flame,
  Snowflake,
  Package,
  Clock,
  MapPin,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Save,
  CheckCircle2,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'Hot Meals', label: 'Hot Meals', desc: 'Trays & soup', icon: Flame },
  { id: 'Raw Produce', label: 'Raw Produce', desc: 'Fresh fruits & veg', icon: Apple },
  { id: 'Baked Goods', label: 'Baked Goods', desc: 'Bread & pastries', icon: Cookie },
  { id: 'Dairy & Chilled', label: 'Dairy & Chilled', desc: 'Milk, cheese, yogurt', icon: Snowflake },
  { id: 'Frozen Items', label: 'Frozen Items', desc: 'Packs & stocks', icon: Snowflake },
  { id: 'Packaged Goods', label: 'Packaged Goods', desc: 'Dry & sealed cans', icon: Package },
];

const SAFETY_FLAGS = [
  { id: 'Keep Heated (>140°F)', label: 'Keep Heated (>140°F)', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'Refrigerated (<41°F)', label: 'Refrigerated (<41°F)', color: 'bg-sky-100 text-sky-800 border-sky-300' },
  { id: 'Vegetarian', label: 'Vegetarian', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'Nut-Free', label: 'Nut-Free', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  { id: 'Halal Certified', label: 'Halal Certified', color: 'bg-purple-100 text-purple-800 border-purple-300' },
];

export default function PostDonationForm() {
  const router = useRouter();
  const { currentUser, showToast } = useRole();

  // Form State
  const [category, setCategory] = useState<string>('Hot Meals');
  const [foodType, setFoodType] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(85);
  const [quantityUnit, setQuantityUnit] = useState<string>('lbs');
  const [containerType, setContainerType] = useState<string>('Cambros / Thermal Carriers');
  const [selectedFlags, setSelectedFlags] = useState<string[]>([
    'Keep Heated (>140°F)',
    'Vegetarian',
    'Nut-Free',
  ]);

  // Expiry setup: default to 3 hours from current local time
  const now = new Date();
  const defaultExpiry = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  
  // Format local ISO datetime string for datetime-local input
  const formatISOForInput = (d: Date) => {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [expiryInput, setExpiryInput] = useState<string>(formatISOForInput(defaultExpiry));
  const [pickupAddress, setPickupAddress] = useState<string>(
    '742 Evergreen Terrace, Bay 3 Loading Dock, San Francisco, CA'
  );
  const [pickupInstructions, setPickupInstructions] = useState<string>(
    'Enter through back alley, ring buzzer #4 for chef Marco'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-fill demo helper
  function handleAutoFillDemo() {
    setCategory('Baked Goods');
    setFoodType('Fresh Artisan Sourdough & Croissants');
    setQuantity(60);
    setContainerType('Pre-bagged Boxes');
    setSelectedFlags(['Vegetarian', 'Nut-Free']);
    const demoExpiry = new Date(Date.now() + 2.5 * 60 * 60 * 1000);
    setExpiryInput(formatISOForInput(demoExpiry));
    setPickupAddress('128 Post St, Back Alley Loading Bay, San Francisco, CA');
    setPickupInstructions('Ring buzzer #2 at loading dock door. Chef Marco is available.');
    setValidationError(null);
    showToast('✨ Pre-filled form with sample surplus bakery data!');
  }

  function toggleFlag(flagId: string) {
    if (selectedFlags.includes(flagId)) {
      setSelectedFlags(selectedFlags.filter((f) => f !== flagId));
    } else {
      setSelectedFlags([...selectedFlags, flagId]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    // Validation 1: Required food title
    const finalFoodType = foodType.trim() || `${category} Surplus Package`;
    if (!pickupAddress.trim()) {
      setValidationError('Pickup address is required.');
      return;
    }

    // Validation 2: Expiry date check
    const expiryDate = new Date(expiryInput);
    if (isNaN(expiryDate.getTime())) {
      setValidationError('Please select a valid expiry date and time.');
      return;
    }

    if (expiryDate <= new Date()) {
      setValidationError('⚠️ Expiry time cannot be in the past! Please select a future time.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id: currentUser.id,
          food_type: finalFoodType,
          category,
          quantity: Number(quantity),
          quantity_unit: quantityUnit,
          servings: Math.round(Number(quantity) * 0.8),
          dietary_flags: selectedFlags,
          pickup_address: pickupAddress,
          latitude: 37.7749 + (Math.random() - 0.5) * 0.02,
          longitude: -122.4194 + (Math.random() - 0.5) * 0.02,
          pickup_instructions: pickupInstructions,
          expiry_time: expiryDate.toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setValidationError(data.error || 'Failed to publish donation.');
        setIsSubmitting(false);
        return;
      }

      showToast(`🎉 Surplus food published successfully! (ID: ${data.id})`);
      router.push('/donations');
    } catch (err) {
      setValidationError('Network error. Failed to publish donation.');
      setIsSubmitting(false);
    }
  }

  const hoursRemaining =
    (new Date(expiryInput).getTime() - new Date().getTime()) / (1000 * 60 * 60);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      {/* Top Title Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            FAST TRACK RESCUE
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Post Surplus Food</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Connect your surplus food with local community shelters in minutes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAutoFillDemo}
          className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition-colors flex items-center space-x-1 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>Auto-fill Demo</span>
        </button>
      </div>

      {/* Receiver Verified Org Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-11 h-11 rounded-full object-cover border-2 border-emerald-400"
          />
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="font-bold text-sm">{currentUser.organization}</h3>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-300">Verified Food Partner #382</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold bg-white/10 text-emerald-300 px-3 py-1 rounded-full border border-white/20">
          Ready to Post
        </span>
      </div>

      {/* Main Validation Error Banner if any */}
      {validationError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-start space-x-3 shadow-sm animate-bounce">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-xs">Form Validation Error</h4>
            <p className="text-xs text-rose-700 mt-0.5">{validationError}</p>
          </div>
        </div>
      )}

      {/* Post Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Food Category */}
        <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center mr-2">
                1
              </span>
              Food Category
            </h3>
            <span className="text-[11px] text-slate-400">Select main category</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = category === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                      isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">{cat.label}</h4>
                  <p className="text-[10px] text-slate-500">{cat.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Food Title / Description
            </label>
            <input
              type="text"
              placeholder="e.g. Prepared Hot Trays (Rice, Curry, Halal Chicken)"
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Step 2: Quantity & Packaging */}
        <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center mr-2">
                2
              </span>
              Quantity & Packaging
            </h3>
            <span className="text-[11px] font-bold text-emerald-600">
              ~{Math.round(quantity * 0.8)} rescue meals
            </span>
          </div>

          {/* Weight input with presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Estimated Weight ({quantityUnit})
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="5000"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-3 rounded-xl">
                lbs
              </span>
            </div>

            <div className="flex space-x-2 mt-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 25)}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100"
              >
                +25 lbs
              </button>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 50)}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100"
              >
                +50 lbs
              </button>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 100)}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100"
              >
                +100 lbs
              </button>
            </div>
          </div>

          {/* Packaging container selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Packaging Container Type
            </label>
            <select
              value={containerType}
              onChange={(e) => setContainerType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Cambros / Thermal Carriers">Cambros / Thermal Carriers</option>
              <option value="Cardboard Crates">Cardboard Crates</option>
              <option value="Plastic Tubs & Inserts">Plastic Tubs & Inserts</option>
              <option value="Pre-bagged Boxes">Pre-bagged Boxes</option>
            </select>
          </div>
        </div>

        {/* Step 3: Dietary & Safety Flags */}
        <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center mr-2">
              3
            </span>
            Dietary & Safety Flags
          </h3>
          <p className="text-xs text-slate-500">
            Tap tags to assist shelter matching and temperature compliance.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {SAFETY_FLAGS.map((flag) => {
              const isSelected = selectedFlags.includes(flag.id);
              return (
                <button
                  key={flag.id}
                  type="button"
                  onClick={() => toggleFlag(flag.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    isSelected
                      ? flag.color + ' shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 opacity-60'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {flag.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Pickup Window & Expiry Validation */}
        <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center mr-2">
              4
            </span>
            Pickup Expiry Window
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Food Expires At (Pickup Deadline)
            </label>
            <input
              type="datetime-local"
              value={expiryInput}
              onChange={(e) => {
                setExpiryInput(e.target.value);
                setValidationError(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Validation Banner for pickup window */}
          {hoursRemaining <= 0 ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-rose-600 shrink-0" />
              Selected expiry time is in the past! Please choose a future timestamp.
            </div>
          ) : hoursRemaining < 2 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-amber-600 shrink-0" />
              ⚡ Expiry alert: Short window ({Math.round(hoursRemaining * 60)} minutes left). Will trigger high-priority runner push notifications.
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
              Pickup window: {hoursRemaining.toFixed(1)} hours remaining.
            </div>
          )}
        </div>

        {/* Step 5: Pickup Location Pin & Instructions */}
        <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center mr-2">
              5
            </span>
            Pickup Location Pin & Instructions
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pickup Address
            </label>
            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <Map
            markers={[
              {
                id: 'preview-pin',
                position: [37.7749, -122.4194],
                title: 'Pickup Location',
                address: pickupAddress,
              },
            ]}
            className="h-44 w-full rounded-xl overflow-hidden shadow-inner"
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Donor Dock Instructions
            </label>
            <textarea
              rows={2}
              value={pickupInstructions}
              onChange={(e) => setPickupInstructions(e.target.value)}
              placeholder="e.g. Park in yellow bay behind alley roll-up door. Ring buzzer #4 for Marco."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex items-center space-x-2 text-xs text-sky-800">
            <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0" />
            <span>
              <strong>Good Samaritan Food Act Protected:</strong> Surplus donations made in good faith are shielded from civil liability.
            </span>
          </div>
        </div>

        {/* Submit Action Buttons */}
        <div className="space-y-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>{isSubmitting ? 'Publishing Surplus...' : 'Publish Donation to Network'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
