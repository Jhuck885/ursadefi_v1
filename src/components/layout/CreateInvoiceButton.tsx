'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import InvoiceForm from '@/components/invoice/InvoiceForm';

interface Props {
  /** 'fab' = floating action button (mobile), 'full' = full-width primary button */
  variant?: 'fab' | 'full' | 'inline';
  className?: string;
}

export default function CreateInvoiceButton({ variant = 'full', className = '' }: Props) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    window.dispatchEvent(new Event('invoices-updated'));
  };

  return (
    <>
      {variant === 'fab' ? (
        <button
          onClick={() => setOpen(true)}
          className={`fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white shadow-lg shadow-black/40 flex items-center justify-center transition active:scale-95 md:hidden ${className}`}
          aria-label="Create new invoice"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>
      ) : variant === 'inline' ? (
        <button
          onClick={() => setOpen(true)}
          className={`inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-full text-sm font-semibold transition ${className}`}
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className={`w-full py-4 bg-[var(--brand-primary)] rounded-full font-bold hover:bg-[var(--brand-primary-hover)] text-white transition ${className}`}
        >
          Create New Invoice
        </button>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/90 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-[var(--bg-primary)] rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-lg h-[92vh] sm:h-[95vh] overflow-y-auto border border-[var(--border-color)] relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 pr-10">
              <h2 className="text-2xl font-bold">Create New Invoice</h2>
              <p className="text-[var(--text-secondary)] text-sm mt-1">Fill in the details below</p>
            </div>

            <InvoiceForm onSuccess={handleSuccess} />
          </div>
        </div>
      )}
    </>
  );
}
