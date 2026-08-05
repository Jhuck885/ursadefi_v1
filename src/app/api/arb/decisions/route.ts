import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getClient() {
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
 * GET /api/arb/decisions?limit=50&action=PAPER_SIGNAL
 * Public read of paper-trade decisions for the dashboard.
 */
export async function GET(req: NextRequest) {
  const supabase = getClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'Supabase not configured', decisions: [] },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get('limit') || 50), 200);
  const action = searchParams.get('action');

  let q = supabase
    .from('poly_arb_decisions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (action) {
    q = q.eq('action', action);
  }

  const { data, error } = await q;

  if (error) {
    console.error('[arb/decisions]', error.message);
    return NextResponse.json(
      { ok: false, error: error.message, decisions: [] },
      { status: 500 }
    );
  }

  const { data: statsRows } = await supabase
    .from('poly_arb_decisions')
    .select('action')
    .order('created_at', { ascending: false })
    .limit(500);

  const counts: Record<string, number> = {};
  for (const r of statsRows || []) {
    counts[r.action] = (counts[r.action] || 0) + 1;
  }

  return NextResponse.json({
    ok: true,
    decisions: data || [],
    counts,
    mode: 'dry-run',
  });
}
