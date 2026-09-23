import { Client } from 'xrpl';
import { NextRequest, NextResponse } from 'next/server';
import { getAsset, type AssetId } from '@/lib/stablecoins';

const XRPL_SERVER =
  process.env.XRPL_SERVER ||
  process.env.NEXT_PUBLIC_XRPL_SERVER ||
  'wss://xrplcluster.com';

/**
 * GET ?account=r...&asset=RLUSD
 * Returns whether the account has a trustline for the issued asset.
 */
export async function GET(request: NextRequest) {
  const account = request.nextUrl.searchParams.get('account') || '';
  const assetId = (request.nextUrl.searchParams.get('asset') || 'RLUSD').toUpperCase() as AssetId;
  const asset = getAsset(assetId);

  if (!account.startsWith('r')) {
    return NextResponse.json({ error: 'Invalid account' }, { status: 400 });
  }
  if (asset.kind === 'native') {
    return NextResponse.json({
      account,
      asset: asset.id,
      required: false,
      ready: true,
      limit: null,
      balance: null,
    });
  }

  const client = new Client(XRPL_SERVER);
  try {
    await client.connect();
    const res = await client.request({
      command: 'account_lines',
      account,
      peer: asset.issuer,
      ledger_index: 'validated',
    });

    const line = (res.result.lines || []).find((l: any) => {
      const cur = String(l.currency || '').toUpperCase();
      return (
        l.account === asset.issuer &&
        (cur === asset.currency.toUpperCase() ||
          cur === asset.symbol ||
          cur === 'RLUSD' ||
          cur === 'USDC' ||
          cur.startsWith('524C555344') ||
          cur.startsWith('55534443'))
      );
    });

    const limit = line ? Number(line.limit) : 0;

    return NextResponse.json({
      account,
      asset: asset.id,
      issuer: asset.issuer,
      required: true,
      ready: Boolean(line && limit > 0),
      limit: line ? line.limit : null,
      balance: line ? line.balance : null,
      frozen: Boolean(line?.freeze || line?.freeze_peer),
    });
  } catch (error: any) {
    const msg = String(error?.data?.error || error?.message || '');
    if (msg.includes('actNotFound')) {
      return NextResponse.json({
        account,
        asset: asset.id,
        required: true,
        ready: false,
        error: 'Account not funded on XRPL',
      });
    }
    console.error('trustline check error:', error);
    return NextResponse.json(
      { error: error.message || 'Trustline check failed' },
      { status: 500 }
    );
  } finally {
    try {
      await client.disconnect();
    } catch {}
  }
}
