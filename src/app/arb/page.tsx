'use client';

import { useCallback, useEffect, useState } from 'react';
import LeftSidebar from '@/components/layout/LeftSidebar';
import { Activity, RefreshCw, Shield } from 'lucide-react';

type Decision = {
  id: number;
  created_at: string;
  ts?: string | null;
  action: string;
  mode?: string | null;
  question?: string | null;
  reason?: string | null;
  net_edge?: string | null;
  total_cost?: string | null;
  est_profit_usdc?: string | null;
  combined_ask?: string | null;
  volume_24h?: number | null;
  candidates_scanned?: number | null;
  near_misses?: number | null;
  shares?: string | null;
  yes_avg?: string | null;
  no_avg?: string | null;
};

function badgeClass(action: string) {
  switch (action) {
    case 'PAPER_SIGNAL':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'NEAR_MISS':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'REJECTED':
      return 'bg-red-500/15 text-red-400 border-red-500/30';
    case 'NO_OPPORTUNITY':
      return 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-color)]';
    default:
      return 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-color)]';
  }
}

function fmtTime(iso?: string | null) {
  if (!iso) return '\u2014';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function ArbDashboardPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [lastFetch, setLastFetch] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const q =
        filter === 'all'
          ? '/api/arb/decisions?limit=80'
          : `/api/arb/decisions?limit=80&action=${encodeURIComponent(filter)}`;
      const res = await fetch(q, { cache: 'no-store' });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error || 'Failed to load');
        setDecisions([]);
      } else {
        setError(null);
        setDecisions(json.decisions || []);
        setCounts(json.counts || {});
      }
      setLastFetch(new Date().toISOString());
    } catch (e: any) {
      setError(e?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const paper = counts['PAPER_SIGNAL'] || 0;
  const near = counts['NEAR_MISS'] || 0;
  const none = counts['NO_OPPORTUNITY'] || 0;

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="w-72 border-r border-[var(--border-color)] hidden lg:block flex-shrink-0">
        <LeftSidebar />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Activity className="w-7 h-7 text-[var(--brand-primary)]" />
                <h1 className="text-3xl font-bold tracking-tight">Poly Arb</h1>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                International pure-arb bot \u00b7 paper / dry-run only
              </p>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                load();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-color)] hover:border-[var(--brand-primary)] text-sm transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="mb-6 flex items-center gap-2 text-xs text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span>
              Live execution is blocked. Only paper decisions are shown. Risk params remain locked in PROJECT.md.
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
              <div className="text-xs text-[var(--text-muted)] mb-1">Paper signals</div>
              <div className="text-2xl font-semibold text-emerald-400">{paper}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
              <div className="text-xs text-[var(--text-muted)] mb-1">Near misses</div>
              <div className="text-2xl font-semibold text-amber-400">{near}</div>
            </div>
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
              <div className="text-xs text-[var(--text-muted)] mb-1">No opportunity</div>
              <div className="text-2xl font-semibold text-[var(--text-secondary)]">{none}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {['all', 'PAPER_SIGNAL', 'NEAR_MISS', 'NO_OPPORTUNITY', 'REJECTED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs border transition ${
                  filter === f
                    ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] bg-[var(--bg-secondary)]'
                    : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--brand-primary)]'
                }`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>

          {lastFetch && (
            <p className="text-xs text-[var(--text-muted)] mb-3">
              Last update {fmtTime(lastFetch)} \u00b7 auto-refresh 15s
            </p>
          )}

          {error && (
            <div className="mb-4 p-4 rounded-2xl border border-amber-600/40 bg-amber-950/30 text-sm text-amber-200">
              {error}
              <div className="mt-2 text-xs opacity-80">
                First run: execute supabase/poly_arb_decisions.sql, set ARB_INGEST_SECRET and Supabase keys on Vercel, point the bot at /api/arb/ingest.
              </div>
            </div>
          )}

          {loading && decisions.length === 0 ? (
            <div className="text-center text-[var(--text-muted)] py-16">Loading decisions\u2026</div>
          ) : decisions.length === 0 ? (
            <div className="text-center text-[var(--text-muted)] py-16 border border-dashed border-[var(--border-color)] rounded-2xl">
              No paper decisions yet. When the bot posts cycles, they will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {decisions.map((d) => (
                <div
                  key={d.id}
                  className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span
                      className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${badgeClass(
                        d.action
                      )}`}
                    >
                      {d.action}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {fmtTime(d.ts || d.created_at)}
                    </span>
                  </div>
                  {d.question && (
                    <p className="text-sm font-medium mb-1 line-clamp-2">{d.question}</p>
                  )}
                  {d.reason && (
                    <p className="text-xs text-[var(--text-secondary)] mb-2">{d.reason}</p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                    {d.net_edge != null && <span>net edge: {d.net_edge}</span>}
                    {d.total_cost != null && <span>cost: ${d.total_cost}</span>}
                    {d.est_profit_usdc != null && <span>est profit: ${d.est_profit_usdc}</span>}
                    {d.combined_ask != null && <span>YES+NO ask: {d.combined_ask}</span>}
                    {d.shares != null && <span>shares: {d.shares}</span>}
                    {d.volume_24h != null && (
                      <span>vol 24h: ${Number(d.volume_24h).toLocaleString()}</span>
                    )}
                    {d.candidates_scanned != null && (
                      <span>scanned: {d.candidates_scanned}</span>
                    )}
                    {d.near_misses != null && <span>near misses: {d.near_misses}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
