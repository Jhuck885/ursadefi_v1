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

    const subtotal = Number(invoice.subtotal) || Number(invoice.total) || 0;
    const feeUsd = calcPlatformFee(subtotal);

    if (feeUsd <= 0) {
      return NextResponse.json({ error: 'No platform fee due' }, { status: 400 });
    }

    // Convert USD fee to XRP using the rate stored on the invoice (fallback to a safe default)
    const xrpRate = Number(invoice.xrpRate) || (invoice.xrpAmount && invoice.total ? invoice.total / invoice.xrpAmount : 2.5);
    const feeXrp = parseFloat((feeUsd / xrpRate).toFixed(6));

    if (feeXrp <= 0) {
      return NextResponse.json({ error: 'Invalid fee amount' }, { status: 400 });
    }

    // Amount in drops (1 XRP = 1,000,000 drops)
    const drops = Math.floor(feeXrp * 1_000_000).toString();

    const payload = await xumm.payload.create({
      txjson: {
        TransactionType: 'Payment',
        Account: '', // filled by Xaman with the signing account
        Destination: PLATFORM_FEE_RECEIVER,
        Amount: drops,
        Memos: [
          {
            Memo: {
              MemoType: Buffer.from('platform-fee').toString('hex'),
              MemoData: Buffer.from(
                JSON.stringify({
                  invoiceId: invoice.id,
                  feeUsd,
                  feeXrp,
                })
              ).toString('hex'),
            },
          },
        ],
      },
      options: {
        submit: true,
      },
    });

    if (!payload) {
      return NextResponse.json({ error: 'Failed to create fee payment payload' }, { status: 500 });
    }

    return NextResponse.json({
      uuid: payload.uuid,
      next: payload.next?.always,
      qr: payload.refs?.qr_png,
      feeUsd,
      feeXrp,
      message: `Pay platform fee of $${feeUsd.toFixed(2)} (${feeXrp} XRP)`,
    });
  } catch (error: any) {
    console.error('Xaman pay-fee error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create fee payment payload' },
      { status: 500 }
    );
  }
}
