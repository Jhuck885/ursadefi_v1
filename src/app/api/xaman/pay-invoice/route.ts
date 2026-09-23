import { NextRequest, NextResponse } from 'next/server';
import { XummSdk } from 'xumm-sdk';
import { getAsset, toXrplAmount, isIssued, type AssetId } from '@/lib/stablecoins';

const xumm = new XummSdk(
  process.env.XUMM_API_KEY!,
  process.env.XUMM_API_SECRET!
);

/**
 * Create a Xaman Payment payload for XRP or an issued stablecoin.
 * Body: { invoiceId, destination, amount, assetId }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const destination = String(body.destination || body.receiver || '').trim();
    const assetId = String(body.assetId || 'RLUSD').toUpperCase() as AssetId;
    const amount = Number(body.amount ?? body.total ?? 0);
    const invoiceId = String(body.invoiceId || body.id || '');

    if (!destination.startsWith('r')) {
      return NextResponse.json({ error: 'Invalid destination address' }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const asset = getAsset(assetId);
    const xrplAmount = toXrplAmount(asset.id, amount);

    const memoPayload = { invoiceId, asset: asset.symbol, amount };

    const payload = await xumm.payload.create({
      txjson: {
        TransactionType: 'Payment',
        Account: '',
        Destination: destination,
        Amount: xrplAmount as any,
        Memos: [
          {
            Memo: {
              MemoType: Buffer.from('ursadefi-invoice', 'utf8').toString('hex').toUpperCase(),
              MemoData: Buffer.from(JSON.stringify(memoPayload), 'utf8')
                .toString('hex')
                .toUpperCase(),
            },
          },
        ],
      },
      options: { submit: true },
    });

    if (!payload?.uuid) {
      return NextResponse.json(
        { error: 'Xaman returned empty payload. Check API keys and destination.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      uuid: payload.uuid,
      next: payload.next?.always,
      qr: payload.refs?.qr_png,
      destination,
      asset: asset.symbol,
      assetId: asset.id,
      amount,
      issued: isIssued(asset.id),
      issuer: asset.issuer || null,
      message: `Pay ${amount} ${asset.symbol} to settle invoice ${invoiceId || ''}`.trim(),
    });
  } catch (error: any) {
    console.error('pay-invoice error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment payload' },
      { status: 500 }
    );
  }
}
