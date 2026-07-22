'use client';

import { useState, useEffect, useRef } from 'react';
import { Invoice } from '@/types';
import BrowserInvoicePDF from './BrowserInvoicePDF';
import { supabaseBrowser } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import { MIN_MINT_USD, calcPlatformFee } from '@/lib/constants';

interface Props {
  invoice: Invoice;
}

export default function InvoiceCard({ invoice }: Props) {
  const { success, error, warning, info } = useToast();
  const [isMinting, setIsMinting] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [lastMintUuid, setLastMintUuid] = useState<string | null>(null);
  const [mintSigned, setMintSigned] = useState(false);
  const [showBurnConfirm, setShowBurnConfirm] = useState(false);

  const [localNftId, setLocalNftId] = useState<string | null>(invoice.nftoken_id || null);
  const [localStatus, setLocalStatus] = useState(invoice.status);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalNftId(invoice.nftoken_id || null);
    setLocalStatus(invoice.status);
    if (invoice.nftoken_id) setMintSigned(true);
  }, [invoice.nftoken_id, invoice.status]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  const isActivated = Boolean(
    localStatus === 'activated' ||
    localStatus === 'paid' ||
    localStatus === 'minted' ||
    localNftId ||
    mintSigned
  );

  const feeUsd = calcPlatformFee(Number(invoice.subtotal) || Number(invoice.total) || 0);

  const saveNftToInvoice = async (nftokenId: string, txHash: string) => {
    setLocalNftId(nftokenId);
    setLocalStatus('minted');
    setMintSigned(true);

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

  const markActivated = async () => {
    setLocalStatus('activated');

    try {
      const existing: any[] = JSON.parse(localStorage.getItem('invoices') || '[]');
      const next = existing.map((i) =>
        i.id === invoice.id ? { ...i, status: 'activated', fee_paid: true } : i
      );
      localStorage.setItem('invoices', JSON.stringify(next));
    } catch {}

    try {
      await supabaseBrowser
        .from('invoices')
        .update({ status: 'activated' })
        .eq('id', invoice.id);
    } catch {}

    window.dispatchEvent(new Event('invoices-updated'));
  };

  const checkMintStatus = async (uuid: string) => {
    try {
      setStatusMsg('Checking transaction on ledger...');
      const resolveRes = await fetch('/api/xaman/resolve-mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid, invoiceId: invoice.id }),
      });

      const resolveData = await resolveRes.json();

      if (resolveData.signed) {
        setMintSigned(true);
        setLocalStatus('minted');
      }

      if (resolveData.signed && resolveData.nftokenId) {
        setStatusMsg('Confirmed. Saving NFT...');
        await saveNftToInvoice(resolveData.nftokenId, resolveData.txid || '');
        setStatusMsg(null);
        setIsMinting(false);
        setLastMintUuid(null);
        success(`Mint confirmed · ${resolveData.nftokenId.slice(0, 12)}…`);
        return true;
      }

      if (resolveData.signed && !resolveData.nftokenId) {
        setStatusMsg('Signed on ledger. Fetching NFT ID...');
        return false;
      }

      if (resolveData.expired) {
        setStatusMsg(null);
        setIsMinting(false);
        setLastMintUuid(null);
        error('Xaman payload expired. Please try minting again.');
        return true;
      }

      setStatusMsg('Waiting for signature in Xaman...');
      return false;
    } catch (err) {
      console.error('checkMintStatus error', err);
      setStatusMsg('Could not reach server. Retrying...');
      return false;
    }
  };

  const startPolling = (uuid: string) => {
    setLastMintUuid(uuid);
    let attempts = 0;
    const maxAttempts = 90;

    const poll = async () => {
      attempts += 1;
      const done = await checkMintStatus(uuid);

      if (done) return;

      if (attempts >= maxAttempts) {
        setStatusMsg(null);
        setIsMinting(false);
        if (mintSigned) {
          warning('Mint signed. NFT ID still loading — refresh in a moment.');
        } else {
          warning('Timed out. If you already signed, click Check Status.');
        }
        return;
      }

      pollRef.current = setTimeout(poll, 2000);
    };

    pollRef.current = setTimeout(poll, 2500);
  };

  const handleActivate = async () => {
    if (isActivated) return;

    setIsActivating(true);
    setStatusMsg('Creating platform fee payment...');

    try {
      const res = await fetch('/api/xaman/pay-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create fee payment');
      if (!data.next) throw new Error('No Xaman link returned');

      setStatusMsg(`Approve $${data.feeUsd?.toFixed(2) || feeUsd.toFixed(2)} platform fee in Xaman...`);
      info(`Approve platform fee of $${data.feeUsd?.toFixed(2) || feeUsd.toFixed(2)} in Xaman`);
      window.open(data.next, '_blank');

      await markActivated();
      success(`Invoice activated. Platform fee $${data.feeUsd?.toFixed(2) || feeUsd.toFixed(2)} requested.`);
      setStatusMsg(null);
      setIsActivating(false);
    } catch (e: any) {
      console.error(e);
      setStatusMsg(null);
      setIsActivating(false);
      error(e.message || 'Activation failed');
    }
  };

  const handleMint = async () => {
    const total = Number(invoice.total) || 0;
    if (total < MIN_MINT_USD) {
      warning(`Minimum $${MIN_MINT_USD} to mint an NFT`);
      return;
    }

    if (!isActivated) {
      warning('Activate the invoice first (pay the platform fee) before minting.');
      return;
    }

    setIsMinting(true);
    setMintSigned(false);
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

      startPolling(data.uuid);
    } catch (e: any) {
      console.error(e);
      setStatusMsg(null);
      setIsMinting(false);
      error(e.message || 'Mint failed');
    }
  };

  const handleManualCheck = async () => {
    if (!lastMintUuid) {
      warning('No recent mint to check. Start a new mint first.');
      return;
    }
    setIsMinting(true);
    await checkMintStatus(lastMintUuid);
  };

  const confirmBurn = () => {
    setShowBurnConfirm(true);
  };

  const handleBurn = async () => {
    if (!localNftId) return;

    setShowBurnConfirm(false);
    setIsBurning(true);
    setStatusMsg('Creating burn payload...');

    try {
      const res = await fetch('/api/xaman/burn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nftokenId: localNftId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create burn payload');
      if (!data.next) throw new Error('No Xaman deep link returned');

      setStatusMsg('Open Xaman and approve the burn...');
      info('Open Xaman and approve the burn');
      window.open(data.next, '_blank');

      setTimeout(async () => {
        setLocalNftId(null);
        setLocalStatus('burned');
        setMintSigned(false);

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
        success('Invoice NFT burned');
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
    const client = invoice.to || (invoice as any).clientName || 'client';
    const nftPart = localNftId
      ? `\n\nMinted as XRPL NFT: ${localNftId}`
      : '';

    const text = `Just sent a $${amount} invoice to ${client} powered by @ursadefi + @xAI \u26A1\n\nInstant XRPL invoicing, payments & accounting — all free.\n\nTry it: ursadefi.com${nftPart}`;

    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleViewExplorer = () => {
    if (!localNftId) return;
    window.open(`https://livenet.xrpl.org/nft/${localNftId}`, '_blank');
  };

  const getStatusBadge = () => {
    if (localNftId || mintSigned) return <div className="badge badge-minted">Minted</div>;
    if (localStatus === 'burned') return <div className="badge badge-draft">Burned</div>;
    if (localStatus === 'paid') return <div className="badge badge-paid">Paid</div>;
    if (isActivated) return <div className="badge badge-paid">Activated</div>;
    return <div className="badge badge-draft">Draft</div>;
  };

  const canMint = Number(invoice.total) >= MIN_MINT_USD;
  const showMintButton = isActivated && !localNftId && !mintSigned && localStatus !== 'burned';

  return (
    <div
      className="border border-[var(--card-border)] rounded-3xl p-5 bg-[var(--card-bg)] hover:border-[var(--brand-primary)]/40 transition-all group relative"
      data-card
    >
      {/* Burn Confirmation Modal */}
      {showBurnConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Burn this NFT?</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
              This will permanently destroy the on-chain NFT for this invoice. This action <strong className="text-[var(--text-primary)]">cannot be undone</strong>. Only continue if this was a mistake or the record needs to be removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBurnConfirm(false)}
                className="flex-1 py-2.5 rounded-full border border-[var(--border-color)] text-sm hover:bg-[var(--bg-primary)] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBurn}
                className="flex-1 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition"
              >
                Yes, Burn NFT
              </button>
            </div>
          </div>
        </div>
      )}

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
              {invoice.to || (invoice as any).clientName}
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

      {localNftId && (
        <div className="mb-3 p-2 bg-[var(--bg-tertiary)] rounded-xl text-xs font-mono break-all">
          NFT: {localNftId.slice(0, 22)}...
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

        {!isActivated && (
          <button
            onClick={handleActivate}
            disabled={isActivating}
            className="btn-secondary text-xs px-3.5 py-1.5 bg-[var(--brand-primary)]/10 hover:bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] border-[var(--brand-primary)]/30 disabled:opacity-50"
          >
            {isActivating ? 'Activating...' : `Activate ($${feeUsd.toFixed(2)})`}
          </button>
        )}

        {showMintButton ? (
          <>
            <button
              onClick={handleMint}
              disabled={isMinting || !canMint}
              className="btn-secondary text-xs px-3.5 py-1.5 disabled:opacity-50"
              title={!canMint ? `Minimum $${MIN_MINT_USD} to mint` : undefined}
            >
              {isMinting ? 'Minting...' : 'Mint as XRPL NFT'}
            </button>
            {lastMintUuid && (
              <button
                onClick={handleManualCheck}
                className="btn-secondary text-xs px-3.5 py-1.5 border-[var(--brand-primary)]/40 text-[var(--brand-primary)]"
              >
                Check Status
              </button>
            )}
          </>
        ) : localNftId || mintSigned ? (
          <button
            onClick={confirmBurn}
            disabled={isBurning || !localNftId}
            className="btn-secondary text-xs px-3.5 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border-red-500/30 disabled:opacity-50"
          >
            {isBurning ? 'Burning...' : localNftId ? 'Burn NFT' : 'Minted'}
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
