// Zero private keys — Xaman only. Perfect NFTokenMint + NFTokenBurn for UrsaDeFi invoices.
import { Client } from 'xrpl';
import { XummSdk } from 'xumm-sdk';

const client = new Client('wss://s.altnet.rippletest.net:51233'); // testnet

const RECEIVER = process.env.NEXT_PUBLIC_XRPL_RECEIVER_ADDRESS || '';

const XUMM_API_KEY = process.env.NEXT_PUBLIC_XUMM_API_KEY || '';

export async function mintInvoiceNFT(invoice: any) {
  if (!XUMM_API_KEY) {
    throw new Error('XUMM API key not configured');
  }

  try {
    await client.connect();

    // Build clean NFTokenMint payload for Xaman
    const txjson: any = {
      TransactionType: 'NFTokenMint',
      Account: '', // Xaman will fill with connected wallet
      URI: Buffer.from(`https://ursadefi.com/invoice/${invoice.id}`).toString('hex'),
      NFTokenTaxon: 0,
      Flags: 0,
      Memos: [
        {
          Memo: {
            MemoType: Buffer.from('invoice').toString('hex'),
            MemoData: Buffer.from(JSON.stringify({
              id: invoice.id,
              to: invoice.to,
              total: invoice.total,
              xrpAmount: invoice.xrpAmount,
              description: invoice.description || '',
            })).toString('hex'),
          },
        },
      ],
    };

    const xumm = new XummSdk(XUMM_API_KEY);
    const payload = await xumm.payload.create({
      txjson,
      options: {
        submit: true,
      },
    });

    if (payload?.next?.always) {
      // Deep link to Xaman for signing
      window.open(payload.next.always, '_blank');
      return { success: true, payloadUuid: payload.uuid, message: 'Xaman opened — approve the mint in Xaman' };
    }

    throw new Error('Failed to create Xaman payload');
  } catch (e) {
    console.error('Mint error:', e);
    throw e;
  } finally {
    try { await client.disconnect(); } catch {}
  }
}

export async function burnInvoiceNFT(nftokenId: string) {
  if (!XUMM_API_KEY) {
    throw new Error('XUMM API key not configured');
  }

  try {
    await client.connect();

    const txjson: any = {
      TransactionType: 'NFTokenBurn',
      Account: '', // Xaman fills
      NFTokenID: nftokenId,
    };

    const xumm = new XummSdk(XUMM_API_KEY);
    const payload = await xumm.payload.create({
      txjson,
      options: { submit: true },
    });

    if (payload?.next?.always) {
      window.open(payload.next.always, '_blank');
      return { success: true, payloadUuid: payload.uuid, message: 'Xaman opened — approve the burn in Xaman' };
    }

    throw new Error('Failed to create burn payload');
  } catch (e) {
    console.error('Burn error:', e);
    throw e;
  } finally {
    try { await client.disconnect(); } catch {}
  }
}

// Helper to check if an account has a specific NFT (for future auto-update)
export async function getAccountNFTs(account: string) {
  try {
    await client.connect();
    const response = await client.request({
      command: 'account_nfts',
      account,
    });
    return response.result.account_nfts || [];
  } catch (e) {
    console.error('Error fetching NFTs:', e);
    return [];
  } finally {
    try { await client.disconnect(); } catch {}
  }
}
