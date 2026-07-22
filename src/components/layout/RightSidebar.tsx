'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Invoice } from '@/types';
import { supabaseBrowser } from '@/lib/supabase';
import CreateInvoiceButton from '@/components/layout/CreateInvoiceButton';
import { useWallet } from '@/context/WalletContext';

const PriceCard = ({ coinId, label }: { coinId: string; label: string }) => {
  const [price, setPrice] = useState<number | null>(null);
  const [change, setChange] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
        );
        if (res.ok) {
          const data = await res.json();
          const coin = data[coinId];
          setPrice(coin.usd);
          setChange(coin.usd_24h_change);
        }
      } catch (err) {
        console.error(`${label} price fetch failed`, err);
        setPrice(null);
        setChange(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, [coinId, label]);

  if (loading) {
    return (
      <div className="mb-4 p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
        <div className="text-sm text-[var(--text-secondary)]">{label} Price (Live)</div>
        <div className="text-[var(--text-secondary)] text-sm">Loading...</div>
      </div>
    );
  }

  const isUp = change !== null && change > 0;
  const arrow = isUp ? '↑' : '↓';
  const color = isUp ? 'text-green-500' : 'text-red-500';

  return (
    <div className="mb-4 p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
      <div className="text-sm text-[var(--text-secondary)] mb-1">{label} Price (Live)</div>
      <div className="text-2xl font-bold text-[var(--text-primary)]">
        ${price?.toFixed(2) || '—.--'}
        {change !== null && (
          <span className={`ml-2 text-lg ${color}`}>
            {arrow} {Math.abs(change).toFixed(2)}%
          </span>
        )}
      </div>
      <div className="text-xs text-[var(--text-secondary)] mt-1">Powered by CoinGecko</div>
    </div>
  );
};

const XRPPriceCard = () => <PriceCard coinId="ripple" label="XRP Price" />;
const BTCPriceCard = () => <PriceCard coinId="bitcoin" label="BTC Price" />;

const OutstandingCard = () => {
  const [outstanding, setOutstanding] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { wallet, isConnected } = useWallet();

  const loadOutstanding = async () => {
    setLoading(true);

    // Prefer localStorage as source of truth for what the user currently sees
    let local: Invoice[] = [];
    try {
      local = JSON.parse(localStorage.getItem('invoices') || '[]');
    } catch {
      local = [];
    }

    // If local is empty, treat as "user cleared everything" and show nothing
    if (local.length === 0) {
      setOutstanding([]);
      setLoading(false);
      return;
    }

    // Optionally enrich with Supabase, but never re-introduce deleted invoices
    const localIds = new Set(local.map((i) => i.id));
    let merged = [...local];

    if (isConnected && wallet?.address) {
      try {
        const { data, error } = await supabaseBrowser
          .from('invoices')
          .select('*')
          .eq('wallet_address', wallet.address)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const remote: Invoice[] = data
            .filter((row: any) => localIds.has(row.id)) // only keep ones that still exist locally
            .map((row: any) => ({
              id: row.id,
              from: row.from_name || row.from || '',
              to: row.to_name || row.to || '',
              items: row.items || [{ desc: row.description || '', qty: 1, price: row.total || 0 }],
              total: Number(row.total) || 0,
              xrpAmount: Number(row.xrp_amount || row.xrpAmount) || 0,
              receiver: row.receiver || '',
              dueDate: row.due_date || row.dueDate || '',
              description: row.description || '',
              status: row.status || 'draft',
              created_at: row.created_at,
              user_id: row.wallet_address,
            }));

          // Merge: local wins for status, remote can fill missing fields
          const map = new Map<string, Invoice>();
          remote.forEach((inv) => map.set(inv.id, inv));
          local.forEach((inv) => {
            const existing = map.get(inv.id);
            map.set(inv.id, existing ? { ...existing, ...inv } : inv);
          });
          merged = Array.from(map.values());
        }
      } catch (err) {
        console.warn('Supabase outstanding fetch failed', err);
      }
    }

    const unpaid = merged
      .filter((inv) => {
        const s = (inv.status || 'draft').toLowerCase();
        return s !== 'paid' && s !== 'burned';
      })
      .sort((a, b) => {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return da - db;
      })
      .slice(0, 5);

    setOutstanding(unpaid);
    setLoading(false);
  };

  useEffect(() => {
    loadOutstanding();
    const handler = () => loadOutstanding();
    window.addEventListener('invoices-updated', handler);
    return () => window.removeEventListener('invoices-updated', handler);
  }, [wallet?.address, isConnected]);

  const totalOutstanding = outstanding.reduce((sum, i) => sum + (Number(i.total) || 0), 0);

  if (loading) {
    return <p className="text-[var(--text-secondary)] mb-8 text-sm">Loading outstanding...</p>;
  }

  if (outstanding.length === 0) {
    return (
      <div className="mb-8">
        <p className="text-[var(--text-secondary)] text-sm">No outstanding invoices 🎉</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[var(--text-secondary)]">
          {outstanding.length} open · $
          {totalOutstanding.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <Link href="/invoices" className="text-xs text-[var(--brand-primary)] hover:underline">
          View all
        </Link>
      </div>

      <div className="space-y-3">
        {outstanding.map((inv) => {
          const isOverdue =
            inv.dueDate &&
            new Date(inv.dueDate) < new Date() &&
            (inv.status || 'draft') !== 'paid';
          return (
            <div
              key={inv.id}
              className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]"
            >
              <div className="flex justify-between items-start gap-2 mb-1">
                <span className="font-semibold text-[var(--text-primary)] truncate">
                  {inv.to || 'Unknown client'}
                </span>
                <span className="font-bold text-sm whitespace-nowrap">
                  ${Number(inv.total || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span className="font-mono truncate max-w-[120px]">{inv.id}</span>
                {inv.dueDate && (
                  <span className={isOverdue ? 'text-red-400 font-medium' : ''}>
                    {isOverdue ? 'Overdue ' : 'Due '}
                    {new Date(inv.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>

              {Number(inv.xrpAmount) > 0 && (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  ≈ {Number(inv.xrpAmount).toFixed(2)} XRP
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function RightSidebar() {
  return (
    <div className="p-6 h-full overflow-y-auto text-[var(--text-primary)]">
      <XRPPriceCard />
      <BTCPriceCard />

      <h2 className="text-xl font-bold mb-4">Tax Overview</h2>
      <div className="bg-[var(--bg-secondary)] rounded-xl p-4 mb-6 border border-[var(--border-color)]">
        <p className="text-sm text-[var(--text-secondary)]">Next est. payment</p>
        <p className="text-2xl font-bold">$6,283</p>
        <p className="text-sm text-[var(--text-secondary)]">Apr 15, 2026</p>
        <p className="text-[var(--brand-accent)] text-sm mt-2">Upcoming</p>
      </div>

      <h3 className="text-lg font-bold mb-4">Outstanding</h3>
      <OutstandingCard />

      <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
      <CreateInvoiceButton variant="full" />
    </div>
  );
}
