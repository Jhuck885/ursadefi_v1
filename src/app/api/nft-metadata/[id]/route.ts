import { NextRequest, NextResponse } from 'next/server';

/**
 * Public NFT metadata endpoint for UrsaDeFi invoice NFTs.
 * Wallets (Xaman) and explorers fetch this JSON via the NFToken URI.
 * Keep fields stable and factual for GEO + wallet rendering.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);

    const to = searchParams.get('to') || 'Client';
    const total = searchParams.get('total') || '0';
    const description = searchParams.get('description') || '';
    const xrpAmount = searchParams.get('xrp') || '';

    const name = `UrsaDeFi Invoice ${id}`;
    const descParts = [
      `Non-custodial XRPL invoice from UrsaDeFi.`,
      `Amount: $${total} USD.`,
      to ? `Client: ${to}.` : '',
      description ? `Description: ${description}.` : '',
      xrpAmount ? `Approx XRP: ${xrpAmount}.` : '',
      'Minted as a permanent on-chain record. Keys stay with the issuer wallet via Xaman.',
    ].filter(Boolean);

    const metadata = {
      name,
      description: descParts.join(' '),
      image: 'https://ursadefi.com/ursa-logo.png',
      external_url: `https://ursadefi.com/help`,
      animation_url: undefined,
      attributes: [
        { trait_type: 'Platform', value: 'UrsaDeFi' },
        { trait_type: 'Type', value: 'Invoice' },
        { trait_type: 'Invoice ID', value: id },
        { trait_type: 'Amount (USD)', value: `$${total}` },
        ...(to ? [{ trait_type: 'Client', value: to }] : []),
        ...(xrpAmount ? [{ trait_type: 'XRP Amount', value: xrpAmount }] : []),
        { trait_type: 'Custody', value: 'Non-custodial' },
        { trait_type: 'Network', value: 'XRPL Mainnet' },
      ],
      properties: {
        category: 'invoice',
        issuer_name: 'UrsaDeFi',
        schema: 'ursa-invoice-v1',
      },
    };

    return NextResponse.json(metadata, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('NFT metadata error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to build metadata' },
      { status: 500 }
    );
  }
}
