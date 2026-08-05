import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * POST /api/arb/ingest
 * Bot posts paper decisions here.
 * Header: x-arb-secret: <ARB_INGEST_SECRET>
 * Body: single decision object or { decisions: [...] }
 */
export async function POST(req: NextRequest) {
  const secret = process.env.ARB_INGEST_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: 'ARB_INGEST_SECRET not configured on server' },
      { status: 503 }
    );
  }

  const provided =
    req.headers.get('x-arb-secret') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'Supabase not configured' },
      { status: 503 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const items: any[] = Array.isArray(body?.decisions)
    ? body.decisions
    : Array.isArray(body)
      ? body
      : [body];

  if (!items.length) {
    return NextResponse.json({ ok: false, error: 'Empty payload' }, { status: 400 });
  }

  const rows = items.map((d) => ({
    ts: d.ts || d.timestamp || new Date().toISOString(),
    action: String(d.action || 'UNKNOWN'),
    mode: d.mode || 'dry-run',
    question: d.question ?? null,
    reason: d.reason ?? null,
    market_id: d.market_id ?? null,
    net_edge: d.net_edge != null ? String(d.net_edge) : null,
    gross_edge: d.gross_edge != null ? String(d.gross_edge) : null,
    total_cost: d.total_cost != null ? String(d.total_cost) : null,
    est_profit_usdc: d.est_profit_usdc != null ? String(d.est_profit_usdc) : null,
    shares: d.shares != null ? String(d.shares) : null,
    yes_avg: d.yes_avg != null ? String(d.yes_avg) : null,
    no_avg: d.no_avg != null ? String(d.no_avg) : null,
    yes_ask: d.yes_ask != null ? String(d.yes_ask) : null,
    no_ask: d.no_ask != null ? String(d.no_ask) : null,
    combined_ask: d.combined_ask != null ? String(d.combined_ask) : null,
    yes_depth_usdc: d.yes_depth_usdc != null ? String(d.yes_depth_usdc) : null,
    no_depth_usdc: d.no_depth_usdc != null ? String(d.no_depth_usdc) : null,
    volume_24h:
      d.volume_24h != null && d.volume_24h !== ''
        ? Number(d.volume_24h)
        : null,
    fee_rate: d.fee_rate != null ? String(d.fee_rate) : null,
    fees_enabled:
      typeof d.fees_enabled === 'boolean' ? d.fees_enabled : null,
    candidates_scanned:
      d.candidates_scanned != null ? Number(d.candidates_scanned) : null,
    near_misses: d.near_misses != null ? Number(d.near_misses) : null,
    payload: d,
  }));

  const { data, error } = await supabase
    .from('poly_arb_decisions')
    .insert(rows)
    .select('id, action, created_at');

  if (error) {
    console.error('[arb/ingest]', error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, inserted: data?.length ?? 0, rows: data });
}
