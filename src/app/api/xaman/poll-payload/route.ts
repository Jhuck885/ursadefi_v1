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
      // Get the wallet address from the response (correct path for signed payloads)
      const address = payload.response?.account;
      const publicKey = payload.response?.signing_pubkey;

      if (!address) {
        return NextResponse.json({ error: 'Signed but no account found' }, { status: 400 });
      }

      return NextResponse.json({
        signed: true,
        address,
        publicKey,
      });
    }

    return NextResponse.json({
      signed: false,
      expired: payload?.meta?.expired || false
    });
  } catch (error: any) {
    console.error('Xaman poll error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
