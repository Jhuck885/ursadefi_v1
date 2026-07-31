'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@/context/WalletContext';
import Link from 'next/link';
import LeftSidebar from '@/components/layout/LeftSidebar';
import { Plus, Trash2, Receipt } from 'lucide-react';
import { isDemoWallet } from '@/lib/demo';
import { getOfficialPreset, type MileageRegion, type DistanceUnit } from '@/lib/mileage-rates';

export type ExpenseCategory = 'mileage' | 'food' | 'entertainment' | 'other';
export type ExpenseRegion = MileageRegion;

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  distance?: number;
  distanceUnit?: DistanceUnit;
  ratePerUnit?: number;
  region?: ExpenseRegion;
  rateSource?: string;
  miles?: number;
  ratePerMile?: number;
  created_at: string;
}

const EXPENSES_KEY = 'ursadefi_expenses';

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'mileage', label: 'Travel / mileage' },
  { value: 'food', label: 'Food / meals' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' },
];

function loadExpenses(): Expense[] {
  try {
    return JSON.parse(localStorage.getItem(EXPENSES_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveExpenses(list: Expense[]) {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event('expenses-updated'));
}

function distanceLabel(e: Expense): string {
  const d = e.distance ?? e.miles;
  if (d == null) return '';
  const unit = e.distanceUnit || (e.miles != null ? 'mi' : 'km');
  const rate = e.ratePerUnit ?? e.ratePerMile;
  if (rate != null && rate > 0) return `${d} ${unit} × ${rate.toFixed(3)}/${unit}`;
  return `${d} ${unit}`;
}

export default function ExpensesPage() {
  const { isConnected, wallet } = useWallet();
  const demo = isDemoWallet(wallet?.address);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<ExpenseCategory>('mileage');
  const [region, setRegion] = useState<ExpenseRegion>('us');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [distance, setDistance] = useState('');
  const [ratePerUnit, setRatePerUnit] = useState('0.76');

  const preset = useMemo(() => getOfficialPreset(region, date), [region, date]);

  useEffect(() => {
    setExpenses(loadExpenses());
    const h = () => setExpenses(loadExpenses());
    window.addEventListener('expenses-updated', h);
    return () => window.removeEventListener('expenses-updated', h);
  }, []);

  useEffect(() => {
    if (category !== 'mileage') return;
    const p = getOfficialPreset(region, date);
    if (region === 'japan') {
      setRatePerUnit('');
    } else {
      setRatePerUnit(String(p.defaultRate));
    }
  }, [region, date, category]);

  const totals = useMemo(() => {
    const byCat: Record<string, number> = {
      mileage: 0,
      food: 0,
      entertainment: 0,
      other: 0,
    };
    let all = 0;
    expenses.forEach((e) => {
      const a = Number(e.amount) || 0;
      byCat[e.category] = (byCat[e.category] || 0) + a;
      all += a;
    });
    return { byCat, all };
  }, [expenses]);

  const computedTravelAmount = () => {
    if (region === 'japan') return parseFloat(amount) || 0;
    const d = parseFloat(distance) || 0;
    const r = parseFloat(ratePerUnit) || 0;
    return parseFloat((d * r).toFixed(2));
  };

  const handleAdd = () => {
    if (!date) return;
    let amt = parseFloat(amount) || 0;
    let distNum: number | undefined;
    let rate: number | undefined;
    let unit: DistanceUnit | undefined;

    if (category === 'mileage') {
      unit = preset.unit;
      distNum = parseFloat(distance) || 0;
      if (region === 'japan') {
        if (amt <= 0) return;
        rate = distNum > 0 ? parseFloat((amt / distNum).toFixed(4)) : undefined;
      } else {
        rate = parseFloat(ratePerUnit) || 0;
        if (distNum > 0 && rate > 0) amt = parseFloat((distNum * rate).toFixed(2));
        if (!distNum || distNum <= 0 || rate <= 0) return;
      }
    } else if (amt <= 0) {
      return;
    }

    const row: Expense = {
      id: 'exp-' + Date.now(),
      date,
      category,
      description:
        description.trim() ||
        CATEGORIES.find((c) => c.value === category)?.label ||
        '',
      amount: amt,
      distance: distNum,
      distanceUnit: unit,
      ratePerUnit: rate,
      region: category === 'mileage' ? region : undefined,
      rateSource: category === 'mileage' ? preset.source : undefined,
      miles: unit === 'mi' ? distNum : undefined,
      ratePerMile: unit === 'mi' ? rate : undefined,
      created_at: new Date().toISOString(),
    };

    const next = [row, ...loadExpenses()];
    saveExpenses(next);
    setExpenses(next);
    setDescription('');
    setAmount('');
    setDistance('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this expense?')) return;
    const next = loadExpenses().filter((e) => e.id !== id);
    saveExpenses(next);
    setExpenses(next);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">Connect your wallet to track expenses.</p>
          <Link href="/" className="text-[var(--brand-primary)] hover:underline">
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
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
              <p className="text-[var(--text-secondary)] mt-1">
                Travel · Food · Entertainment — official rates where published (US · Europe · Japan)
                {demo ? ' · Demo (this device)' : ''}
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-full text-sm font-medium transition"
            >
              <Plus className="w-4 h-4" />
              Add expense
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {CATEGORIES.map((c) => (
              <div
                key={c.value}
                className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4"
              >
                <p className="text-xs text-[var(--text-muted)] mb-1">{c.label}</p>
                <p className="text-lg font-semibold">
                  {(totals.byCat[c.value] || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            ))}
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Total expenses:{' '}
            <strong className="text-[var(--text-primary)]">
              {totals.all.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </strong>
          </p>

          {showForm && (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 mb-8 max-w-2xl">
              <h3 className="font-semibold mb-4">New expense</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[var(--text-muted)]">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full mt-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)]">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full mt-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-[var(--text-muted)]">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Client meeting travel, business meal"
                    className="w-full mt-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>

                {category === 'mileage' ? (
                  <>
                    <div className="md:col-span-2">
                      <label className="text-xs text-[var(--text-muted)]">Region</label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value as ExpenseRegion)}
                        className="w-full mt-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm"
                      >
                        <option value="us">United States (mi) — IRS</option>
                        <option value="europe">Europe (km) — DE €0.30 · FR barème note</option>
                        <option value="japan">Japan (km) — actual cost</option>
                      </select>
                      <p className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                        <strong className="text-[var(--text-secondary)]">{preset.rateLabel}</strong>
                        {' — '}
                        {preset.detail}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-[var(--text-muted)]">
                        Distance ({preset.unit})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        className="w-full mt-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm"
                      />
                    </div>
                    {region === 'japan' ? (
                      <div>
                        <label className="text-xs text-[var(--text-muted)]">
                          Actual amount (¥ or your books currency)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full mt-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-xs text-[var(--text-muted)]">
                          Official rate / {preset.unit}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.001"
                          value={ratePerUnit}
                          onChange={(e) => setRatePerUnit(e.target.value)}
                          className="w-full mt-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setRatePerUnit(String(preset.defaultRate))}
                          className="text-[11px] text-[var(--brand-primary)] mt-1 hover:underline"
                        >
                          Reset to official {preset.rateLabel}
                        </button>
                      </div>
                    )}
                    <div className="md:col-span-2 text-sm text-[var(--text-secondary)]">
                      Amount:{' '}
                      <strong className="text-[var(--text-primary)]">
                        {computedTravelAmount().toFixed(2)}
                      </strong>
                      {region !== 'japan' && (
                        <span className="text-xs text-[var(--text-muted)] ml-1">
                          ({distance || 0} {preset.unit} × {ratePerUnit || 0})
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-xs text-[var(--text-muted)]">Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full mt-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={handleAdd}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-full text-sm font-medium transition"
                >
                  Save expense
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 border border-[var(--border-color)] rounded-full text-sm transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {expenses.length === 0 ? (
            <div className="text-center py-16">
              <Receipt className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">No expenses yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((e) => (
                <div
                  key={e.id}
                  className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] capitalize">
                        {e.category === 'mileage' ? 'travel' : e.category}
                      </span>
                      {e.region && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] uppercase">
                          {e.region === 'us' ? 'US' : e.region === 'europe' ? 'EU' : 'JP'}
                        </span>
                      )}
                      <span className="text-xs text-[var(--text-muted)]">{e.date}</span>
                    </div>
                    <p className="font-medium truncate">{e.description || '—'}</p>
                    {e.category === 'mileage' && (e.distance != null || e.miles != null) && (
                      <p className="text-xs text-[var(--text-muted)] mt-1">{distanceLabel(e)}</p>
                    )}
                    {e.rateSource && (
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{e.rateSource}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-semibold">{Number(e.amount).toFixed(2)}</span>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="p-2 text-red-400 hover:bg-red-950/40 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-xs text-[var(--text-muted)] leading-relaxed space-y-2">
            <p>
              <strong className="text-[var(--text-secondary)]">US (2026 IRS business):</strong> $0.725/mi
              (Jan 1–Jun 30); <strong className="text-[var(--text-secondary)]">$0.76/mi</strong> (Jul 1–Dec 31).
              Rate follows expense date.
            </p>
            <p>
              <strong className="text-[var(--text-secondary)]">Europe:</strong> default{' '}
              <strong className="text-[var(--text-secondary)]">€0.30/km</strong> (Germany). France uses barème by
              fiscal HP — override rate as needed.
            </p>
            <p>
              <strong className="text-[var(--text-secondary)]">Japan:</strong> no national ¥/km standard — enter{' '}
              <strong className="text-[var(--text-secondary)]">actual costs</strong> (fuel, tolls, transit).
            </p>
            <p>Not tax advice. Confirm with your accountant before filing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
