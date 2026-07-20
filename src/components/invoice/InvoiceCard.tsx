'use client';

import { useState } from 'react';
import { Invoice } from '@/types';
import BrowserInvoicePDF from './BrowserInvoicePDF';
import { supabaseBrowser } from '@/lib/supabase';

interface Props {
  invoice: Invoice;
}

export default function InvoiceCard({ invoice }: Props) {
  const [isMinting, setIsMinting] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  /** Persist nftoken_id + status to localStorage and Supabase */
  const saveNftToInvoice = async (nftokenId: string, txHash: string) => {
    // 1. Update localStorage
    try {
      const existing: any[] = JSON.parse(localStorage.getItem('invoices') || '[]');
      const next = existing.map((i) =>
        i.id === invoice.id
          ? {
              ...i,
              nftoken_id: nftokenId,
              xrpl_tx_hash: txHash,
              status: 'minted',
            }
          : i
      );

      // If this invoice only lived in memory / Supabase, still write a local copy
      if (!existing.find((i) => i.id === invoice.id)) {
        next.unshift({
          ...invoice,
          nftoken_id: nftokenId,
          xrpl_tx_hash: txHash,
          status: 'minted',
        });
      }

      localStorage.setItem('invoices', JSON.stringify(next));
    } catch (e) {
      console.warn('localStorage update failed', e);
    }

    // 2. Update Supabase (best-effort)
    try {
      await supabaseBrowser
        .from('invoices')
        .update({
          nftoken_id: nftokenId,
          xrpl_tx_hash: txHash,
          status: 'minted',
        })
        .eq('id', invoice.id);
    } catch (e) {
      console.warn('Supabase NFT update failed', e);
    }

    // 3. Tell the rest of the app to refresh
    window.dispatchEvent(new Event('invoices-updated'));
  };

  const handleMint = async () => {
    setIsMinting(true);
    setStatusMsg('Creating Xaman payload...');

    try {
      // Step 1 — Create payload
      const res = await fetch('/api/xaman/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create mint payload');

      if (!data.next || !data.uuid) {
        throw new Error('No Xaman deep link returned');
      }

      // Step 2 — Open Xaman
      setStatusMsg('Open Xaman and approve the mint...');
      window.open(data.next, '_blank');

      // Step 3 — Poll until signed + NFTokenID resolved
      const uuid = data.uuid;
      let attempts = 0;
      const maxAttempts = 60; // ~2 minutes

      const poll = async (): Promise<void> => {
        attempts += 1;
        setStatusMsg(`Waiting for signature... (${attempts})`);

        const resolveRes = await fetch('/api/xaman/resolve-mint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uuid, invoiceId: invoice.id }),
        });

        const resolveData = await resolveRes.json();

        if (resolveData.signed && resolveData.nftokenId) {
          // Success!
          setStatusMsg('Minted! Saving...');
          await saveNftToInvoice(resolveData.nftokenId, resolveData.txid || '');
          setStatusMsg(null);
          alert(`Successfully minted!\n\nNFTokenID:\n${resolveData.nftokenId}`);
          return;
        }

        if (resolveData.signed && !resolveData.nftokenId) {
          // Signed but we couldn't extract ID yet — keep trying a few more times
          if (attempts < maxAttempts) {
            setTimeout(poll, 2500);
            return;
          }
          setStatusMsg(null);
          alert(
            'Transaction signed, but NFTokenID could not be extracted automatically. Refresh the page in a moment or check the explorer.'
          );
          return;
        }

        if (resolveData.expired) {
          setStatusMsg(null);
          alert('Xaman payload expired. Please try minting again.');
          return;
        }

        if (attempts >= maxAttempts) {
          setStatusMsg(null);
          alert('Timed out waiting for Xaman signature. If you already signed, refresh the page.');
          return;
        }

        // Keep polling
        setTimeout(poll, 2500);
      };

      // Start polling after a short delay so Xaman has time to open
      setTimeout(poll, 4000);
    } catch (e: any) {
      console.error(e);
      setStatusMsg(null);
      alert(e.message || 'Mint failed');
    } finally {
      // Don't set isMinting false immediately — keep the spinner while polling
      // We clear it inside the poll success/fail paths via setStatusMsg(null)
      // But for safety:
      setTimeout(() => setIsMinting(false), 120000);
    }
  };

  const handleBurn = async () => {
    if (!invoice.nftoken_id) return;
    if (
      !confirm(
        `Burn NFT ${invoice.nftoken_id}?\n\nThis is irreversible on the XRPL.`
      )
    )
      return;

    setIsBurning(true);
    setStatusMsg('Creating burn payload...');

    try {
      const res = await fetch('/api/xaman/burn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nftokenId: invoice.nftoken_id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create burn payload');

      if (!data.next) throw new Error('No Xaman deep link returned');

      setStatusMsg('Open Xaman and approve the burn...');
      window.open(data.next, '_blank');

      // Simple success path for burn — we don't need the ID after burn
      // Just mark as burned after a short delay + user confirmation
      setTimeout(async () => {
        const confirmed = window.confirm(
          'Did you approve the burn in Xaman?\n\nClick OK to mark this invoice as burned.'
        );
        if (confirmed) {
          // Clear nftoken_id and set status
          try {
            const existing: any[] = JSON.parse(localStorage.getItem('invoices') || '[]');
            const next = existing.map((i) =>
              i.id === invoice.id
                ? { ...i, nftoken_id: null, status: 'burned' }
                : i
            );
            localStorage.setItem('invoices', JSON.stringify(next));
          } catch {}

          try {
            await supabaseBrowser
              .from('invoices')
              .update({ nftoken_id: null, status: 'burned' })
              .eq('id', invoice.id);
          } catch {}

          window.dispatchEvent(new Event('invoices-updated'));
          alert('Invoice marked as burned.');
        }
        setStatusMsg(null);
        setIsBurning(false);
      }, 8000);
    } catch (e: any) {
      console.error(e);
      setStatusMsg(null);
      setIsBurning(false);
      alert(e.message || 'Burn failed');
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
    window.open(`https://testnet.xrpl.org/nft/${invoice.nftoken_id}`, '_blank');
  };

  const getStatusBadge = () => {
    if (invoice.nftoken_id) {
      return <div className="badge badge-minted">Minted</div>;
    }
    if (invoice.status === 'burned') {
      return <div className="badge badge-draft">Burned</div>;
    }
    if (invoice.status === 'paid') {
      return <div className="badge badge-paid">Paid</div>;
    }
    return <div className="badge badge-draft">XRPL NFT Ready</div>;
  };

  return (
    <div
      className="border border-[var(--card-border)] rounded-3xl p-5 bg-[var(--card-bg)] hover:border-[var(--brand-primary)]/40 transition-all group"
      data-card
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-mono text-[10px] text-[var(--text-muted)] tracking-[1px]">
            #{invoice.id}
          </div>
          <div className="text-3xl font-semibold tracking-[-1.5px] mt-1 text-[var(--text-primary)]">
            ${invoice.total}
          </div>
          <div className="text-sm text-[var(--text-secondary)] mt-0.5">
            To:{' '}
            <span className="font-medium text-[var(--text-primary)]">
              {invoice.to || invoice.clientName}
            </span>
          </div>
        </div>
        <div className="mt-1">{getStatusBadge()}</div>
      </div>

      {invoice.description && (
        <div className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2 pr-2">
          {invoice.description}
        </div>
      )}

      {invoice.nftoken_id && (
        <div className="mb-3 p-2 bg-[var(--bg-tertiary)] rounded-xl text-xs font-mono break-all">
          NFT: {invoice.nftoken_id.slice(0, 22)}...
          <button
            onClick={handleViewExplorer}
            className="ml-2 text-[var(--brand-primary)] underline hover:no-underline"
          >
            View on Explorer
          </button>
        </div>
      )}

      {statusMsg && (
        <div className="mb-3 text-xs text-[var(--brand-primary)] animate-pulse">
          {statusMsg}
        </div>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-color)] mt-1 flex-wrap">
        <div className="flex-1">
          <BrowserInvoicePDF invoice={invoice} compact />
        </div>

        {!invoice.nftoken_id && invoice.status !== 'burned' ? (
          <button
            onClick={handleMint}
            disabled={isMinting}
            className="btn-secondary text-xs px-3.5 py-1.5 disabled:opacity-50"
          >
            {isMinting ? 'Minting...' : 'Mint as XRPL NFT'}
          </button>
        ) : invoice.nftoken_id ? (
          <button
            onClick={handleBurn}
            disabled={isBurning}
            className="btn-secondary text-xs px-3.5 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border-red-500/30 disabled:opacity-50"
          >
            {isBurning ? 'Burning...' : 'Burn NFT'}
          </button>
        ) : null}

        <button onClick={handleShareToX} className="btn-share-x text-xs px-3.5 py-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
            <path d="M18.244 2.25l-7.451 8.502L4.5 2.25H1.5l7.5 8.5L1.5 21.75h3l6.75-7.5 6.75 7.5h3l-7.5-8.5 7.5-8.5z" />
          </svg>
          Share to X
        </button>
      </div>
    </div>
  );
}
