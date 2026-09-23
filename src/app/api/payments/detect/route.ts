import { Client } from 'xrpl';
import { NextRequest, NextResponse } from 'next/server';
import { getAsset, parseXrplAmount, type AssetId } from '@/lib/stablecoins';

const XRPL_SERVER =
  process.env.XRPL_SERVER ||
  process.env.NEXT_PUBLIC_XRPL_SERVER ||
  'wss://xrplcluster.com';

/**
 * Detect inbound Payment to receiver for XRP or issued stablecoins.
 * Body: { receiver, amount, assetId, xrpAmount?, tolerance? }
 */
export async function POST(request: NextRequest) {
  const client = new Client(XRPL_SERVER);
  try {
    const body = await request.json();
    const receiver = String(body.receiver || '').trim();
    const assetId = String(body.assetId || (body.xrpAmount ? 'XRP' : 'RLUSD')).toUpperCase() as AssetId;
    const asset = getAsset(assetId);
    const expected =
      Number(body.amount) ||
      Number(body.expected) ||
      (asset.id === 'XRP' ? Number(body.xrpAmount) : 0);
    const tolerance = Number(body.tolerance) || (asset.peggedUsd ? 0.01 : 0.02);

    if (!receiver.startsWith('r')) {
      return NextResponse.json({ error: 'Invalid receiver' }, { status: 400 });
    }
    if (expected <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    await client.connect();

    const response = await client.request({
      command: 'account_tx',
      account: receiver,
      limit: 50,
      ledger_index_max: -1,
      ledger_index_min: -1,
      forward: false,
    });

    const min = expected * (1 - tolerance);
    const max = expected * (1 + tolerance);

    const matches: Array<{
      hash: string;
      amount: number;
      assetId: string;
      from: string;
      date: string;
    }> = [];

    for (const entry of response.result.transactions || []) {
      const tx: any = (entry as any).tx || (entry as any).tx_json;
      if (!tx || tx.TransactionType !== 'Payment') continue;
      if (tx.Destination !== receiver) continue;

      const parsed = parseXrplAmount(tx.Amount);
      if (parsed.assetId !== asset.id) continue;
      if (parsed.value < min || parsed.value > max) continue;

      const rippleEpoch = Number(tx.date) || 0;
      const date = new Date(rippleEpoch * 1000 + 946684800000).toISOString();

      matches.push({
        hash: tx.hash || (entry as any).hash || '',
        amount: parsed.value,
        assetId: parsed.assetId,
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
      expected,
      assetId: asset.id,
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
