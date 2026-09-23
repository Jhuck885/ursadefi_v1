'use client';

import { useState } from 'react';
import { Invoice } from '@/types';
import { getAsset, SETTLEMENT_ASSETS, type AssetId } from '@/lib/stablecoins';
import { useToast } from '@/components/ui/Toast';
import { isDemoWallet } from '@/lib/demo';
import { useWallet } from '@/context/WalletContext';

interface Props {
  invoice: Invoice;
}

export default function PayInvoiceButton({ invoice }: Props) {
  const { wallet } = useWallet();
  const demo = isDemoWallet(wallet?.address);
  const { success, error, warning, info } = useToast();
  const [busy, setBusy] = useState(false);
  const [assetId, setAssetId] = useState<AssetId>(
    ((invoice.currency as AssetId) || 'RLUSD') as AssetId
  );

  const destination = invoice.receiver || invoice.recipient || '';
  const amount =
    getAsset(assetId).id === 'XRP'
      ? Number(invoice.xrpAmount) || Number(invoice.total)
      : Number(invoice.total);

  const enableTrustline = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/xaman/enable-trustline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'TrustSet failed');
      info(data.message || 'Approve TrustSet in Xaman');
      if (data.next) window.open(data.next, '_blank');
    } catch (e: any) {
      error(e.message || 'Could not open TrustSet');
    } finally {
      setBusy(false);
    }
  };

  const pay = async () => {
    if (demo) {
      warning('Connect a real Xaman wallet to send stablecoin payments.');
      return;
    }
    if (!destination?.startsWith('r')) {
      warning('Invoice has no XRPL destination address.');
      return;
    }

    setBusy(true);
    try {
      const check = await fetch(
        `/api/xrpl/trustline?account=${encodeURIComponent(destination)}&asset=${assetId}`
      );
      const line = await check.json();

      if (line.required && !line.ready) {
        warning(
          `${getAsset(assetId).symbol} is not enabled on the receiving wallet. The freelancer must approve a TrustSet first.`
        );
        setBusy(false);
        return;
      }

      const res = await fetch('/api/xaman/pay-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          destination,
          amount,
          assetId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment payload failed');
      success(data.message || 'Open Xaman to pay');
      if (data.next) window.open(data.next, '_blank');
    } catch (e: any) {
      error(e.message || 'Payment failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={assetId}
        onChange={(e) => setAssetId(e.target.value as AssetId)}
        className="text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full px-3 py-1.5"
      >
        {SETTLEMENT_ASSETS.map((id) => (
          <option key={id} value={id}>
            {getAsset(id).symbol}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={pay}
        disabled={busy}
        className="btn-secondary text-xs px-3.5 py-1.5 disabled:opacity-50"
      >
        {busy ? 'Opening…' : `Pay ${getAsset(assetId).symbol}`}
      </button>
      {getAsset(assetId).kind === 'issued' && (
        <button
          type="button"
          onClick={enableTrustline}
          disabled={busy}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline"
        >
          Enable {getAsset(assetId).symbol} on my wallet
        </button>
      )}
    </div>
  );
}
