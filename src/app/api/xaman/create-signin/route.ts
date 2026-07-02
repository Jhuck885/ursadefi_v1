import { NextRequest, NextResponse } from 'next/server';
import { XummSdk } from 'xumm-sdk';

const xumm = new XummSdk(
  process.env.XUMM_API_KEY!,
  process.env.XUMM_API_SECRET!
);

export async function POST() {
  try {
    const payload = await xumm.payload.create({
      txjson: {
        TransactionType: 'SignIn'
      },
      options: {
        submit: false
      }
    });

    return NextResponse.json({
      uuid: payload.uuid,
      qr_png: payload.refs.qr_png,
      next_always: payload.next.always
    });
  } catch (error: any) {
    console.error('Xaman payload creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create payload' }, { status: 500 });
  }
}
