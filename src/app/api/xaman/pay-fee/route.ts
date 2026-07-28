import { NextRequest, NextResponse } from 'next/server';
import { XummSdk } from 'xumm-sdk';
import { PLATFORM_FEE_RECEIVER, calcPlatformFee } from '@/lib/constants';

const xumm = new XummSdk(
  process.env.XUMM_API_KEY!,
  process.env.XUMM_API_SECRET!
);

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

    // Prefer explicit rate; else derive from invoice XRP amount; else safe fallback
    let xrpPerUsd = 0;
    if (Number(invoice.xrpRate) > 0) {
      // if stored as USD per XRP
      xrpPerUsd = 1 / Number(invoice.xrpRate);
    } else if (Number(invoice.xrpAmount) > 0 && Number(invoice.total) > 0) {
      // xrpAmount is total XRP for the invoice → XRP per USD
      xrpPerUsd = Number(invoice.xrpAmount) / Number(invoice.total);
    } else {
      // fallback ~ $2.50 / XRP → 0.4 XRP per USD
      xrpPerUsd = 0.4;
    }

    const feeXrp = parseFloat((feeUsd * xrpPerUsd).toFixed(6));

    if (!Number.isFinite(feeXrp) || feeXrp <= 0) {
      return NextResponse.json(
        { error: `Invalid fee XRP amount (${feeXrp}). Check invoice rate.` },
        { status: 400 }
      );
    }

    // Amount in drops (1 XRP = 1,000,000 drops). Min 1 drop.
    const dropsInt = Math.max(1, Math.floor(feeXrp * 1_000_000));
    const drops = String(dropsInt);

    let payload;
    try {
      payload = await xumm.payload.create({
        txjson: {
          TransactionType: 'Payment',
          Account: '',
          Destination: PLATFORM_FEE_RECEIVER,
          Amount: drops,
          Memos: [
            {
              Memo: {
                MemoType: Buffer.from('platform-fee', 'utf8').toString('hex').toUpperCase(),
                MemoData: Buffer.from(
                  JSON.stringify({
                    invoiceId: invoice.id,
                    feeUsd,
                    feeXrp,
                  }),
                  'utf8'
                )
                  .toString('hex')
                  .toUpperCase(),
              },
            },
          ],
        },
        options: {
          submit: true,
        },
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
          feeXrp,
          drops,
        },
        { status: 502 }
      );
    }

    if (!payload?.uuid) {
      return NextResponse.json(
        {
          error: 'Xaman returned empty payload. Fee destination may be unfunded or API keys misconfigured.',
          destination: PLATFORM_FEE_RECEIVER,
          feeUsd,
          feeXrp,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      uuid: payload.uuid,
      next: payload.next?.always,
      qr: payload.refs?.qr_png,
      feeUsd,
      feeXrp,
      destination: PLATFORM_FEE_RECEIVER,
      message: `Pay platform fee of $${feeUsd.toFixed(2)} (~${feeXrp} XRP)`,
    });
  } catch (error: any) {
    console.error('Xaman pay-fee error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create fee payment payload' },
      { status: 500 }
    );
  }
}
