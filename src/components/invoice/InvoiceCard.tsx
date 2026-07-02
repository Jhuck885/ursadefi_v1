'use client';

import { Invoice } from '@/types';
import BrowserInvoicePDF from './BrowserInvoicePDF';
import { mintInvoiceNFT } from '@/lib/xrpl';

interface Props {
  invoice: Invoice;
}

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
    const client = invoice.to || invoice.clientName || 'client';

    const text = `Just sent a $${amount} invoice to ${client} powered by @ursadefi + @xAI ⚡\n\nInstant XRPL invoicing, payments & accounting — all free.\n\nTry it: ursadefi.com`;

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Dynamic status badge with X.com style colors
  const getStatusBadge = () => {
    const status = invoice.status || (invoice.nftoken_id ? 'minted' : 'draft');

    if (status === 'minted' || status === 'confirmed' || invoice.nftoken_id) {
      return (
        <div className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-medium rounded-full bg-blue-950 text-blue-400 border border-blue-900">
          Minted
        </div>
      );
    }

    if (status === 'paid') {
      return (
        <div className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-medium rounded-full bg-emerald-950 text-emerald-400 border border-emerald-900">
          Paid
        </div>
      );
    }

    // Default / Draft
    return (
      <div className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-medium rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
        XRPL NFT Ready
      </div>
    );
  };

  return (
    <div className="border border-zinc-800 rounded-3xl p-5 bg-zinc-950 hover:border-zinc-700 transition-all group">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-mono text-[10px] text-zinc-500 tracking-[1px]">#{invoice.id}</div>
          
          {/* Prominent Amount */}
          <div className="text-3xl font-semibold tracking-[-1.5px] mt-1 text-white">
            ${invoice.total}
          </div>
          
          {/* Prominent Client */}
          <div className="text-sm text-zinc-300 mt-0.5">
            To: <span className="font-medium text-white">{invoice.to || invoice.clientName}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-1">
          {getStatusBadge()}
        </div>
      </div>

      {/* Description */}
      {invoice.description && (
        <div className="text-sm text-zinc-400 mb-4 line-clamp-2 pr-2">
          {invoice.description}
        </div>
      )}

      {/* Action Bar - X.com style with light grey border */}
      <div className="flex items-center gap-2 pt-3 border-t border-zinc-800 mt-1">
        <div className="flex-1">
          <BrowserInvoicePDF invoice={invoice} compact />
        </div>

        <button
          onClick={handleMint}
          className="px-3.5 py-1.5 text-xs font-medium border border-zinc-700 hover:bg-zinc-900 active:bg-zinc-800 rounded-full transition-colors"
        >
          Mint as XRPL NFT
        </button>

        <button
          onClick={handleShareToX}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium border border-zinc-700 hover:bg-zinc-900 active:bg-zinc-800 rounded-full transition-colors text-zinc-300 hover:text-white"
        >
          {/* X Logo SVG */}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
            <path d="M18.244 2.25l-7.451 8.502L4.5 2.25H1.5l7.5 8.5L1.5 21.75h3l6.75-7.5 6.75 7.5h3l-7.5-8.5 7.5-8.5z" />
          </svg>
          Share to X
        </button>
      </div>
    </div>
  );
}
