'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const DynamicLeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 font-medium text-sm">
      Loading interactive logistics map...
    </div>
  ),
});

export function Map(props: any) {
  return <DynamicLeafletMap {...props} />;
}
