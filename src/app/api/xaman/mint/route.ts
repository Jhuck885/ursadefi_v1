import { NextRequest, NextResponse } from 'next/server';
import { XummSdk } from 'xumm-sdk';
import { MIN_MINT_USD } from '@/lib/constants';

const xumm = new XummSdk(
  process.env.XUMM_API_KEY!,
  process.env.XUMM_API_SECRET!
);

/** Hex-encode a UTF-8 string for XRPL URI / Memo fields */
function toHex(str: string): string {
  return Buffer.from(str, 'utf8').toString('hex').toUpperCase();
}

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

    const to = String(invoice.to || invoice.clientName || 'Client');
    const description = String(invoice.description || '').slice(0, 120);
    const xrpAmount =
      invoice.xrpAmount != null ? String(invoice.xrpAmount) : '';

    // Metadata URL wallets fetch to render name, image, attributes
    const metaUrl = new URL(`https://ursadefi.com/api/nft-metadata/${encodeURIComponent(invoice.id)}`);
    metaUrl.searchParams.set('total', String(total));
    metaUrl.searchParams.set('to', to);
    if (description) metaUrl.searchParams.set('description', description);
    if (xrpAmount) metaUrl.searchParams.set('xrp', xrpAmount);

    const uri = toHex(metaUrl.toString());

    const memoData = toHex(
      JSON.stringify({
        platform: 'UrsaDeFi',
        type: 'invoice',
        id: invoice.id,
        to,
        total: invoice.total,
        xrpAmount: invoice.xrpAmount ?? null,
        description: invoice.description || '',
      })
    );

    // Flags: 8 = tfTransferable (standard for usable NFTs)
    // Taxon: fixed project taxon for UrsaDeFi invoices
    const URSA_INVOICE_TAXON = 2026;

    const payload = await xumm.payload.create({
      txjson: {
        TransactionType: 'NFTokenMint',
        Account: '',
        URI: uri,
        NFTokenTaxon: URSA_INVOICE_TAXON,
        Flags: 8,
        Memos: [
          {
            Memo: {
              MemoType: toHex('ursa-invoice'),
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
      metadataUrl: metaUrl.toString(),
    });
  } catch (error: any) {
    console.error('Xaman mint error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create mint payload' },
      { status: 500 }
    );
  }
}
