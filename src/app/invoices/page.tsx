'use client';

import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@/context/WalletContext';
import Link from 'next/link';
import LeftSidebar from '@/components/layout/LeftSidebar';
import BrowserInvoicePDF from '@/components/invoice/BrowserInvoicePDF';
import { Invoice } from '@/types';
import {
  FileText, Search, Plus, Trash2, Home, Users, User,
  CheckCircle2, Bell, X, CalendarPlus, DollarSign, Radar
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase';
import { isDemoWallet } from '@/lib/demo';
import { calcPlatformFee } from '@/lib/constants';
import { isPaidFeeDue, isSettled, statusLabel } from '@/lib/invoice-status';

type InvoiceReminder = {
  invoiceId: string;
  remindAt: string;
  note?: string;
  client?: string;
};

const REMINDERS_KEY = 'ursadefi_invoice_reminders';

function loadReminders(): InvoiceReminder[] {
  try {
    return JSON.parse(localStorage.getItem(REMINDERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveReminders(list: InvoiceReminder[]) {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(list));
}

function googleCalendarUrl(inv: Invoice, remindAt: string, note: string) {
  const title = encodeURIComponent(`Follow up: Invoice ${inv.id} — ${inv.to || 'Client'}`);
  const details = encodeURIComponent(
    `UrsaDeFi reminder\nInvoice: ${inv.id}\nAmount: $${Number(inv.total).toFixed(2)} (≈ ${Number(inv.xrpAmount).toFixed(6)} XRP)\n${note || ''}`
  );
  const day = remindAt.replace(/-/g, '');
  const dates = `${day}/${day}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
}

export default function InvoicesPage() {
  const { wallet, isConnected } = useWallet();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reminders, setReminders] = useState<InvoiceReminder[]>([]);
  const [reminderFor, setReminderFor] = useState<Invoice | null>(null);
  const [remindDate, setRemindDate] = useState('');
  const [remindNote, setRemindNote] = useState('');
  const [confirmPaid, setConfirmPaid] = useState<Invoice | null>(null);
  const [feeFor, setFeeFor] = useState<Invoice | null>(null);
  const [feeBusy, setFeeBusy] = useState(false);
  const [feeMsg, setFeeMsg] = useState<string | null>(null);
  const [feeUuid, setFeeUuid] = useState<string | null>(null);
  const feePollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demo = isDemoWallet(wallet?.address);

  useEffect(() => {
    setReminders(loadReminders());
    return () => {
      if (feePollRef.current) clearTimeout(feePollRef.current);
    };
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    let all: Invoice[] = [];

    try {
      const local = JSON.parse(localStorage.getItem('invoices') || '[]');
      all = [...local];
    } catch {}

    if (wallet?.address && !demo) {
      try {
        const { data, error } = await supabaseBrowser
          .from('invoices')
          .select('*')
          .eq('wallet_address', wallet.address)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const localById = new Map(all.map((i: any) => [i.id, i]));
          const mapped: Invoice[] = data.map((row: any) => {
            const localCopy: any = localById.get(row.id) || {};
            return {
              id: row.id,
              from: row.from_name || row.from || '',
              to: row.to_name || row.to || '',
              items: row.items || [{ desc: row.description || '', qty: 1, price: row.total || 0 }],
              total: row.total || 0,
              subtotal: localCopy.subtotal ?? row.subtotal,
              platformFee: localCopy.platformFee ?? row.platform_fee,
              xrpAmount: localCopy.xrpAmount ?? row.xrp_amount ?? row.xrpAmount ?? 0,
              receiver: row.receiver || localCopy.receiver || '',
              dueDate: row.due_date || row.dueDate || '',
              description: row.description || '',
              status: row.status || 'draft',
              created_at: row.created_at,
              user_id: row.wallet_address,
              paymentUri: localCopy.paymentUri || row.payment_uri || undefined,
              settlement_rail: localCopy.settlement_rail || row.settlement_rail,
              payment_tx_hash: localCopy.payment_tx_hash || row.payment_tx_hash,
              fee_tx_hash: localCopy.fee_tx_hash || row.fee_tx_hash,
            } as Invoice;
          });

          const supabaseIds = new Set(mapped.map(i => i.id));
          const localOnly = all.filter(i => !supabaseIds.has(i.id));
          all = [...mapped, ...localOnly];
        }
      } catch (err) {
        console.warn('Supabase invoices fetch failed, using local only', err);
      }
    }

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
  }, [wallet?.address, isConnected, demo]);

  const filtered = invoices.filter(inv => {
    const term = searchTerm.toLowerCase();
    return (
      inv.id?.toLowerCase().includes(term) ||
      inv.to?.toLowerCase().includes(term) ||
      inv.from?.toLowerCase().includes(term) ||
      inv.description?.toLowerCase().includes(term)
    );
  });

  const reminderForId = (id: string) => reminders.find(r => r.invoiceId === id);

  const openReminderModal = (inv: Invoice) => {
    const existing = reminderForId(inv.id);
    const defaultDate = existing?.remindAt
      || inv.dueDate
      || new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
    setRemindDate(defaultDate);
    setRemindNote(existing?.note || '');
    setReminderFor(inv);
  };

  const saveReminder = () => {
    if (!reminderFor || !remindDate) return;
    const next = reminders.filter(r => r.invoiceId !== reminderFor.id);
    next.push({
      invoiceId: reminderFor.id,
      remindAt: remindDate,
      note: remindNote.trim(),
      client: reminderFor.to || '',
    });
    saveReminders(next);
    setReminders(next);
    setReminderFor(null);
  };

  const clearReminder = (invoiceId: string) => {
    const next = reminders.filter(r => r.invoiceId !== invoiceId);
    saveReminders(next);
    setReminders(next);
  };

  const updateLocalInvoice = (id: string, patch: Partial<Invoice>) => {
    try {
      const existing: Invoice[] = JSON.parse(localStorage.getItem('invoices') || '[]');
      const next = existing.map(i => (i.id === id ? { ...i, ...patch } : i));
      if (!existing.find(i => i.id === id)) {
        const fromState = invoices.find(i => i.id === id);
        if (fromState) next.unshift({ ...fromState, ...patch });
      }
      localStorage.setItem('invoices', JSON.stringify(next));
    } catch {}
  };

  const persistStatus = async (invoice: Invoice, status: string, extra: Partial<Invoice> = {}) => {
    updateLocalInvoice(invoice.id, { status, ...extra });
    setInvoices(prev => prev.map(i => (i.id === invoice.id ? { ...i, status, ...extra } : i)));
    if (selectedInvoice?.id === invoice.id) setSelectedInvoice({ ...invoice, status, ...extra });
    if (!demo) {
      try {
        await supabaseBrowser.from('invoices').update({ status, ...extra }).eq('id', invoice.id);
      } catch (err) {
        console.warn('Status cloud update failed (local updated)', err);
      }
    }
    window.dispatchEvent(new Event('invoices-updated'));
  };

  /** Scan ledger for inbound XRP ≈ locked amount */
  const handleDetectPayment = async (invoice: Invoice) => {
    if (!invoice.receiver || !Number(invoice.xrpAmount)) {
      alert('Invoice needs receiver wallet and locked XRP amount.');
      return;
    }
    setUpdatingId(invoice.id);
    try {
      const res = await fetch('/api/payments/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver: invoice.receiver,
          xrpAmount: Number(invoice.xrpAmount),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Detect failed');
      if (data.detected && data.match) {
        await persistStatus(invoice, 'paid_fee_due', {
          payment_tx_hash: data.match.hash,
          settlement_rail: 'xrpl_xrp',
        });
        clearReminder(invoice.id);
        setFeeFor({ ...invoice, status: 'paid_fee_due', payment_tx_hash: data.match.hash });
      } else {
        alert('No matching inbound XRP payment found yet. Client can still pay; or Mark Paid manually.');
      }
    } catch (e: any) {
      alert(e.message || 'Detection failed');
    }
    setUpdatingId(null);
  };

  const handleMarkPaid = async (invoice: Invoice) => {
    setConfirmPaid(null);
    if (isSettled(invoice.status)) return;
    setUpdatingId(invoice.id);
    await persistStatus(invoice, 'paid_fee_due', {
      settlement_rail: invoice.settlement_rail || 'external',
    });
    clearReminder(invoice.id);
    setUpdatingId(null);
    setFeeFor({ ...invoice, status: 'paid_fee_due' });
  };

  const pollFeeUntilSettled = async (uuid: string, invoice: Invoice) => {
    let attempts = 0;
    const max = 60;

    const tick = async () => {
      attempts += 1;
      try {
        const res = await fetch('/api/xaman/resolve-fee', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uuid, invoiceId: invoice.id }),
        });
        const data = await res.json();
        if (data.expired) {
          setFeeMsg('Fee payload expired — try Pay fee again');
          setFeeBusy(false);
          return;
        }
        if (data.settled || data.signed) {
          setFeeMsg('Fee confirmed — settling…');
          await persistStatus(invoice, 'settled', {
            fee_tx_hash: data.txid || undefined,
          });
          setFeeMsg(null);
          setFeeFor(null);
          setFeeUuid(null);
          setFeeBusy(false);
          return;
        }
        setFeeMsg(`Waiting for Xaman signature… (${attempts})`);
      } catch {
        setFeeMsg('Checking fee status…');
      }
      if (attempts >= max) {
        setFeeMsg('Timed out — use Check fee status after signing');
        setFeeBusy(false);
        return;
      }
      feePollRef.current = setTimeout(tick, 2500);
    };

    feePollRef.current = setTimeout(tick, 2000);
  };

  const handlePayPlatformFee = async (invoice: Invoice) => {
    const feeUsd = calcPlatformFee(Number(invoice.subtotal) || Number(invoice.total) || 0);

    if (demo) {
      setFeeBusy(true);
      setFeeMsg('Demo: settling without on-chain fee…');
      await persistStatus(invoice, 'settled');
      setFeeMsg(null);
      setFeeFor(null);
      setFeeBusy(false);
      return;
    }

    setFeeBusy(true);
    setFeeMsg('Creating platform fee payment…');
    try {
      const res = await fetch('/api/xaman/pay-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create fee payment');
      if (!data.next || !data.uuid) throw new Error('No Xaman link returned');

      setFeeUuid(data.uuid);
      setFeeMsg(`Approve $${data.feeUsd?.toFixed(2) || feeUsd.toFixed(2)} in Xaman…`);
      window.open(data.next, '_blank');
      await pollFeeUntilSettled(data.uuid, invoice);
    } catch (e: any) {
      setFeeMsg(e.message || 'Fee payment failed');
      setFeeBusy(false);
    }
  };

  /** Re-check fee payload after user signs */
  const handleCheckFeeStatus = async (invoice: Invoice) => {
    if (!feeUuid) {
      setFeeMsg('Pay fee in Xaman first to start verification');
      return;
    }
    setFeeBusy(true);
    setFeeMsg('Verifying fee on ledger…');
    try {
      const res = await fetch('/api/xaman/resolve-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: feeUuid, invoiceId: invoice.id }),
      });
      const data = await res.json();
      if (data.settled || data.signed) {
        await persistStatus(invoice, 'settled', { fee_tx_hash: data.txid || undefined });
        setFeeFor(null);
        setFeeUuid(null);
        setFeeMsg(null);
      } else if (data.expired) {
        setFeeMsg('Expired — pay fee again');
      } else {
        setFeeMsg('Not signed yet — approve in Xaman');
      }
    } catch (e: any) {
      setFeeMsg(e.message || 'Verify failed');
    }
    setFeeBusy(false);
  };

  const handleDelete = async (invoice: Invoice) => {
    if (!confirm(`Delete invoice ${invoice.id}?`)) return;
    const existing = JSON.parse(localStorage.getItem('invoices') || '[]');
    localStorage.setItem('invoices', JSON.stringify(existing.filter((i: Invoice) => i.id !== invoice.id)));
    if (!demo) {
      try {
        await supabaseBrowser.from('invoices').delete().eq('id', invoice.id);
      } catch {}
    }
    clearReminder(invoice.id);
    setInvoices(prev => prev.filter(i => i.id !== invoice.id));
    if (selectedInvoice?.id === invoice.id) setSelectedInvoice(null);
    window.dispatchEvent(new Event('invoices-updated'));
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

      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
              <p className="text-[var(--text-secondary)] mt-1">
                {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} total
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Detect XRPL pay or Mark Paid → fee → settled unlocks CSV & mint
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
              {filtered.map((inv) => {
                const settled = isSettled(inv.status);
                const feeDue = isPaidFeeDue(inv.status) && !settled;
                const isUpdating = updatingId === inv.id;
                const rem = reminderForId(inv.id);
                const feeUsd = calcPlatformFee(Number(inv.subtotal) || Number(inv.total) || 0);
                const label = statusLabel(inv.status);

                return (
                  <div
                    key={inv.id}
                    className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 hover:border-[var(--brand-primary)]/40 transition cursor-pointer"
                    onClick={() => setSelectedInvoice(selectedInvoice?.id === inv.id ? null : inv)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span className="font-mono text-sm text-[var(--brand-primary)]">{inv.id}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            settled
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : feeDue
                              ? 'bg-amber-500/15 text-amber-500'
                              : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                          }`}>
                            {label}
                          </span>
                          {inv.settlement_rail && (
                            <span className="text-[10px] text-[var(--text-muted)] uppercase">
                              {inv.settlement_rail.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg truncate">{inv.to || 'Unknown Client'}</h3>
                        <p className="text-sm text-[var(--text-secondary)] truncate mt-0.5">
                          {inv.description || inv.from || '—'}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                          <span className="font-semibold">${Number(inv.total).toFixed(2)}</span>
                          <span className="text-[var(--text-secondary)]">
                            ≈ {Number(inv.xrpAmount).toFixed(6)} XRP
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        {!settled && !feeDue && (
                          <>
                            <button
                              onClick={() => handleDetectPayment(inv)}
                              disabled={isUpdating}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[var(--border-color)] hover:bg-[var(--bg-primary)] rounded-full transition disabled:opacity-50"
                              title="Scan XRPL for matching inbound payment"
                            >
                              <Radar className="w-3.5 h-3.5" />
                              {isUpdating ? '…' : 'Detect pay'}
                            </button>
                            <button
                              onClick={() => setConfirmPaid(inv)}
                              disabled={isUpdating}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Mark Paid
                            </button>
                          </>
                        )}
                        {feeDue && (
                          <button
                            onClick={() => setFeeFor(inv)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white rounded-full transition"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            Pay fee ${feeUsd.toFixed(2)}
                          </button>
                        )}
                        {settled && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-500/15 text-emerald-500 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Settled
                          </span>
                        )}
                        <BrowserInvoicePDF invoice={inv} mode="open" />
                        <button
                          onClick={() => openReminderModal(inv)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[var(--border-color)] hover:bg-[var(--bg-primary)] rounded-full transition"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          Reminder
                        </button>
                        <button
                          onClick={() => handleDelete(inv)}
                          className="p-2 text-red-400 hover:bg-red-950/40 rounded-xl transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {selectedInvoice?.id === inv.id && (
                      <div className="mt-5 pt-5 border-t border-[var(--border-color)] grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-[var(--text-muted)] text-xs mb-1">Receiver</p>
                          <p className="font-mono text-xs break-all">{inv.receiver || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[var(--text-muted)] text-xs mb-1">Locked XRP</p>
                          <p className="font-mono text-xs">{Number(inv.xrpAmount).toFixed(6)} XRP</p>
                        </div>
                        {inv.payment_tx_hash && (
                          <div className="md:col-span-2 text-xs font-mono text-[var(--text-muted)]">
                            Payment tx: {inv.payment_tx_hash}
                          </div>
                        )}
                        {inv.fee_tx_hash && (
                          <div className="md:col-span-2 text-xs font-mono text-[var(--text-muted)]">
                            Fee tx: {inv.fee_tx_hash}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {confirmPaid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setConfirmPaid(null)}>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Client paid?</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Prefer <strong className="text-[var(--text-primary)]">Detect pay</strong> when they paid XRP on-ledger.
              Manual mark still works for X Money / external.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmPaid(null)} className="flex-1 py-2.5 rounded-full border border-[var(--border-color)] text-sm">Cancel</button>
              <button onClick={() => handleMarkPaid(confirmPaid)} className="flex-1 py-2.5 rounded-full bg-emerald-600 text-white text-sm font-medium">Yes, client paid</button>
            </div>
          </div>
        </div>
      )}

      {feeFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => !feeBusy && setFeeFor(null)}>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Platform fee required</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              Unlock CSV & mint for <span className="font-mono text-[var(--brand-primary)]">{feeFor.id}</span>
            </p>
            <p className="text-sm font-semibold mb-4">
              ${calcPlatformFee(Number(feeFor.subtotal) || Number(feeFor.total) || 0).toFixed(2)}
              <span className="text-[var(--text-muted)] font-normal"> · 0.15%</span>
            </p>
            {feeMsg && <p className="text-xs text-[var(--brand-primary)] mb-4 animate-pulse">{feeMsg}</p>}
            <div className="flex flex-col gap-2">
              <button onClick={() => handlePayPlatformFee(feeFor)} disabled={feeBusy} className="w-full py-2.5 rounded-full bg-[var(--brand-primary)] text-white text-sm font-medium disabled:opacity-50">
                {feeBusy ? 'Working…' : 'Pay fee in Xaman'}
              </button>
              <button onClick={() => handleCheckFeeStatus(feeFor)} disabled={feeBusy} className="w-full py-2.5 rounded-full border border-emerald-600/50 text-emerald-500 text-sm disabled:opacity-50">
                Check fee status
              </button>
              <button onClick={() => setFeeFor(null)} disabled={feeBusy} className="w-full py-2 text-xs text-[var(--text-muted)]">Later</button>
            </div>
          </div>
        </div>
      )}

      {reminderFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setReminderFor(null)}>
          <div className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Bell className="w-5 h-5" /> Set Reminder</h2>
              <button onClick={() => setReminderFor(null)}><X className="w-5 h-5" /></button>
            </div>
            <input type="date" value={remindDate} onChange={(e) => setRemindDate(e.target.value)} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm mb-4" />
            <input type="text" value={remindNote} onChange={(e) => setRemindNote(e.target.value)} placeholder="Note" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm mb-4" />
            <button onClick={saveReminder} disabled={!remindDate} className="w-full py-2.5 bg-[var(--brand-primary)] text-white rounded-full text-sm disabled:opacity-50">Save</button>
            <a href={remindDate ? googleCalendarUrl(reminderFor, remindDate, remindNote) : '#'} target="_blank" rel="noopener noreferrer" className="w-full mt-2 py-2.5 border border-[var(--border-color)] rounded-full text-sm flex items-center justify-center gap-2">
              <CalendarPlus className="w-4 h-4" /> Google Calendar
            </a>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-primary)] border-t border-[var(--border-color)] md:hidden z-10 safe-bottom">
        <div className="flex justify-around py-2 text-xs">
          <Link href="/dashboard" className="flex flex-col items-center gap-1"><Home className="w-5 h-5" /><span>Dashboard</span></Link>
          <Link href="/invoices" className="flex flex-col items-center gap-1"><FileText className="w-5 h-5" /><span>Invoices</span></Link>
          <Link href="/clients" className="flex flex-col items-center gap-1"><Users className="w-5 h-5" /><span>Clients</span></Link>
          <Link href="/profile" className="flex flex-col items-center gap-1"><User className="w-5 h-5" /><span>Profile</span></Link>
        </div>
      </div>
    </div>
  );
}
