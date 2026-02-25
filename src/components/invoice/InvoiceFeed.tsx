'use client';
import { useState, useEffect } from 'react';
import InvoiceCard from './InvoiceCard';
import { Invoice } from '@/types';

export default function InvoiceFeed() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('invoices') || '[]');
    setInvoices(saved);
  }, []);

  const loadMore = () => { /* simulate, later Supabase */ setPage(p => p + 1); };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-8 overflow-y-auto h-[calc(100vh-4rem)] px-4">
      {invoices.length === 0 && <div className="text-center py-20 text-zinc-500">No invoices yet — create one above</div>}
      {invoices.map(inv => <InvoiceCard key={inv.id} invoice={inv} />)}
      <button onClick={loadMore} className="btn-pill mx-auto block">Load more</button>
    </div>
  );
}
