'use client';

import { useState, useEffect } from 'react';
import InvoiceCard from './InvoiceCard';
import { Invoice } from '@/types';
import { supabase } from '@/lib/supabase';
import { useWallet } from '@/context/WalletContext';

export default function InvoiceFeed() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { wallet, isConnected } = useWallet();

  const loadFromSupabase = async (walletAddress: string) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('wallet_address', walletAddress)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading invoices from Supabase:', error);
        return;
      }

      if (data) {
        // Map Supabase rows to our Invoice type if needed
        const mapped = data.map((row: any) => ({
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
        }));
        setInvoices(mapped);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    }
  };

  const loadInvoices = async () => {
    setLoading(true);

    if (isConnected && wallet?.address) {
      // Load from Supabase for logged-in users
      await loadFromSupabase(wallet.address);
    } else {
      // Fallback to localStorage for demo / not logged in
      const saved = JSON.parse(localStorage.getItem('invoices') || '[]');
      setInvoices(saved);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadInvoices();

    // Listen for new invoice saves (from modal or form)
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
      {invoices.map(inv => <InvoiceCard key={inv.id} invoice={inv} />)}
    </div>
  );
}
