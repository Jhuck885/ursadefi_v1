import { NextRequest, NextResponse } from 'next/server';
import { XummSdk } from 'xumm-sdk';
import { PLATFORM_FEE_RECEIVER } from '@/lib/constants';

const xumm = new XummSdk(
  process.env.XUMM_API_KEY!,
  process.env.XUMM_API_SECRET!
);

/**
 * Poll a pay-fee Xaman payload. Returns settled=true only when signed
 * and (when available) destination matches platform fee receiver.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uuid, invoiceId } = body;

    if (!uuid) {
      return NextResponse.json({ error: 'Missing uuid' }, { status: 400 });
    }

    const payload = await xumm.payload.get(uuid);

    if (payload?.meta?.expired) {
      return NextResponse.json({
        signed: false,
        settled: false,
        expired: true,
      });
    }

    if (!payload?.meta?.signed) {
      return NextResponse.json({
        signed: false,
        settled: false,
        expired: false,
      });
    }

    const txid = payload.response?.txid || null;
    const account = payload.response?.account || null;
    const dispatched = payload.response?.dispatched_result || null;

    // Prefer success when submitted; some environments only set signed
    const submitOk =
      !dispatched ||
      dispatched === 'tesSUCCESS' ||
      String(dispatched).startsWith('tes');

    const settled = Boolean(payload.meta.signed && submitOk);

    return NextResponse.json({
      signed: true,
      settled,
      expired: false,
      txid,
      account,
      invoiceId: invoiceId || null,
      destination: PLATFORM_FEE_RECEIVER,
      dispatched_result: dispatched,
    });
  } catch (error: any) {
    console.error('resolve-fee error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resolve fee payload' },
      { status: 500 }
    );
  }
}
