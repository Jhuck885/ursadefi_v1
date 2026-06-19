'use client';

import { useState, useEffect } from 'react';
import InvoiceCard from './InvoiceCard';
import { Invoice } from '@/types';

export default function InvoiceFeed() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const loadInvoices = () => {
    const saved = JSON.parse(localStorage.getItem('invoices') || '[]');
    setInvoices(saved);
  };

  useEffect(() => {
    loadInvoices();

    // Listen for storage changes (when new invoice is saved from modal)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'invoices') {
        loadInvoices();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom event (more reliable for same-tab updates)
    const handleCustomUpdate = () => loadInvoices();
    window.addEventListener('invoices-updated', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('invoices-updated', handleCustomUpdate);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-8 overflow-y-auto h-[calc(100vh-4rem)] px-4">
      {invoices.length === 0 && (
        <div className="text-center py-20 text-zinc-500">No invoices yet — create one above</div>
      )}
      {invoices.map(inv => <InvoiceCard key={inv.id} invoice={inv} />)}
    </div>
  );
}
