import { NextRequest, NextResponse } from 'next/server';
import { XummSdk } from 'xumm-sdk';

const xumm = new XummSdk(
  process.env.XUMM_API_KEY!,
  process.env.XUMM_API_SECRET!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nftokenId } = body;

    if (!nftokenId) {
      return NextResponse.json({ error: 'Missing nftokenId' }, { status: 400 });
    }

    const payload = await xumm.payload.create({
      txjson: {
        TransactionType: 'NFTokenBurn',
        Account: '', // Xaman fills this
        NFTokenID: nftokenId,
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
      message: 'Xaman payload created — open to sign the burn',
    });
  } catch (error: any) {
    console.error('Xaman burn error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create burn payload' },
      { status: 500 }
    );
  }
}
