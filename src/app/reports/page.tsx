'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@/context/WalletContext';
import Link from 'next/link';
import LeftSidebar from '@/components/layout/LeftSidebar';
import { Invoice } from '@/types';
import {
  BarChart3, Download, FileText, DollarSign, TrendingUp,
  Calendar, Printer
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase';

export default function ReportsPage() {
  const { wallet, isConnected } = useWallet();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  const loadInvoices = async () => {
    setLoading(true);
    let all: Invoice[] = [];

    try {
      const local = JSON.parse(localStorage.getItem('invoices') || '[]');
      all = [...local];
    } catch {}

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
            total: Number(row.total) || 0,
            xrpAmount: Number(row.xrp_amount || row.xrpAmount) || 0,
            receiver: row.receiver || '',
            dueDate: row.due_date || row.dueDate || '',
            description: row.description || '',
            status: row.status || 'draft',
            created_at: row.created_at,
            user_id: row.wallet_address,
          }));

          const supabaseIds = new Set(mapped.map(i => i.id));
          const localOnly = all.filter(i => !supabaseIds.has(i.id));
          all = [...mapped, ...localOnly];
        }
      } catch (err) {
        console.warn('Supabase fetch failed, using local only', err);
      }
    }

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

  // Filter by selected year
  const yearInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (!inv.created_at) return false;
      return new Date(inv.created_at).getFullYear() === year;
    });
  }, [invoices, year]);

  // Summary stats
  const stats = useMemo(() => {
    const totalIncome = yearInvoices.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
    const totalXrp = yearInvoices.reduce((sum, i) => sum + (Number(i.xrpAmount) || 0), 0);
    const paid = yearInvoices.filter(i => i.status === 'paid');
    const draft = yearInvoices.filter(i => i.status === 'draft' || !i.status);
    const paidIncome = paid.reduce((sum, i) => sum + (Number(i.total) || 0), 0);

    return {
      totalIncome,
      totalXrp,
      count: yearInvoices.length,
      paidCount: paid.length,
      draftCount: draft.length,
      paidIncome,
    };
  }, [yearInvoices]);

  // Monthly trend for chart
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i,
      label: new Date(year, i, 1).toLocaleString('en-US', { month: 'short' }),
      total: 0,
      count: 0,
    }));

    yearInvoices.forEach(inv => {
      if (!inv.created_at) return;
      const m = new Date(inv.created_at).getMonth();
      months[m].total += Number(inv.total) || 0;
      months[m].count += 1;
    });

    return months;
  }, [yearInvoices, year]);

  const maxMonthTotal = Math.max(...monthlyData.map(m => m.total), 1);

  // Export CSV for IRIS / Accountant
  const handleExportCSV = () => {
    if (yearInvoices.length === 0) {
      alert('No invoices for this year to export');
      return;
    }

    const headers = [
      'Invoice ID',
      'Date',
      'Client / To',
      'Description',
      'Amount USD',
      'Amount XRP',
      'Status',
      'Due Date',
      'Receiver Wallet',
    ];

    const rows = yearInvoices.map(inv => [
      inv.id || '',
      inv.created_at ? new Date(inv.created_at).toISOString().slice(0, 10) : '',
      `"${(inv.to || '').replace(/"/g, '""')}"`,
      `"${(inv.description || '').replace(/"/g, '""')}"`,
      Number(inv.total || 0).toFixed(2),
      Number(inv.xrpAmount || 0).toFixed(6),
      inv.status || 'draft',
      inv.dueDate || '',
      inv.receiver || '',
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ursadefi_tax_report_${year}_IRIS.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Printable tax summary
  const handlePrintReport = () => {
    const win = window.open('', '_blank');
    if (!win) return;

    const profile = (() => {
      try {
        return JSON.parse(localStorage.getItem('ursadefi_company_profile') || '{}');
      } catch { return {}; }
    })();

    const companyName = profile.companyName || 'Your Company';
    const ein = profile.ein || '—';

    const rowsHtml = yearInvoices.map(inv => `
      <tr>
        <td>${inv.id || ''}</td>
        <td>${inv.created_at ? new Date(inv.created_at).toLocaleDateString() : ''}</td>
        <td>${inv.to || ''}</td>
        <td style="text-align:right">$${Number(inv.total || 0).toFixed(2)}</td>
        <td style="text-align:right">${Number(inv.xrpAmount || 0).toFixed(4)}</td>
        <td>${inv.status || 'draft'}</td>
      </tr>
    `).join('');

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Tax Report ${year} – ${companyName}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 40px; color: #111; }
    h1 { margin: 0 0 4px; }
    .meta { color: #555; font-size: 14px; margin-bottom: 24px; }
    .summary { display: flex; gap: 24px; margin-bottom: 28px; }
    .card { border: 1px solid #ddd; border-radius: 12px; padding: 16px 20px; min-width: 140px; }
    .card .label { font-size: 12px; color: #666; }
    .card .value { font-size: 22px; font-weight: 700; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 8px 10px; border-bottom: 1px solid #eee; text-align: left; }
    th { background: #f8f8f8; font-weight: 600; }
    .footer { margin-top: 32px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <h1>Income & Tax Report – ${year}</h1>
  <div class="meta">
    <strong>${companyName}</strong><br>
    EIN: ${ein}<br>
    Generated: ${new Date().toLocaleString()} via UrsaDeFi
  </div>

  <div class="summary">
    <div class="card"><div class="label">Total Income (USD)</div><div class="value">$${stats.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
    <div class="card"><div class="label">Total XRP</div><div class="value">${stats.totalXrp.toFixed(2)}</div></div>
    <div class="card"><div class="label">Invoices</div><div class="value">${stats.count}</div></div>
    <div class="card"><div class="label">Paid Income</div><div class="value">$${stats.paidIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Invoice ID</th>
        <th>Date</th>
        <th>Client</th>
        <th style="text-align:right">USD</th>
        <th style="text-align:right">XRP</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="6">No invoices for this year</td></tr>'}
    </tbody>
  </table>

  <div class="footer">
    This report is generated by UrsaDeFi for tax and accounting purposes. Not financial or tax advice.
    Please consult your accountant / tax professional. Data as of ${new Date().toLocaleDateString()}.
  </div>

  <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
</body>
</html>`);
    win.document.close();
  };

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    invoices.forEach(inv => {
      if (inv.created_at) years.add(new Date(inv.created_at).getFullYear());
    });
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [invoices]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">Please connect your wallet to view reports.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-full text-sm font-medium transition">
            Connect Wallet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="w-72 border-r border-[var(--border-color)] hidden lg:block flex-shrink-0">
        <LeftSidebar />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
              <p className="text-[var(--text-secondary)] mt-1">Tax-ready income reports & IRIS CSV export</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--brand-primary)]"
              >
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              <button
                onClick={handlePrintReport}
                className="flex items-center gap-2 px-4 py-2.5 border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] rounded-full text-sm transition"
              >
                <Printer className="w-4 h-4" />
                Print Report
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-full text-sm font-medium transition"
              >
                <Download className="w-4 h-4" />
                Export CSV (IRIS)
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-[var(--text-secondary)]">Loading report data...</div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm mb-2">
                    <DollarSign className="w-4 h-4" />
                    Total Income (USD)
                  </div>
                  <p className="text-2xl font-bold">
                    ${stats.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm mb-2">
                    <TrendingUp className="w-4 h-4" />
                    Total XRP
                  </div>
                  <p className="text-2xl font-bold">{stats.totalXrp.toFixed(2)}</p>
                </div>

                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm mb-2">
                    <FileText className="w-4 h-4" />
                    Invoices
                  </div>
                  <p className="text-2xl font-bold">{stats.count}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {stats.paidCount} paid · {stats.draftCount} draft
                  </p>
                </div>

                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm mb-2">
                    <Calendar className="w-4 h-4" />
                    Paid Income
                  </div>
                  <p className="text-2xl font-bold text-emerald-500">
                    ${stats.paidIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Income Trend Chart */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5 text-[var(--brand-primary)]" />
                  <h2 className="font-semibold text-lg">Income Trend – {year}</h2>
                </div>

                <div className="flex items-end gap-2 h-48">
                  {monthlyData.map((m) => {
                    const heightPct = (m.total / maxMonthTotal) * 100;
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <div className="text-[10px] text-[var(--text-muted)] tabular-nums">
                          {m.total > 0 ? `$${m.total >= 1000 ? (m.total / 1000).toFixed(1) + 'k' : m.total.toFixed(0)}` : ''}
                        </div>
                        <div
                          className="w-full rounded-t-md bg-[var(--brand-primary)] transition-all duration-300 min-h-[4px]"
                          style={{
                            height: `${Math.max(heightPct, m.total > 0 ? 4 : 2)}%`,
                            opacity: m.total > 0 ? 1 : 0.25,
                          }}
                          title={`${m.label}: $${m.total.toFixed(2)} (${m.count} invoices)`}
                        />
                        <div className="text-xs text-[var(--text-secondary)]">{m.label}</div>
                      </div>
                    );
                  })}
                </div>

                {stats.count === 0 && (
                  <p className="text-center text-sm text-[var(--text-muted)] mt-4">
                    No invoice data for {year}. Create invoices to see the trend.
                  </p>
                )}
              </div>

              {/* Accountant / IRIS note */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
                <h3 className="font-semibold mb-2">For your accountant / IRIS</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  Use <strong>Export CSV (IRIS)</strong> to download a clean CSV of all invoices for {year}.
                  This file is designed for easy import into tax software and for sending to your CPA.
                  Use <strong>Print Report</strong> for a human-readable summary with company info and EIN.
                </p>
                <ul className="text-sm text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                  <li>CSV includes: Invoice ID, Date, Client, Description, USD, XRP, Status, Due Date, Receiver Wallet</li>
                  <li>Print report pulls your Company Profile (name + EIN) automatically</li>
                  <li>All amounts are based on invoices you created in UrsaDeFi</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
