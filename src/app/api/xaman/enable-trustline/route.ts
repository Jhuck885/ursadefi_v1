import { NextRequest, NextResponse } from 'next/server';
import { XummSdk } from 'xumm-sdk';
import { getAsset, type AssetId } from '@/lib/stablecoins';

const xumm = new XummSdk(
  process.env.XUMM_API_KEY!,
  process.env.XUMM_API_SECRET!
);

const DEFAULT_LIMIT = '1000000000';

/**
 * Create a Xaman TrustSet so the connected wallet can receive an issued stablecoin.
 * Body: { assetId }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const assetId = String(body.assetId || 'RLUSD').toUpperCase() as AssetId;
    const asset = getAsset(assetId);

    if (asset.kind !== 'issued' || !asset.issuer) {
      return NextResponse.json(
        { error: `${asset.symbol} does not need a trustline` },
        { status: 400 }
      );
    }

    const payload = await xumm.payload.create({
      txjson: {
        TransactionType: 'TrustSet',
        Account: '',
        LimitAmount: {
          currency: asset.currency,
          issuer: asset.issuer,
          value: body.limit || DEFAULT_LIMIT,
        },
      },
      options: { submit: true },
    });

    if (!payload?.uuid) {
      return NextResponse.json({ error: 'Xaman returned empty TrustSet payload' }, { status: 502 });
    }

    return NextResponse.json({
      uuid: payload.uuid,
      next: payload.next?.always,
      qr: payload.refs?.qr_png,
      asset: asset.symbol,
      issuer: asset.issuer,
      message: `Approve TrustSet in Xaman to receive ${asset.symbol}`,
    });
  } catch (error: any) {
    console.error('enable-trustline error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create TrustSet payload' },
      { status: 500 }
    );
  }
}
