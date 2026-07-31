'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@/context/WalletContext';
import Link from 'next/link';
import LeftSidebar from '@/components/layout/LeftSidebar';
import { Invoice } from '@/types';
import {
  BarChart3, Download, FileText, DollarSign, TrendingUp,
  Calendar, Printer, Receipt
} from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase';
import { isSettled } from '@/lib/invoice-status';

type ExportFormat = 'us-iris-1099nec' | 'europe' | 'japan';

type ExpenseRow = {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  miles?: number;
  ratePerMile?: number;
  created_at?: string;
};

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

function loadExpenses(): ExpenseRow[] {
  try {
    return JSON.parse(localStorage.getItem('ursadefi_expenses') || '[]');
  } catch {
    return [];
  }
}

function downloadCsv(filename: string, headers: string[], rows: string[]) {
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

const JP_LEDGER_HEADERS = [
  'Invoice Number', 'Transaction Date', 'Tax Year', 'Issuer Name',
  'Qualified Invoice Registration No.', 'Counterparty Name', 'Description', 'Currency',
  'Amount excl. tax', 'Consumption Tax Rate %', 'Consumption Tax Amount', 'Amount incl. tax',
  'Amount XRP', 'Payment Status', 'Due Date', 'Settlement Reference',
];

const COMBINED_HEADERS = [
  'Type', 'ID', 'Date', 'Tax Year', 'Category', 'Party / Description', 'Currency',
  'Amount USD', 'Miles', 'Rate Per Mile', 'Status / Notes',
];

const EXPENSE_HEADERS = [
  'Expense ID', 'Date', 'Tax Year', 'Category', 'Description', 'Amount USD', 'Miles', 'Rate Per Mile',
];

export default function ReportsPage() {
  const { wallet, isConnected } = useWallet();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
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
    setExpenses(loadExpenses());
    setLoading(false);
  };

  useEffect(() => {
    if (isConnected) loadInvoices();
    else setLoading(false);
    const handler = () => loadInvoices();
    window.addEventListener('invoices-updated', handler);
    window.addEventListener('expenses-updated', handler);
    return () => {
      window.removeEventListener('invoices-updated', handler);
      window.removeEventListener('expenses-updated', handler);
    };
  }, [wallet?.address, isConnected]);

  const yearInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (!inv.created_at) return false;
      return new Date(inv.created_at).getFullYear() === year;
    });
  }, [invoices, year]);

  const settledYearInvoices = useMemo(
    () => yearInvoices.filter(i => isSettled(i.status)),
    [yearInvoices]
  );

  const yearExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const y = e.date ? new Date(e.date + 'T12:00:00').getFullYear() : (e.created_at ? new Date(e.created_at).getFullYear() : 0);
      return y === year;
    });
  }, [expenses, year]);

  const expenseTotal = useMemo(
    () => yearExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0),
    [yearExpenses]
  );

  const stats = useMemo(() => {
    const totalIncome = yearInvoices.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
    const totalXrp = yearInvoices.reduce((sum, i) => sum + (Number(i.xrpAmount) || 0), 0);
    const settled = settledYearInvoices;
    const draft = yearInvoices.filter(i => i.status === 'draft' || !i.status);
    const settledIncome = settled.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
    return {
      totalIncome,
      totalXrp,
      count: yearInvoices.length,
      paidCount: settled.length,
      draftCount: draft.length,
      paidIncome: settledIncome,
    };
  }, [yearInvoices, settledYearInvoices]);

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
    settledYearInvoices.forEach(inv => {
      const name = (inv.to || 'Unknown').trim();
      const key = name.toLowerCase();
      const prev = map.get(key) || { name, total: 0, account: inv.id || '' };
      prev.total += Number(inv.total) || 0;
      map.set(key, prev);
    });
    return Array.from(map.values()).filter(r => r.total > 0);
  }, [settledYearInvoices]);

  const requireSettledOrAlert = (): boolean => {
    if (settledYearInvoices.length === 0) {
      alert(
        'No settled invoices for this year. Pay the platform fee (0.15%) on paid invoices to unlock tax CSV export. No monthly fee — fee only when paid.'
      );
      return false;
    }
    return true;
  };

  const exportUsIris = () => {
    if (!requireSettledOrAlert()) return;
    if (recipientTotals.length === 0) {
      alert('No settled invoices for this year.');
      return;
    }
    const profile = loadProfile();
    const payerTin = digitsOnly(profile.ein);
    const payerName = (profile.companyName || '').slice(0, 40);
    const payerPhone = (profile.phone || '').replace(/[^0-9+\-() ]/g, '').slice(0, 20);
    const payerEmail = (profile.email || '').slice(0, 75);
    let payerCity = '', payerState = '', payerZip = '';
    const csz = (profile.cityStateZip || '').trim();
    if (csz) {
      const m = csz.match(/^(.+?),\s*([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)$/);
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
    if (!requireSettledOrAlert()) return;
    const profile = loadProfile();
    const supplierName = profile.companyName || '';
    const supplierTaxId = profile.ein || '';
    const supplierCountry = (profile.country || 'US').slice(0, 2).toUpperCase();
    const supplierAddress = [profile.address, profile.cityStateZip].filter(Boolean).join(', ');
    const rows = settledYearInvoices.map((inv) => {
      const gross = Number(inv.total) || 0;
      const invDate = inv.created_at ? new Date(inv.created_at).toISOString().slice(0, 10) : '';
      const cells = [
        'INVOICE', inv.id || '', invDate, String(year), supplierName, supplierTaxId,
        supplierCountry, supplierAddress, inv.to || '', '', inv.description || '', 'USD',
        money(gross), money(0), money(0), money(gross),
        money(Number(inv.xrpAmount) || 0), (inv.status || 'settled').toUpperCase(),
        inv.dueDate || '', inv.receiver || '',
      ];
      return cells.map(csvCell).join(',');
    });
    downloadCsv(`EU-Invoice-Ledger-${year}.csv`, EU_LEDGER_HEADERS, rows);
  };

  const exportJapan = () => {
    if (!requireSettledOrAlert()) return;
    const profile = loadProfile();
    const issuerName = profile.companyName || '';
    const registrationNo = '';
    const rows = settledYearInvoices.map((inv) => {
      const gross = Number(inv.total) || 0;
      const invDate = inv.created_at ? new Date(inv.created_at).toISOString().slice(0, 10) : '';
      const cells = [
        inv.id || '', invDate, String(year), issuerName, registrationNo,
        inv.to || '', inv.description || '', 'USD',
        money(gross), money(0), money(0), money(gross),
        money(Number(inv.xrpAmount) || 0), (inv.status || 'settled').toUpperCase(),
        inv.dueDate || '', inv.receiver || '',
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

  /** Expenses only — always available (bookkeeping helper) */
  const handleExportExpenses = () => {
    if (yearExpenses.length === 0) {
      alert('No expenses for this year. Add mileage, food, or entertainment under Expenses.');
      return;
    }
    const rows = yearExpenses.map((e) =>
      [
        e.id,
        e.date || '',
        String(year),
        e.category || '',
        e.description || '',
        money(e.amount),
        e.miles != null ? String(e.miles) : '',
        e.ratePerMile != null ? money(e.ratePerMile) : '',
      ].map(csvCell).join(',')
    );
    downloadCsv(`Expenses-${year}.csv`, EXPENSE_HEADERS, rows);
  };

  /** Settled income + all expenses for the year in one bookkeeping file */
  const handleExportCombined = () => {
    const invRows = settledYearInvoices.map((inv) => {
      const d = inv.created_at ? new Date(inv.created_at).toISOString().slice(0, 10) : '';
      return [
        'INCOME',
        inv.id || '',
        d,
        String(year),
        'settled_invoice',
        inv.to || inv.description || '',
        'USD',
        money(inv.total),
        '',
        '',
        inv.status || 'settled',
      ].map(csvCell).join(',');
    });
    const expRows = yearExpenses.map((e) =>
      [
        'EXPENSE',
        e.id,
        e.date || '',
        String(year),
        e.category || '',
        e.description || '',
        'USD',
        money(e.amount),
        e.miles != null ? String(e.miles) : '',
        e.ratePerMile != null ? money(e.ratePerMile) : '',
        '',
      ].map(csvCell).join(',')
    );
    if (invRows.length === 0 && expRows.length === 0) {
      alert('Nothing to export for this year. Settle invoices and/or add expenses.');
      return;
    }
    downloadCsv(`Income-Expenses-${year}.csv`, COMBINED_HEADERS, [...invRows, ...expRows]);
  };

  const handlePrintReport = () => {
    if (!requireSettledOrAlert()) return;
    const win = window.open('', '_blank');
    if (!win) return;
    const profile = loadProfile();
    const companyName = profile.companyName || 'Your Company';
    const ein = profile.ein || '-';
    const rowsHtml = settledYearInvoices
      .map((inv) => {
        const id = inv.id || '';
        const date = inv.created_at ? new Date(inv.created_at).toLocaleDateString() : '';
        const to = inv.to || '';
        const usd = Number(inv.total || 0).toFixed(2);
        const xrp = Number(inv.xrpAmount || 0).toFixed(4);
        const status = inv.status || 'settled';
        return (
          '<tr>' +
          '<td>' + id + '</td>' +
          '<td>' + date + '</td>' +
          '<td>' + to + '</td>' +
          '<td style="text-align:right">$' + usd + '</td>' +
          '<td style="text-align:right">' + xrp + '</td>' +
          '<td>' + status + '</td>' +
          '</tr>'
        );
      })
      .join('');
    const expHtml = yearExpenses
      .map((e) =>
        '<tr><td>' +
        (e.category || '') +
        '</td><td>' +
        (e.date || '') +
        '</td><td>' +
        (e.description || '') +
        '</td><td style="text-align:right">$' +
        Number(e.amount || 0).toFixed(2) +
        '</td></tr>'
      )
      .join('');
    const bodyRows = rowsHtml || '<tr><td colspan="6">No settled invoices</td></tr>';
    const html =
      '<!DOCTYPE html><html><head><title>Tax Report ' + year + '</title>' +
      '<style>body{font-family:system-ui;padding:40px}table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px}th,td{padding:8px;border-bottom:1px solid #eee;text-align:left}th{background:#f8f8f8}</style>' +
      '</head><body>' +
      '<h1>Income & Expenses - ' + year + '</h1>' +
      '<p><strong>' + companyName + '</strong><br>EIN: ' + ein + '</p>' +
      '<h2>Settled income</h2>' +
      '<table><thead><tr><th>Invoice ID</th><th>Date</th><th>Client</th><th>USD</th><th>XRP</th><th>Status</th></tr></thead>' +
      '<tbody>' + bodyRows + '</tbody></table>' +
      '<h2>Expenses</h2>' +
      '<table><thead><tr><th>Category</th><th>Date</th><th>Description</th><th>USD</th></tr></thead>' +
      '<tbody>' +
      (expHtml || '<tr><td colspan="4">No expenses</td></tr>') +
      '</tbody></table>' +
      '<script>window.onload=function(){setTimeout(function(){window.print()},300)}</script>' +
      '</body></html>';
    win.document.write(html);
    win.document.close();
  };

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    invoices.forEach(inv => {
      if (inv.created_at) years.add(new Date(inv.created_at).getFullYear());
    });
    expenses.forEach((e) => {
      if (e.date) years.add(new Date(e.date + 'T12:00:00').getFullYear());
    });
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [invoices, expenses]);

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
              <p className="text-[var(--text-secondary)] mt-1">Tax-ready — settled income + expenses</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Invoice CSV requires <strong className="text-[var(--text-secondary)]">settled</strong>. Expenses always export.
              </p>
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
                Print
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-full text-sm font-medium transition"
              >
                <Download className="w-4 h-4" />
                Invoice CSV
              </button>

              <button
                onClick={handleExportExpenses}
                className="flex items-center gap-2 px-4 py-2.5 border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] rounded-full text-sm transition"
              >
                <Receipt className="w-4 h-4" />
                Expenses CSV
              </button>

              <button
                onClick={handleExportCombined}
                className="flex items-center gap-2 px-4 py-2.5 border border-emerald-600/40 text-emerald-500 hover:bg-emerald-950/20 rounded-full text-sm transition"
              >
                <Download className="w-4 h-4" />
                Income + Expenses
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-[var(--text-secondary)]">Loading report data...</div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm mb-2">
                    <DollarSign className="w-4 h-4" /> Total Income
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
                  <p className="text-xs text-[var(--text-muted)] mt-1">{stats.paidCount} settled · {stats.draftCount} draft</p>
                </div>
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm mb-2">
                    <Calendar className="w-4 h-4" /> Settled Income
                  </div>
                  <p className="text-2xl font-bold text-emerald-500">
                    ${stats.paidIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm mb-2">
                    <Receipt className="w-4 h-4" /> Expenses
                  </div>
                  <p className="text-2xl font-bold text-amber-500">
                    ${expenseTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{yearExpenses.length} entries</p>
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
                <h3 className="font-semibold mb-2">Exports</h3>
                <ul className="text-sm text-[var(--text-secondary)] space-y-2 list-disc pl-5">
                  <li><strong className="text-[var(--text-primary)]">Invoice CSV</strong> — settled invoices only (fee paid).</li>
                  <li><strong className="text-[var(--text-primary)]">Expenses CSV</strong> — mileage, food, entertainment, other for the year.</li>
                  <li><strong className="text-[var(--text-primary)]">Income + Expenses</strong> — one combined bookkeeping file for your accountant.</li>
                </ul>
                <p className="text-xs text-[var(--text-muted)] mt-4">
                  Not tax advice. Confirm deductible categories and rates with your accountant.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
