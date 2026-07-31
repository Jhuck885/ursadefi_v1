import { Client } from 'xrpl';
import { NextRequest, NextResponse } from 'next/server';

const XRPL_SERVER =
  process.env.XRPL_SERVER ||
  process.env.NEXT_PUBLIC_XRPL_SERVER ||
  'wss://xrplcluster.com';

/**
 * Detect inbound XRP Payment to receiver near the locked invoice amount.
 * Body: { receiver, xrpAmount, tolerance? }
 */
export async function POST(request: NextRequest) {
  const client = new Client(XRPL_SERVER);
  try {
    const body = await request.json();
    const receiver = String(body.receiver || '').trim();
    const expectedXrp = Number(body.xrpAmount) || 0;
    const tolerance = Number(body.tolerance) || 0.02; // 2% default

    if (!receiver.startsWith('r')) {
      return NextResponse.json({ error: 'Invalid receiver' }, { status: 400 });
    }
    if (expectedXrp <= 0) {
      return NextResponse.json({ error: 'Invalid xrpAmount' }, { status: 400 });
    }

    await client.connect();

    const response = await client.request({
      command: 'account_tx',
      account: receiver,
      limit: 40,
      ledger_index_max: -1,
      ledger_index_min: -1,
      forward: false,
    });

    const minXrp = expectedXrp * (1 - tolerance);
    const maxXrp = expectedXrp * (1 + tolerance);

    const matches: Array<{
      hash: string;
      amountXrp: number;
      from: string;
      date: string;
    }> = [];

    for (const entry of response.result.transactions || []) {
      const tx: any = (entry as any).tx || (entry as any).tx_json;
      if (!tx || tx.TransactionType !== 'Payment') continue;
      if (tx.Destination !== receiver) continue;
      if (typeof tx.Amount !== 'string') continue; // XRP only for now

      const amountXrp = Number(tx.Amount) / 1_000_000;
      if (amountXrp < minXrp || amountXrp > maxXrp) continue;

      const rippleEpoch = Number(tx.date) || 0;
      const date = new Date(rippleEpoch * 1000 + 946684800000).toISOString();

      matches.push({
        hash: tx.hash || (entry as any).hash || '',
        amountXrp,
        from: tx.Account || '',
        date,
      });
    }

    const best = matches[0] || null;

    return NextResponse.json({
      detected: Boolean(best),
      match: best,
      matches,
      receiver,
      expectedXrp,
      tolerance,
    });
  } catch (error: any) {
    console.error('payment detect error:', error);
    return NextResponse.json(
      { error: error.message || 'Detection failed' },
      { status: 500 }
    );
  } finally {
    try {
      await client.disconnect();
    } catch {}
  }
}
