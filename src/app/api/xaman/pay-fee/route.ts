import { NextRequest, NextResponse } from 'next/server';
import { XummSdk } from 'xumm-sdk';
import { PLATFORM_FEE_RECEIVER, calcPlatformFee } from '@/lib/constants';
import { getAsset, toXrplAmount, type AssetId } from '@/lib/stablecoins';

const xumm = new XummSdk(
  process.env.XUMM_API_KEY!,
  process.env.XUMM_API_SECRET!
);

/**
 * Platform fee is collected in the same unit the invoice settled in.
 * Default: RLUSD (1:1 with invoice USD). XRP only if the invoice currency is XRP.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoice } = body;

    if (!invoice?.id) {
      return NextResponse.json({ error: 'Missing invoice data' }, { status: 400 });
    }

    if (!PLATFORM_FEE_RECEIVER || !PLATFORM_FEE_RECEIVER.startsWith('r')) {
      return NextResponse.json(
        { error: 'Platform fee receiver address is not configured' },
        { status: 500 }
      );
    }

    const subtotal = Number(invoice.subtotal) || Number(invoice.total) || 0;
    const feeUsd = calcPlatformFee(subtotal);

    if (feeUsd <= 0) {
      return NextResponse.json({ error: 'No platform fee due' }, { status: 400 });
    }

    const assetId = String(invoice.currency || invoice.settlementAsset || 'RLUSD').toUpperCase() as AssetId;
    const asset = getAsset(assetId === 'XRP' ? 'XRP' : assetId === 'USDC' ? 'USDC' : 'RLUSD');

    let xrplAmount: string | { currency: string; issuer: string; value: string };
    let feeDisplay: string;

    if (asset.id === 'XRP') {
      let xrpPerUsd = 0;
      if (Number(invoice.xrpRate) > 0) {
        xrpPerUsd = 1 / Number(invoice.xrpRate);
      } else if (Number(invoice.xrpAmount) > 0 && Number(invoice.total) > 0) {
        xrpPerUsd = Number(invoice.xrpAmount) / Number(invoice.total);
      } else {
        xrpPerUsd = 0.4;
      }
      const feeXrp = parseFloat((feeUsd * xrpPerUsd).toFixed(6));
      if (!Number.isFinite(feeXrp) || feeXrp <= 0) {
        return NextResponse.json({ error: `Invalid fee XRP amount (${feeXrp})` }, { status: 400 });
      }
      xrplAmount = toXrplAmount('XRP', feeXrp) as string;
      feeDisplay = `${feeXrp} XRP`;
    } else {
      xrplAmount = toXrplAmount(asset.id, feeUsd) as any;
      feeDisplay = `${feeUsd.toFixed(2)} ${asset.symbol}`;
    }

    let payload;
    try {
      payload = await xumm.payload.create({
        txjson: {
          TransactionType: 'Payment',
          Account: '',
          Destination: PLATFORM_FEE_RECEIVER,
          Amount: xrplAmount as any,
          Memos: [
            {
              Memo: {
                MemoType: Buffer.from('platform-fee', 'utf8').toString('hex').toUpperCase(),
                MemoData: Buffer.from(
                  JSON.stringify({
                    invoiceId: invoice.id,
                    feeUsd,
                    asset: asset.symbol,
                  }),
                  'utf8'
                )
                  .toString('hex')
                  .toUpperCase(),
              },
            },
          ],
        },
        options: { submit: true },
      });
    } catch (xummErr: any) {
      console.error('Xumm payload.create failed:', xummErr);
      const detail =
        xummErr?.message ||
        xummErr?.response?.data?.error ||
        xummErr?.response?.data?.message ||
        JSON.stringify(xummErr?.response?.data || xummErr);
      return NextResponse.json(
        {
          error: `Xaman rejected fee payload: ${detail}`,
          destination: PLATFORM_FEE_RECEIVER,
          feeUsd,
          asset: asset.symbol,
        },
        { status: 502 }
      );
    }

    if (!payload?.uuid) {
      return NextResponse.json(
        {
          error: 'Xaman returned empty payload. Fee destination may need an RLUSD/USDC trustline.',
          destination: PLATFORM_FEE_RECEIVER,
          feeUsd,
          asset: asset.symbol,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      uuid: payload.uuid,
      next: payload.next?.always,
      qr: payload.refs?.qr_png,
      feeUsd,
      asset: asset.symbol,
      destination: PLATFORM_FEE_RECEIVER,
      message: `Pay platform fee of ${feeDisplay}`,
    });
  } catch (error: any) {
    console.error('Xaman pay-fee error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create fee payment payload' },
      { status: 500 }
    );
  }
}
