'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import Link from 'next/link';
import LeftSidebar from '@/components/layout/LeftSidebar';
import BrowserInvoicePDF from '@/components/invoice/BrowserInvoicePDF';
import { Invoice } from '@/types';
import { FileText, Search, Plus, Trash2, ExternalLink, Home, Users, User } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase';

export default function InvoicesPage() {
  const { wallet, isConnected } = useWallet();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const loadInvoices = async () => {
    setLoading(true);
    let all: Invoice[] = [];

    // 1. Load from localStorage
    try {
      const local = JSON.parse(localStorage.getItem('invoices') || '[]');
      all = [...local];
    } catch {}

    // 2. Try Supabase
    if (wallet?.address) {
      try {
        const { data, error } = await supabaseBrowser
          .from('invoices')
          .select('*')
          .eq('wallet_address', wallet.address)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped: Invoice[] = data.map((row: any) => ({
            id: row.id,
            from: row.from_name || row.from || '',
            to: row.to_name || row.to || '',
            items: row.items || [{ desc: row.description || '', qty: 1, price: row.total || 0 }],
            total: row.total || 0,
            xrpAmount: row.xrp_amount || row.xrpAmount || 0,
            receiver: row.receiver || '',
            dueDate: row.due_date || row.dueDate || '',
            description: row.description || '',
            status: row.status || 'draft',
            created_at: row.created_at,
            user_id: row.wallet_address,
          }));

          // Merge: prefer Supabase, keep local-only ones
          const supabaseIds = new Set(mapped.map(i => i.id));
          const localOnly = all.filter(i => !supabaseIds.has(i.id));
          all = [...mapped, ...localOnly];
        }
      } catch (err) {
        console.warn('Supabase invoices fetch failed, using local only', err);
      }
    }

    // Sort newest first
    all.sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      return db - da;
    });

    setInvoices(all);
    setLoading(false);
  };

  useEffect(() => {
    if (isConnected) loadInvoices();
    else setLoading(false);

    const handler = () => loadInvoices();
    window.addEventListener('invoices-updated', handler);
    return () => window.removeEventListener('invoices-updated', handler);
  }, [wallet?.address, isConnected]);

  const filtered = invoices.filter(inv => {
    const term = searchTerm.toLowerCase();
    return (
      inv.id?.toLowerCase().includes(term) ||
      inv.to?.toLowerCase().includes(term) ||
      inv.from?.toLowerCase().includes(term) ||
      inv.description?.toLowerCase().includes(term)
    );
  });

  const handleDelete = async (invoice: Invoice) => {
    if (!confirm(`Delete invoice ${invoice.id}?`)) return;

    // Remove from local
    const existing = JSON.parse(localStorage.getItem('invoices') || '[]');
    localStorage.setItem('invoices', JSON.stringify(existing.filter((i: Invoice) => i.id !== invoice.id)));

    // Try Supabase
    try {
      await supabaseBrowser.from('invoices').delete().eq('id', invoice.id);
    } catch {}

    setInvoices(prev => prev.filter(i => i.id !== invoice.id));
    if (selectedInvoice?.id === invoice.id) setSelectedInvoice(null);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">Please connect your wallet to view invoices.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-full text-sm font-medium transition">
            Connect Wallet
            </Link>
          </div>
        </div>
      );
    }

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="w-64 border-r border-[var(--border-color)] hidden md:block flex-shrink-0">
        <LeftSidebar />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
              <p className="text-[var(--text-secondary)] mt-1">
                {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} total
              </p>
            </div>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-full text-sm font-medium transition"
            >
              <Plus className="w-4 h-4" />
              New Invoice
            </Link>
          </div>

          {/* Search */}
          <div className="mb-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by ID, client, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          {loading ? (
            <div className="text-center py-16 text-[var(--text-secondary)]">Loading invoices...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)] mb-2">
                {searchTerm ? 'No invoices match your search.' : 'No invoices yet.'}
              </p>
              {!searchTerm && (
                <Link href="/dashboard" className="text-[var(--brand-primary)] hover:underline text-sm">
                  Create your first invoice →
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 hover:border-[var(--brand-primary)]/40 transition cursor-pointer"
                  onClick={() => setSelectedInvoice(selectedInvoice?.id === inv.id ? null : inv)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-sm text-[var(--brand-primary)]">{inv.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          inv.status === 'paid'
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : inv.status === 'overdue'
                            ? 'bg-red-500/15 text-red-400'
                            : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                        }`}>
                          {inv.status || 'draft'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg truncate">{inv.to || 'Unknown Client'}</h3>
                      <p className="text-sm text-[var(--text-secondary)] truncate mt-0.5">
                        {inv.description || inv.from || '—'}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="font-semibold">${Number(inv.total).toFixed(2)}</span>
                        <span className="text-[var(--text-secondary)]">≈ {Number(inv.xrpAmount).toFixed(4)} XRP</span>
                        {inv.dueDate && (
                          <span className="text-[var(--text-muted)]">Due {new Date(inv.dueDate).toLocaleDateString()}</span>
                        )}
                        {inv.created_at && (
                          <span className="text-[var(--text-muted)]">Created {new Date(inv.created_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <BrowserInvoicePDF invoice={inv} compact />
                      <button
                        onClick={() => handleDelete(inv)}
                        className="p-2 text-red-400 hover:bg-red-950/40 rounded-xl transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {selectedInvoice?.id === inv.id && (
                    <div className="mt-5 pt-5 border-t border-[var(--border-color)] grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[var(--text-muted)] text-xs mb-1">From</p>
                        <p>{inv.from || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[var(--text-muted)] text-xs mb-1">Receiver Wallet</p>
                        <p className="font-mono text-xs break-all">{inv.receiver || '—'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-[var(--text-muted)] text-xs mb-1">Line Items</p>
                        <ul className="space-y-1">
                          {(inv.items || []).map((item, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span>{item.desc || 'Item'}</span>
                              <span>${(item.qty * item.price).toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-primary)] border-t border-[var(--border-color)] md:hidden z-10 safe-bottom">
        <div className="flex justify-around py-2 text-[var(--text-primary)] text-xs">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 hover:text-[var(--brand-primary)] transition">
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/invoices" className="flex flex-col items-center gap-1 hover:text-[var(--brand-primary)] transition">
            <FileText className="w-5 h-5" />
            <span>Invoices</span>
          </Link>
          <Link href="/clients" className="flex flex-col items-center gap-1 hover:text-[var(--brand-primary)] transition">
            <Users className="w-5 h-5" />
            <span>Clients</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 hover:text-[var(--brand-primary)] transition">
            <User className="w-5 h-5" />
            <span>Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
