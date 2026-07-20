'use client';

import { Invoice } from '@/types';
import BrowserInvoicePDF from './BrowserInvoicePDF';
import { mintInvoiceNFT, burnInvoiceNFT } from '@/lib/xrpl';

interface Props {
  invoice: Invoice;
}

export default function InvoiceCard({ invoice }: Props) {
  const [isMinting, setIsMinting] = useState(false);
  const [isBurning, setIsBurning] = useState(false);

  const handleMint = async () => {
    setIsMinting(true);
    try {
      const result = await mintInvoiceNFT(invoice);
      if (result?.success) {
        alert(result.message || 'Xaman opened — sign the NFTokenMint transaction!');
        // TODO: In production, poll payload or listen for return to auto-update nftoken_id
        // For now, after signing in Xaman, refresh the page or mark manually
      }
    } catch (e: any) {
      alert(e.message || 'Retry — Xaman required');
    } finally {
      setIsMinting(false);
    }
  };

  const handleBurn = async () => {
    if (!invoice.nftoken_id) return;
    if (!confirm(`Burn NFT ${invoice.nftoken_id}? This is irreversible on XRPL.`)) return;

    setIsBurning(true);
    try {
      const result = await burnInvoiceNFT(invoice.nftoken_id);
      if (result?.success) {
        alert(result.message || 'Xaman opened — approve the burn!');
        // After burn, user can refresh to see updated status
      }
    } catch (e: any) {
      alert(e.message || 'Burn failed — check Xaman');
    } finally {
      setIsBurning(false);
    }
  };

  const handleShareToX = () => {
    const amount = invoice.total;
    const client = invoice.to || invoice.clientName || 'client';
    const nftPart = invoice.nftoken_id 
      ? `\n\nMinted as XRPL NFT: ${invoice.nftoken_id}` 
      : '';

    const text = `Just sent a $${amount} invoice to ${client} powered by @ursadefi + @xAI \u26A1\n\nInstant XRPL invoicing, payments & accounting — all free.\n\nTry it: ursadefi.com${nftPart}`;

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleViewExplorer = () => {
    if (!invoice.nftoken_id) return;
    // Testnet explorer (change to mainnet later)
    const explorerUrl = `https://testnet.xrpl.org/nft/${invoice.nftoken_id}`;
    window.open(explorerUrl, '_blank');
  };

  // Dynamic status badge — clean theme-aware styles
  const getStatusBadge = () => {
    if (invoice.nftoken_id) {
      return (
        <div className="badge badge-minted flex items-center gap-1">
          Minted
        </div>
      );
    }

    const status = invoice.status || 'draft';

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

      {/* NFT Info if minted */}
      {invoice.nftoken_id && (
        <div className="mb-3 p-2 bg-[var(--bg-tertiary)] rounded-xl text-xs font-mono break-all">
          NFT: {invoice.nftoken_id.slice(0, 20)}...
          <button 
            onClick={handleViewExplorer}
            className="ml-2 text-[var(--brand-primary)] underline hover:no-underline"
          >
            View on Explorer
          </button>
        </div>
      )}

      {/* Action Bar — X.com style */}
      <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-color)] mt-1 flex-wrap">
        <div className="flex-1">
          <BrowserInvoicePDF invoice={invoice} compact />
        </div>

        {!invoice.nftoken_id ? (
          <button
            onClick={handleMint}
            disabled={isMinting}
            className="btn-secondary text-xs px-3.5 py-1.5 disabled:opacity-50"
          >
            {isMinting ? 'Opening Xaman...' : 'Mint as XRPL NFT'}
          </button>
        ) : (
          <button
            onClick={handleBurn}
            disabled={isBurning}
            className="btn-secondary text-xs px-3.5 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border-red-500/30 disabled:opacity-50"
          >
            {isBurning ? 'Burning...' : 'Burn NFT'}
          </button>
        )}

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
