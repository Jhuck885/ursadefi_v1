'use client';

import { useState, useEffect } from 'react';
import InvoiceCard from './InvoiceCard';
import { Invoice } from '@/types';
import { supabaseBrowser as supabase } from '@/lib/supabase';
import { useWallet } from '@/context/WalletContext';

export default function InvoiceFeed() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { wallet, isConnected } = useWallet();

  const loadFromLocal = (): Invoice[] => {
    try {
      return JSON.parse(localStorage.getItem('invoices') || '[]');
    } catch {
      return [];
    }
  };

  const loadFromSupabase = async (walletAddress: string): Promise<Invoice[]> => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('wallet_address', walletAddress)
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        from: row.from_name || '',
        to: row.to_name || '',
        items: row.items || [],
        total: row.total || 0,
        xrpAmount: row.xrp_amount || 0,
        receiver: row.receiver || '',
        dueDate: row.due_date || '',
        description: row.description || '',
        status: row.status || 'draft',
        nftoken_id: row.nftoken_id || null,
        nft_uri: row.nft_uri || null,
        xrpl_tx_hash: row.xrpl_tx_hash || null,
        created_at: row.created_at,
        subtotal: row.subtotal || row.total || 0,
      }));
    } catch (err) {
      console.error('Failed to load invoices from Supabase:', err);
      return [];
    }
  };

  const mergeInvoices = (local: Invoice[], remote: Invoice[]): Invoice[] => {
    const map = new Map<string, Invoice>();

    // Remote first
    remote.forEach((inv) => map.set(inv.id, inv));

    // Local overwrites / adds — this is what makes the UI update instantly after mint
    local.forEach((inv) => {
      const existing = map.get(inv.id);
      if (!existing) {
        map.set(inv.id, inv);
      } else {
        // Prefer local if it has newer status or an nftoken_id
        const preferLocal =
          inv.nftoken_id ||
          (inv.status === 'minted' && existing.status !== 'minted') ||
          (inv.status === 'activated' && existing.status === 'draft');

        map.set(inv.id, preferLocal ? { ...existing, ...inv } : { ...inv, ...existing });
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      return db - da;
    });
  };

  const loadInvoices = async () => {
    setLoading(true);

    const local = loadFromLocal();

    if (isConnected && wallet?.address) {
      const remote = await loadFromSupabase(wallet.address);
      setInvoices(mergeInvoices(local, remote));
    } else {
      setInvoices(local);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadInvoices();

    const handleUpdate = () => loadInvoices();
    window.addEventListener('invoices-updated', handleUpdate);

    return () => {
      window.removeEventListener('invoices-updated', handleUpdate);
    };
  }, [wallet?.address, isConnected]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto pt-8 px-4">
        <div className="text-center py-10 text-zinc-500">Loading your invoices...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-8 overflow-y-auto h-[calc(100vh-4rem)] px-4">
      {invoices.length === 0 && (
        <div className="text-center py-20 text-zinc-500">No invoices yet — create one above</div>
      )}
      {invoices.map((inv) => (
        <InvoiceCard key={inv.id} invoice={inv} />
      ))}
    </div>
  );
}
