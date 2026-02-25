'use client';
import { useState } from 'react';
import BrowserInvoicePDF from './BrowserInvoicePDF';
import { mintInvoiceNFT } from '@/lib/xrpl';

interface InvoiceData { id: string; from: string; to: string; items: any[]; total: number; xrpAmount: number; receiver: string; }

interface Props {
  onSuccess?: (data: InvoiceData) => void; // optional for RightSidebar
}

export default function InvoiceForm({ onSuccess }: Props = {}) {
  const [data, setData] = useState<InvoiceData>({ id: 'INV-' + Date.now(), from: 'Your Business', to: '', items: [], total: 0, xrpAmount: 0, receiver: process.env.NEXT_PUBLIC_XRPL_RECEIVER_ADDRESS! });
  const [loading, setLoading] = useState(false);

  const calculateFee = (usd: number) => {
    if (usd < 100) return Math.max(0.1, usd * 0.003);
    if (usd < 1000) return Math.max(0.1, usd * 0.002);
    return Math.min(50, Math.max(0.1, usd * 0.0015));
  };

  const handleMint = async () => {
    if (data.total < 5) { alert('Min $5'); return; }
    setLoading(true);
    try {
      await mintInvoiceNFT(data); // Xaman opens
      // On success (listen in parent) add to feed via context later
      alert('Xaman opened — sign to mint NFT!');
      onSuccess?.(data); // call RightSidebar handler if provided
    } catch (e) { console.error(e); alert('Mint failed — retry'); }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      {/* form fields using react-hook-form — extend your existing */}
      <button onClick={handleMint} disabled={loading} className="btn-pill w-full bg-white text-black hover:bg-zinc-200">
        {loading ? 'Opening Xaman...' : 'Mint as XRPL NFT (deferred)'}
      </button>
      <BrowserInvoicePDF invoice={data} />
      {/* fee display */}
      <div className="text-xs text-zinc-500 mt-4">Fee: ~{calculateFee(data.total).toFixed(2)} XRP (0.15% max, transparent)</div>
    </div>
  );
}