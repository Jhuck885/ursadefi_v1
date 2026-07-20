import { NextRequest, NextResponse } from 'next/server';
import { XummSdk } from 'xumm-sdk';

const xumm = new XummSdk(
  process.env.XUMM_API_KEY!,
  process.env.XUMM_API_SECRET!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uuid = searchParams.get('uuid');

  if (!uuid) {
    return NextResponse.json({ error: 'Missing uuid' }, { status: 400 });
  }

  try {
    const payload = await xumm.payload.get(uuid);

    if (payload?.meta?.signed) {
      const address = payload.response?.account;
      const publicKey = payload.response?.signer_pubkey;
      const txid = payload.response?.txid || null;

      if (!address) {
        return NextResponse.json({ error: 'Signed but no account found' }, { status: 400 });
      }

      return NextResponse.json({
        signed: true,
        address,
        publicKey,
        txid,
        // Extra fields useful for debugging / future use
        dispatched_result: payload.response?.dispatched_result || null,
        resolved: true,
      });
    }

    return NextResponse.json({
      signed: false,
      expired: payload?.meta?.expired || false,
      resolved: false,
    });
  } catch (error: any) {
    console.error('Xaman poll error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
