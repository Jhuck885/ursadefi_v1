'use client';

import { useState } from 'react';
import { Invoice } from '@/types';
import BrowserInvoicePDF from './BrowserInvoicePDF';
import { supabaseBrowser } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { MIN_MINT_USD } from '@/lib/constants';

interface Props {
  invoice: Invoice;
}

export default function InvoiceCard({ invoice }: Props) {
  const { success, error, warning, info } = useToast();
  const [isMinting, setIsMinting] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const saveNftToInvoice = async (nftokenId: string, txHash: string) => {
    try {
      const existing: any[] = JSON.parse(localStorage.getItem('invoices') || '[]');
      const next = existing.map((i) =>
        i.id === invoice.id
          ? { ...i, nftoken_id: nftokenId, xrpl_tx_hash: txHash, status: 'minted' }
          : i
      );
      if (!existing.find((i) => i.id === invoice.id)) {
        next.unshift({ ...invoice, nftoken_id: nftokenId, xrpl_tx_hash: txHash, status: 'minted' });
      }
      localStorage.setItem('invoices', JSON.stringify(next));
    } catch (e) {
      console.warn('localStorage update failed', e);
    }

    try {
      await supabaseBrowser
        .from('invoices')
        .update({ nftoken_id: nftokenId, xrpl_tx_hash: txHash, status: 'minted' })
        .eq('id', invoice.id);
    } catch (e) {
      console.warn('Supabase NFT update failed', e);
    }

    window.dispatchEvent(new Event('invoices-updated'));
  };

  const handleMint = async () => {
    const total = Number(invoice.total) || 0;
    if (total < MIN_MINT_USD) {
      warning(`Minimum $${MIN_MINT_USD} to mint an NFT`);
      return;
    }

    setIsMinting(true);
    setStatusMsg('Creating Xaman payload...');

    try {
      const res = await fetch('/api/xaman/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create mint payload');
      if (!data.next || !data.uuid) throw new Error('No Xaman deep link returned');

      setStatusMsg('Open Xaman and approve the mint...');
      info('Open Xaman and approve the mint');
      window.open(data.next, '_blank');

      const uuid = data.uuid;
      let attempts = 0;
      const maxAttempts = 60;

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
          setStatusMsg('Minted! Saving...');
          await saveNftToInvoice(resolveData.nftokenId, resolveData.txid || '');
          setStatusMsg(null);
          setIsMinting(false);
          success(`Minted · ${resolveData.nftokenId.slice(0, 12)}…`);
          return;
        }

        if (resolveData.signed && !resolveData.nftokenId) {
          if (attempts < maxAttempts) {
            setTimeout(poll, 2500);
            return;
          }
          setStatusMsg(null);
          setIsMinting(false);
          warning('Signed, but NFTokenID not found yet. Refresh in a moment.');
          return;
        }

        if (resolveData.expired) {
          setStatusMsg(null);
          setIsMinting(false);
          error('Xaman payload expired. Try again.');
          return;
        }

        if (attempts >= maxAttempts) {
          setStatusMsg(null);
          setIsMinting(false);
          warning('Timed out waiting for signature. Refresh if you already signed.');
          return;
        }

        setTimeout(poll, 2500);
      };

      setTimeout(poll, 4000);
    } catch (e: any) {
      console.error(e);
      setStatusMsg(null);
      setIsMinting(false);
      error(e.message || 'Mint failed');
    }
  };

  const handleBurn = async () => {
    if (!invoice.nftoken_id) return;

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
      info('Open Xaman and approve the burn');
      window.open(data.next, '_blank');

      setTimeout(async () => {
        try {
          const existing: any[] = JSON.parse(localStorage.getItem('invoices') || '[]');
          const next = existing.map((i) =>
            i.id === invoice.id ? { ...i, nftoken_id: null, status: 'burned' } : i
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
        success('Invoice marked as burned');
        setStatusMsg(null);
        setIsBurning(false);
      }, 10000);
    } catch (e: any) {
      console.error(e);
      setStatusMsg(null);
      setIsBurning(false);
      error(e.message || 'Burn failed');
    }
  };

  const handleShareToX = () => {
    const amount = invoice.total;
    const client = invoice.to || invoice.clientName || 'client';
    const nftPart = invoice.nftoken_id
      ? `\n\nMinted as XRPL NFT: ${invoice.nftoken_id}`
      : '';

    const text = `Just sent a $${amount} invoice to ${client} powered by @ursadefi + @xAI \u26A1\n\nInstant XRPL invoicing, payments & accounting — all free.\n\nTry it: ursadefi.com${nftPart}`;

    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleViewExplorer = () => {
    if (!invoice.nftoken_id) return;
    window.open(`https://testnet.xrpl.org/nft/${invoice.nftoken_id}`, '_blank');
  };

  const getStatusBadge = () => {
    if (invoice.nftoken_id) return <div className="badge badge-minted">Minted</div>;
    if (invoice.status === 'burned') return <div className="badge badge-draft">Burned</div>;
    if (invoice.status === 'paid') return <div className="badge badge-paid">Paid</div>;
    return <div className="badge badge-draft">XRPL NFT Ready</div>;
  };

  const canMint = Number(invoice.total) >= MIN_MINT_USD;

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
            disabled={isMinting || !canMint}
            className="btn-secondary text-xs px-3.5 py-1.5 disabled:opacity-50"
            title={!canMint ? `Minimum $${MIN_MINT_USD} to mint` : undefined}
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
