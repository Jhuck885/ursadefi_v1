import { NextRequest, NextResponse } from 'next/server';
import { XummSdk } from 'xumm-sdk';
import { MIN_MINT_USD } from '@/lib/constants';

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

    const total = Number(invoice.total) || 0;
    if (total < MIN_MINT_USD) {
      return NextResponse.json(
        { error: `Minimum $${MIN_MINT_USD} to mint an NFT` },
        { status: 400 }
      );
    }

    const uri = Buffer.from(`https://ursadefi.com/invoice/${invoice.id}`).toString('hex');

    const memoData = Buffer.from(
      JSON.stringify({
        id: invoice.id,
        to: invoice.to || '',
        total: invoice.total,
        xrpAmount: invoice.xrpAmount,
        description: invoice.description || '',
      })
    ).toString('hex');

    const payload = await xumm.payload.create({
      txjson: {
        TransactionType: 'NFTokenMint',
        Account: '',
        URI: uri,
        NFTokenTaxon: 0,
        Flags: 0,
        Memos: [
          {
            Memo: {
              MemoType: Buffer.from('invoice').toString('hex'),
              MemoData: memoData,
            },
          },
        ],
      },
      options: {
        submit: true,
      },
    });

    if (!payload) {
      return NextResponse.json({ error: 'Failed to create Xaman payload' }, { status: 500 });
    }

    return NextResponse.json({
      uuid: payload.uuid,
      next: payload.next?.always,
      qr: payload.refs?.qr_png,
      message: 'Xaman payload created — open to sign the mint',
    });
  } catch (error: any) {
    console.error('Xaman mint error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create mint payload' },
      { status: 500 }
    );
  }
}
