'use client';
import InvoiceFeed from '@/components/invoice/InvoiceFeed';
import InvoiceForm from '@/components/invoice/InvoiceForm';
import { useState } from 'react';

export default function Dashboard() {
  const [xrpPrice] = useState(2.45); // replace with your existing live feed
  return (
    <div className="flex h-screen pt-16">
      {/* LEFT nav */}
      <div className="w-72 border-r border-zinc-800 p-4 hidden lg:block">
        <div className="btn-pill w-full mb-4">New Invoice</div>
        <div className="btn-pill w-full">CSV Export (2 free)</div>
      </div>
      {/* CENTER thread */}
      <div className="flex-1 overflow-auto">
        <InvoiceFeed />
        <div className="p-4 border-t border-zinc-800"><InvoiceForm /></div>
      </div>
      {/* RIGHT */}
      <div className="w-80 border-l border-zinc-800 p-4 hidden xl:block">
        <div>Live XRP: ${xrpPrice}</div>
        <div>Quarterly tax est: $0 (track in dashboard)</div>
        <div className="btn-pill mt-4">Share on X</div>
      </div>
    </div>
  );
}