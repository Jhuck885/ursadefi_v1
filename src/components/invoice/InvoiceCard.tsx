'use client';

import { Invoice } from '@/types';
import BrowserInvoicePDF from './BrowserInvoicePDF';
import { mintInvoiceNFT } from '@/lib/xrpl';
import { Share2 } from 'lucide-react';

interface Props { invoice: Invoice; }

export default function InvoiceCard({ invoice }: Props) {
  const handleMint = async () => {
    try {
      await mintInvoiceNFT(invoice);
      alert('Xaman opened — sign to mint!');
    } catch (e) {
      alert('Retry — Xaman required');
    }
  };

  const handleShareToX = () => {
    const amount = invoice.total;
    const client = invoice.to || 'client';
    
    const text = `Just sent a $${amount} invoice to ${client} powered by @ursadefi + @xAI ⚡\n\nInstant XRPL invoicing, payments & accounting — all free.\n\nTry it: ursadefi.com`;
    
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="border border-zinc-800 rounded-3xl p-5 bg-zinc-950 hover:border-zinc-700 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="font-mono text-xs text-zinc-500">#{invoice.id}</div>
          <div className="text-2xl font-semibold tracking-tight mt-1">${invoice.total}</div>
          <div className="text-sm text-zinc-400 mt-1">To: {invoice.to}</div>
        </div>
        <div className="text-right">
          <div className="inline-block px-2.5 py-0.5 text-[10px] rounded-full bg-emerald-950 text-emerald-400 border border-emerald-900">
            XRPL NFT Ready
          </div>
        </div>
      </div>

      {invoice.description && (
        <div className="text-sm text-zinc-400 mb-4 line-clamp-2">
          {invoice.description}
        </div>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
        <div className="flex-1">
          <BrowserInvoicePDF invoice={invoice} compact />
        </div>

        <button
          onClick={handleMint}
          className="px-4 py-1.5 text-xs font-medium border border-zinc-700 hover:bg-zinc-900 rounded-full transition"
        >
          Mint as XRPL NFT
        </button>

        <button
          onClick={handleShareToX}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition"
        >
          <Share2 size={14} />
          Share to X
        </button>
      </div>
    </div>
  );
}
