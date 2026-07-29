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

type ExportFormat = 'us-iris-1099nec' | 'europe' | 'japan';

function digitsOnly(value: string | undefined | null): string {
  return (value || '').replace(/\D/g, '').slice(0, 9);
}

function csvCell(value: string | number | undefined | null): string {
  const s = value === undefined || value === null ? '' : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function money(n: number): string {
  return (Number(n) || 0).toFixed(2);
}

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem('ursadefi_company_profile') || '{}');
  } catch {
    return {};
  }
}

function downloadCsv(filename: string, headers: string[], rows: string[]) {
  // UTF-8 BOM helps Excel on Windows open Japanese headers correctly
  const csv = '\uFEFF' + [headers.map(csvCell).join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const IRIS_1099NEC_HEADERS = [
  'Form Type', 'Tax Year', 'Payer TIN Type', 'Payer Taxpayer ID Number', 'Payer Name Type',
  'Payer Business or Entity Name Line 1', 'Payer Business or Entity Name Line 2',
  'Payer First Name', 'Payer Middle Name', 'Payer Last Name (Surname)', 'Payer Suffix',
  'Payer Country', 'Payer Address Line 1', 'Payer Address Line 2', 'Payer City/Town',
  'Payer State/Province/Territory', 'Payer ZIP/Postal Code', 'Payer Phone Type', 'Payer Phone',
  'Payer Email Address', 'Recipient TIN Type', 'Recipient Taxpayer ID Number', 'Recipient Name Type',
  'Recipient Business or Entity Name Line 1', 'Recipient Business or Entity Name Line 2',
  'Recipient First Name', 'Recipient Middle Name', 'Recipient Last Name (Surname)', 'Recipient Suffix',
  'Recipient Country', 'Recipient Address Line 1', 'Recipient Address Line 2', 'Recipient City/Town',
  'Recipient State/Province/Territory', 'Recipient ZIP/Postal Code', 'Office Code', 'Form Account Number',
  '2nd TIN Notice', 'Box 1 - Nonemployee Compensation',
  'Box 2 - Payer made direct sales totaling $5000 or more of consumer products to a recipient for resale',
  'Box 4 - Federal income tax withheld', 'Combined Federal/State Filing',
  'State 1', 'State 1 - State Tax Withheld', 'State 1 - State/Payer state number', 'State 1 - State income',
  'State 1 - Local income tax withheld', 'State 1 - Special Data Entries',
  'State 2', 'State 2 - State Tax Withheld', 'State 2 - State/Payer state number', 'State 2 - State income',
  'State 2 - Local income tax withheld', 'State 2 - Special Data Entries',
];

const EU_LEDGER_HEADERS = [
  'Document Type', 'Invoice Number', 'Invoice Date', 'Tax Year',
  'Supplier Name', 'Supplier Tax ID / VAT', 'Supplier Country', 'Supplier Address',
  'Customer Name', 'Customer Country', 'Description', 'Currency',
  'Net Amount', 'VAT Rate %', 'VAT Amount', 'Gross Amount',
  'Amount XRP', 'Payment Status', 'Due Date', 'Settlement Reference',
];

/** Japan qualified-invoice oriented ledger (インボイス制度-friendly) */
const JP_LEDGER_HEADERS = [
  'Invoice Number',
  'Transaction Date',
  'Tax Year',
  'Issuer Name',
  'Qualified Invoice Registration No.',
  'Counterparty Name',
  'Description',
  'Currency',
  'Amount excl. tax',
  'Consumption Tax Rate %',
  'Consumption Tax Amount',
  'Amount incl. tax',
  'Amount XRP',
  'Payment Status',
  'Due Date',
  'Settlement Reference',
];

export default function ReportsPage() {
  const { wallet, isConnected } = useWallet();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [exportFormat, setExportFormat] = useState<ExportFormat>('us-iris-1099nec');

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

  const yearInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (!inv.created_at) return false;
      return new Date(inv.created_at).getFullYear() === year;
    });
  }, [invoices, year]);

  const paidYearInvoices = useMemo(
    () => yearInvoices.filter(i => i.status === 'paid'),
    [yearInvoices]
  );

  const stats = useMemo(() => {
    const totalIncome = yearInvoices.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
    const totalXrp = yearInvoices.reduce((sum, i) => sum + (Number(i.xrpAmount) || 0), 0);
    const paid = paidYearInvoices;
    const draft = yearInvoices.filter(i => i.status === 'draft' || !i.status);
    const paidIncome = paid.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
    return { totalIncome, totalXrp, count: yearInvoices.length, paidCount: paid.length, draftCount: draft.length, paidIncome };
  }, [yearInvoices, paidYearInvoices]);

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

  const recipientTotals = useMemo(() => {
    const map = new Map<string, { name: string; total: number; account: string }>();
    paidYearInvoices.forEach(inv => {
      const name = (inv.to || 'Unknown').trim();
      const key = name.toLowerCase();
      const prev = map.get(key) || { name, total: 0, account: inv.id || '' };
      prev.total += Number(inv.total) || 0;
      map.set(key, prev);
    });
    return Array.from(map.values()).filter(r => r.total > 0);
  }, [paidYearInvoices]);

  const exportUsIris = () => {
    if (recipientTotals.length === 0) {
      alert('No paid invoices for this year. Mark invoices as Paid before exporting IRIS 1099-NEC.');
      return;
    }
    const profile = loadProfile();
    const payerTin = digitsOnly(profile.ein);
    const payerName = (profile.companyName || '').slice(0, 40);
    const payerPhone = (profile.phone || '').replace(/[^0-9+\\-() ]/g, '').slice(0, 20);
    const payerEmail = (profile.email || '').slice(0, 75);
    let payerCity = '', payerState = '', payerZip = '';
    const csz = (profile.cityStateZip || '').trim();
    if (csz) {
      const m = csz.match(/^(.+?),\\s*([A-Za-z]{2})\\s+(\\d{5}(?:-\\d{4})?)$/);
      if (m) { payerCity = m[1].trim(); payerState = m[2].toUpperCase(); payerZip = m[3]; }
      else payerCity = csz;
    }
    const rows = recipientTotals.map((rec, idx) => {
      const cells = [
        '1099-NEC', String(year), payerTin.length === 9 ? 'EIN' : '', payerTin, 'Business',
        payerName, '', '', '', '', '', 'US', (profile.address || '').slice(0, 40), '',
        payerCity.slice(0, 40), payerState, payerZip, payerPhone ? 'Daytime' : '', payerPhone, payerEmail,
        '', '', 'Business', rec.name.slice(0, 40), '', '', '', '', '', 'US',
        '', '', '', '', '', '', (rec.account || `UD-${idx + 1}`).slice(0, 20), 'N',
        money(rec.total), 'N', '', 'N',
        '', '', '', '', '', '', '', '', '', '', '', '',
      ];
      return cells.map(csvCell).join(',');
    });
    for (let i = 0; i < rows.length; i += 100) {
      const chunk = rows.slice(i, i + 100);
      const suffix = rows.length > 100 ? `_part${Math.floor(i / 100) + 1}` : '';
      downloadCsv(`IRIS-1099-NEC-${year}${suffix}.csv`, IRIS_1099NEC_HEADERS, chunk);
    }
  };

  const exportEurope = () => {
    if (yearInvoices.length === 0) {
      alert('No invoices for this year to export.');
      return;
    }
    const profile = loadProfile();
    const supplierName = profile.companyName || '';
    const supplierTaxId = profile.ein || '';
    const supplierCountry = (profile.country || 'US').slice(0, 2).toUpperCase();
    const supplierAddress = [profile.address, profile.cityStateZip].filter(Boolean).join(', ');
    const rows = yearInvoices.map((inv) => {
      const gross = Number(inv.total) || 0;
      const invDate = inv.created_at ? new Date(inv.created_at).toISOString().slice(0, 10) : '';
      const cells = [
        'INVOICE', inv.id || '', invDate, String(year), supplierName, supplierTaxId,
        supplierCountry, supplierAddress, inv.to || '', '', inv.description || '', 'USD',
        money(gross), money(0), money(0), money(gross),
        money(Number(inv.xrpAmount) || 0), (inv.status || 'draft').toUpperCase(),
        inv.dueDate || '', inv.receiver || '',
      ];
      return cells.map(csvCell).join(',');
    });
    downloadCsv(`EU-Invoice-Ledger-${year}.csv`, EU_LEDGER_HEADERS, rows);
  };

  const exportJapan = () => {
    if (yearInvoices.length === 0) {
      alert('No invoices for this year to export.');
      return;
    }
    const profile = loadProfile();
    const issuerName = profile.companyName || '';
    // Registration number left blank unless user later stores a JP T-number on profile
    const registrationNo = '';
    const rows = yearInvoices.map((inv) => {
      const gross = Number(inv.total) || 0;
      // Consumption tax not stored — rate 0; accountant adjusts to 10% or 8%
      const taxRate = 0;
      const taxAmount = 0;
      const exclTax = gross;
      const invDate = inv.created_at ? new Date(inv.created_at).toISOString().slice(0, 10) : '';
      const cells = [
        inv.id || '',
        invDate,
        String(year),
        issuerName,
        registrationNo,
        inv.to || '',
        inv.description || '',
        'USD',
        money(exclTax),
        money(taxRate),
        money(taxAmount),
        money(gross),
        money(Number(inv.xrpAmount) || 0),
        (inv.status || 'draft').toUpperCase(),
        inv.dueDate || '',
        inv.receiver || '',
      ];
      return cells.map(csvCell).join(',');
    });
    downloadCsv(`JP-Invoice-Ledger-${year}.csv`, JP_LEDGER_HEADERS, rows);
  };

  const handleExportCSV = () => {
    if (exportFormat === 'japan') return exportJapan();
    if (exportFormat === 'europe') return exportEurope();
    return exportUsIris();
  };

  const handlePrintReport = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const profile = loadProfile();
    const companyName = profile.companyName || 'Your Company';
    const ein = profile.ein || '—';
    const rowsHtml = yearInvoices.map(inv => `\n      <tr>\n        <td>${inv.id || ''}</td>\n        <td>${inv.created_at ? new Date(inv.created_at).toLocaleDateString() : ''}</td>\n        <td>${inv.to || ''}</td>\n        <td style=\"text-align:right\">$${Number(inv.total || 0).toFixed(2)}</td>\n        <td style=\"text-align:right\">${Number(inv.xrpAmount || 0).toFixed(4)}</td>\n        <td>${inv.status || 'draft'}</td>\n      </tr>`).join('');
    win.document.write(`<!DOCTYPE html><html><head><title>Tax Report ${year}</title>\n<style>body{font-family:system-ui;padding:40px}table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:8px;border-bottom:1px solid #eee;text-align:left}th{background:#f8f8f8}</style>\n</head><body>\n<h1>Income & Tax Report – ${year}</h1>\n<p><strong>${companyName}</strong><br>EIN: ${ein}</p>\n<table><thead><tr><th>Invoice ID</th><th>Date</th><th>Client</th><th>USD</th><th>XRP</th><th>Status</th></tr></thead>\n<tbody>${rowsHtml || '<tr><td colspan=\"6\">No invoices</td></tr>'}</tbody></table>\n<script>window.onload=()=>setTimeout(()=>window.print(),300)</script>\n</body></html>`);
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
              <p className="text-[var(--text-secondary)] mt-1">Tax-ready reports — US · Europe · Japan</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--brand-primary)]"
              >
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--brand-primary)]"
              >
                <option value="us-iris-1099nec">United States — IRIS 1099-NEC</option>
                <option value="europe">Europe — Invoice Ledger</option>
                <option value="japan">Japan — Invoice Ledger</option>
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
                Export CSV
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-[var(--text-secondary)]">Loading report data...</div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm mb-2">
                    <DollarSign className="w-4 h-4" /> Total Income (USD)
                  </div>
                  <p className="text-2xl font-bold">
                    ${stats.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm mb-2">
                    <TrendingUp className="w-4 h-4" /> Total XRP
                  </div>
                  <p className="text-2xl font-bold">{stats.totalXrp.toFixed(2)}</p>
                </div>
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm mb-2">
                    <FileText className="w-4 h-4" /> Invoices
                  </div>
                  <p className="text-2xl font-bold">{stats.count}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{stats.paidCount} paid · {stats.draftCount} draft</p>
                </div>
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm mb-2">
                    <Calendar className="w-4 h-4" /> Paid Income
                  </div>
                  <p className="text-2xl font-bold text-emerald-500">
                    ${stats.paidIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

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
                          title={`${m.label}: $${m.total.toFixed(2)}`}
                        />
                        <div className="text-xs text-[var(--text-secondary)]">{m.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
                <h3 className="font-semibold mb-2">Export formats & regional rules</h3>
                <div className="space-y-5 text-sm text-[var(--text-secondary)]">
                  <div>
                    <p className="font-medium text-[var(--text-primary)] mb-1">United States — Form 1099-NEC (IRIS)</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong className="text-[var(--text-primary)]">Who files:</strong> the <em>payer</em> of nonemployee compensation
                        (trade or business payments to independent contractors), not the service provider reporting their own income.
                      </li>
                      <li>
                        <strong className="text-[var(--text-primary)]">Threshold:</strong> generally $600 or more for payments in calendar year 2025;
                        for tax years beginning after 2025 (payments in 2026+), the federal threshold is $2,000 (inflation-adjusted later).
                        Backup withholding, if required, is still reported even below the threshold.
                      </li>
                      <li>
                        <strong className="text-[var(--text-primary)]">E-file:</strong> if you file 10 or more information returns in total (all form types combined),
                        you must e-file. Use the IRS Information Returns Intake System (IRIS).
                      </li>
                      <li>
                        This CSV is a helper template: one row per payee, Box 1 = sum of <strong>paid</strong> invoices to that name.
                        Your profile is treated as the payer. Collect recipient TINs on Form W-9 and complete address/TIN fields before any IRS upload.
                        It is not a finished filing.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)] mb-1">Europe — Invoice / VAT ledger</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        There is no single “EU tax return” CSV. Member states apply the EU VAT Directive with local rules;
                        B2B e-invoicing mandates are expanding country by country.
                      </li>
                      <li>
                        Full VAT invoices generally need: unique sequential number, issue date, supplier name/address and VAT ID,
                        customer name/address (and customer VAT ID when the customer is liable, e.g. reverse charge),
                        description of supply, taxable amount, VAT rate(s), VAT amount, and total.
                      </li>
                      <li>
                        This export is a line-item bookkeeping ledger (supplier/customer, net/VAT/gross, currency, status, XRPL ref).
                        VAT rate defaults to 0% — set the correct rate and VAT amount with your accountant. Not a national filing format.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)] mb-1">Japan — Qualified invoice ledger (インボイス制度)</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Under the Qualified Invoice System (適格請求書等保存方式, in force since 1 Oct 2023), buyers generally need a
                        <em>qualified invoice</em> from a registered issuer to claim full consumption-tax input credit.
                      </li>
                      <li>
                        Registration number format: <strong className="text-[var(--text-primary)]">T</strong> + 13 digits
                        (issued by the National Tax Agency after registration as a 適格請求書発行事業者).
                      </li>
                      <li>
                        Standard consumption tax rate is <strong className="text-[var(--text-primary)]">10%</strong>; reduced rate
                        <strong className="text-[var(--text-primary)]">8%</strong> applies to certain items (e.g. food). Qualified invoices must break amounts
                        and tax by rate and show the issuer’s registration number, transaction date, description, and counterparty as required.
                      </li>
                      <li>
                        This CSV is oriented to that structure (issuer, registration-number field, excl./tax/incl., XRP settlement).
                        Rate defaults to 0% until you set 10% or 8%. UTF-8 BOM included for Excel. Not a substitute for official e-Tax filings.
                      </li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-4">
                  Not tax advice. Rules change; confirm thresholds, e-file duties, and local invoice mandates with your accountant or tax authority before filing.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
