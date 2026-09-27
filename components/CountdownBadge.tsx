'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface CountdownBadgeProps {
  expiryTime: string | Date;
  compact?: boolean;
}

export function CountdownBadge({ expiryTime, compact = false }: CountdownBadgeProps) {
  const [timeLeft, setTimeLeft] = useState<{
    totalMs: number;
    formatted: string;
    isUrgent: boolean;
    isExpired: boolean;
  }>({
    totalMs: 0,
    formatted: 'Calculating...',
    isUrgent: false,
    isExpired: false,
  });

  useEffect(() => {
    function updateTimer() {
      const expiry = new Date(expiryTime).getTime();
      const now = new Date().getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft({
          totalMs: 0,
          formatted: 'EXPIRED',
          isUrgent: true,
          isExpired: true,
        });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const isUrgent = diff < 2 * 60 * 60 * 1000; // less than 2 hours

      let formatted = '';
      if (hours > 0) {
        formatted = `${hours}h ${minutes}m left`;
      } else {
        formatted = `${minutes}m left`;
      }

      setTimeLeft({
        totalMs: diff,
        formatted,
        isUrgent,
        isExpired: false,
      });
    }

    updateTimer();
    const interval = setInterval(updateTimer, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [expiryTime]);

  if (timeLeft.isExpired) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
        <AlertTriangle className="w-3.5 h-3.5 mr-1" />
        Expired
      </span>
    );
  }

  if (timeLeft.isUrgent) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm animate-pulse-subtle">
        <Clock className="w-3.5 h-3.5 mr-1 text-white" />
        {timeLeft.formatted}
        {!compact && <span className="ml-1 text-[10px] bg-amber-600/60 px-1.5 py-0.5 rounded uppercase tracking-wider">Urgent</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <Clock className="w-3.5 h-3.5 mr-1 text-emerald-600" />
      {timeLeft.formatted}
    </span>
  );
}
