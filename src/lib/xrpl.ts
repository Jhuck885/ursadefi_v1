// Zero private keys — Xaman only. Deferred NFTokenMint until paid.
import { Client } from 'xrpl';
import Xumm from 'xumm-sdk';  // ← default export (fixes the error)

const client = new Client('wss://s.altnet.rippletest.net:51233'); // testnet MVP, swap later
const RECEIVER = process.env.NEXT_PUBLIC_XRPL_RECEIVER_ADDRESS!;

export async function mintInvoiceNFT(invoice: any) {
  try {
    await client.connect();
    const tx = {
      TransactionType: 'NFTokenMint',
      Account: '', // Xaman fills
      URI: Buffer.from(`https://ursadefi.com/inv/${invoice.id}`).toString('hex'),
      NFTokenTaxon: 0,
      Memos: [{ Memo: { MemoData: Buffer.from(JSON.stringify(invoice)).toString('hex') } }]
    };

    const xumm = new Xumm(process.env.NEXT_PUBLIC_XUMM_API_KEY!); // add to Vercel env
    const payload = await xumm.payload.create({ tx_json: tx }, true);
    if (payload?.next?.always) {
      window.location.href = payload.next.always; // deep link auto-open
    }
    return payload;
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    client.disconnect();
  }
}