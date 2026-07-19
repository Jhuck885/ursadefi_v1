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

    const text = `Just sent a $${amount} invoice to ${client} powered by @ursadefi + @xAI \u26A1\n\nInstant XRPL invoicing, payments & accounting — all free.\n\nTry it: ursadefi.com`;

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Dynamic status badge — clean theme-aware styles
  const getStatusBadge = () => {
    const status = invoice.status || (invoice.nftoken_id ? 'minted' : 'draft');

    if (status === 'minted' || status === 'confirmed' || invoice.nftoken_id) {
      return (
        <div className="badge badge-minted">
          Minted
        </div>
      );
    }

    if (status === 'paid') {
      return (
        <div className="badge badge-paid">
          Paid
        </div>
      );
    }

    // Default / Draft
    return (
      <div className="badge badge-draft">
        XRPL NFT Ready
      </div>
    );
  };

  return (
    <div className="border border-[var(--card-border)] rounded-3xl p-5 bg-[var(--card-bg)] hover:border-[var(--brand-primary)]/40 transition-all group" data-card>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-mono text-[10px] text-[var(--text-muted)] tracking-[1px]">#{invoice.id}</div>
          
          {/* Prominent Amount */}
          <div className="text-3xl font-semibold tracking-[-1.5px] mt-1 text-[var(--text-primary)]">
            ${invoice.total}
          </div>
          
          {/* Prominent Client */}
          <div className="text-sm text-[var(--text-secondary)] mt-0.5">
            To: <span className="font-medium text-[var(--text-primary)]">{invoice.to || invoice.clientName}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-1">
          {getStatusBadge()}
        </div>
      </div>

      {/* Description */}
      {invoice.description && (
        <div className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2 pr-2">
          {invoice.description}
        </div>
      )}

      {/* Action Bar — X.com style */}
      <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-color)] mt-1">
        <div className="flex-1">
          <BrowserInvoicePDF invoice={invoice} compact />
        </div>

        <button
          onClick={handleMint}
          className="btn-secondary text-xs px-3.5 py-1.5"
        >
          Mint as XRPL NFT
        </button>

        <button
          onClick={handleShareToX}
          className="btn-share-x text-xs px-3.5 py-1.5"
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
