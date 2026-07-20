import { NextRequest, NextResponse } from 'next/server';
import { XummSdk } from 'xumm-sdk';
import { Client } from 'xrpl';

const xumm = new XummSdk(
  process.env.XUMM_API_KEY!,
  process.env.XUMM_API_SECRET!
);

const client = new Client('wss://s.altnet.rippletest.net:51233');

function extractNFTokenID(meta: any): string | null {
  if (!meta) return null;

  // Some XRPL versions / explorers surface it directly
  if (typeof meta.nftoken_id === 'string' && meta.nftoken_id.length > 20) {
    return meta.nftoken_id;
  }

  // Parse AffectedNodes for CreatedNode of type NFTokenPage
  const nodes = meta.AffectedNodes || [];
  for (const node of nodes) {
    const created = node.CreatedNode;
    if (created?.LedgerEntryType === 'NFTokenPage') {
      // New page usually contains the just-minted token as the only (or last) entry
      const nfts = created.NewFields?.NFTokens || created.FinalFields?.NFTokens || [];
      if (Array.isArray(nfts) && nfts.length > 0) {
        // Take the last one (most recently added)
        const last = nfts[nfts.length - 1];
        if (last?.NFToken?.NFTokenID) return last.NFToken.NFTokenID;
      }
    }

    // Also check ModifiedNode for existing NFTokenPage that received a new token
    const modified = node.ModifiedNode;
    if (modified?.LedgerEntryType === 'NFTokenPage') {
      const finalNfts = modified.FinalFields?.NFTokens || [];
      const prevNfts = modified.PreviousFields?.NFTokens || [];
      if (finalNfts.length > prevNfts.length) {
        // Find the one that didn't exist before
        const prevIds = new Set(prevNfts.map((n: any) => n?.NFToken?.NFTokenID));
        for (const n of finalNfts) {
          const id = n?.NFToken?.NFTokenID;
          if (id && !prevIds.has(id)) return id;
        }
        // Fallback to last
        const last = finalNfts[finalNfts.length - 1];
        if (last?.NFToken?.NFTokenID) return last.NFToken.NFTokenID;
      }
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uuid, invoiceId } = body;

    if (!uuid) {
      return NextResponse.json({ error: 'Missing uuid' }, { status: 400 });
    }

    // 1. Get the signed payload from Xumm
    const payload = await xumm.payload.get(uuid);

    if (!payload?.meta?.signed) {
      return NextResponse.json({
        signed: false,
        expired: payload?.meta?.expired || false,
      });
    }

    const address = payload.response?.account;
    const txid = payload.response?.txid;

    if (!address || !txid) {
      return NextResponse.json(
        { error: 'Signed but missing account or txid' },
        { status: 400 }
      );
    }

    // 2. Fetch the full transaction from XRPL to extract NFTokenID
    await client.connect();
    let nftokenId: string | null = null;

    try {
      const txResponse = await client.request({
        command: 'tx',
        transaction: txid,
      });

      const meta = txResponse.result.meta as any;
      nftokenId = extractNFTokenID(meta);

      // Fallback: look at account_nfts and match by URI containing the invoiceId
      if (!nftokenId && invoiceId) {
        const nftsResponse = await client.request({
          command: 'account_nfts',
          account: address,
        });

        const nfts = nftsResponse.result.account_nfts || [];
        const expectedUriHex = Buffer.from(
          `https://ursadefi.com/invoice/${invoiceId}`
        ).toString('hex').toUpperCase();

        for (const nft of nfts) {
          const uri = (nft.URI || '').toUpperCase();
          if (uri.includes(expectedUriHex) || uri.includes(invoiceId.toUpperCase())) {
            nftokenId = nft.NFTokenID;
            break;
          }
        }

        // Absolute last resort: newest NFT on the account
        if (!nftokenId && nfts.length > 0) {
          nftokenId = nfts[nfts.length - 1].NFTokenID;
        }
      }
    } finally {
      try {
        await client.disconnect();
      } catch {}
    }

    if (!nftokenId) {
      return NextResponse.json({
        signed: true,
        address,
        txid,
        nftokenId: null,
        warning: 'Mint succeeded but could not extract NFTokenID yet. Try refreshing.',
      });
    }

    return NextResponse.json({
      signed: true,
      address,
      txid,
      nftokenId,
    });
  } catch (error: any) {
    console.error('resolve-mint error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resolve mint' },
      { status: 500 }
    );
  }
}
