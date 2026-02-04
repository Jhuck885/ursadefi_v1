import { NextResponse } from 'next/server';
import { Client, Wallet, Payment } from 'xrpl';

const WALLET_SEED = process.env.XRPL_TEST_SEED!;
const SERVER = 'wss://s.altnet.rippletest.net:51233';
const BLACKHOLE = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';

export async function POST(request: Request) {
  console.log('🚀 Metadata API called — January 18, 2026');
  
  let client: Client | null = null;

  try {
    const body = await request.json();
    console.log('Body:', body);
    const { invoiceId, description = '', timestamp, clientName = 'Valued Client', amount_xrp = '0.00' } = body;

    if (!invoiceId || !timestamp) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    client = new Client(SERVER);
    await client.connect();
    console.log('✅ Connected to testnet');

    const wallet = Wallet.fromSeed(WALLET_SEED);
    console.log('Wallet address:', wallet.classicAddress);

    const memos = [
      {
        Memo: {
          MemoType: Buffer.from('UrsaDeFi_Invoice_ID', 'utf8').toString('hex').toUpperCase(),
          MemoFormat: Buffer.from('text/plain', 'utf8').toString('hex').toUpperCase(),
          MemoData: Buffer.from(String(invoiceId), 'utf8').toString('hex').toUpperCase(),
        },
      },
      {
        Memo: {
          MemoType: Buffer.from('Issuer_Company', 'utf8').toString('hex').toUpperCase(),
          MemoFormat: Buffer.from('text/plain', 'utf8').toString('hex').toUpperCase(),
          MemoData: Buffer.from('UrsaDeFi', 'utf8').toString('hex').toUpperCase(),
        },
      },
      {
        Memo: {
          MemoType: Buffer.from('Client_Name', 'utf8').toString('hex').toUpperCase(),
          MemoFormat: Buffer.from('text/plain', 'utf8').toString('hex').toUpperCase(),
          MemoData: Buffer.from(clientName, 'utf8').toString('hex').toUpperCase(),
        },
      },
      {
        Memo: {
          MemoType: Buffer.from('Description', 'utf8').toString('hex').toUpperCase(),
          MemoFormat: Buffer.from('text/plain', 'utf8').toString('hex').toUpperCase(),
          MemoData: Buffer.from(description, 'utf8').toString('hex').toUpperCase(),
        },
      },
      {
        Memo: {
          MemoType: Buffer.from('Amount_XRP', 'utf8').toString('hex').toUpperCase(),
          MemoFormat: Buffer.from('text/plain', 'utf8').toString('hex').toUpperCase(),
          MemoData: Buffer.from(String(amount_xrp), 'utf8').toString('hex').toUpperCase(),
        },
      },
      {
        Memo: {
          MemoType: Buffer.from('Timestamp', 'utf8').toString('hex').toUpperCase(),
          MemoFormat: Buffer.from('text/plain', 'utf8').toString('hex').toUpperCase(),
          MemoData: Buffer.from(timestamp, 'utf8').toString('hex').toUpperCase(),
        },
      },
    ];

    const payment: Payment = {
      TransactionType: 'Payment',
      Account: wallet.classicAddress,
      Destination: BLACKHOLE,
      Amount: '1',
      Memos: memos,
    };

    console.log('Autofilling for sequence/fee...');
    const prepared = await client.autofill(payment);
    console.log('Autofilled — sequence:', prepared.Sequence ?? 'unknown', 'fee:', prepared.Fee ?? 'unknown');

    console.log('Signing...');
    const signed = wallet.sign(prepared);
    console.log('Signed hash:', signed.hash);

    console.log('Submitting and waiting...');
    const result = await client.submitAndWait(signed.tx_blob);
    console.log('Full result:', JSON.stringify(result, null, 2));

    const meta = result.result?.meta;
    const txResult = typeof meta === 'object' && meta !== null && 'TransactionResult' in meta
      ? meta.TransactionResult
      : 'UNKNOWN';

    if (txResult === 'tesSUCCESS') {
      console.log('METADATA SUCCESS — description on-chain, hash:', signed.hash);
      return NextResponse.json({ txHash: signed.hash });
    } else {
      console.log('Submit failed:', txResult);
      throw new Error(txResult);
    }
  } catch (err) {
    console.error('❌ METADATA ERROR:', err);
    return NextResponse.json({ error: (err as Error).message || 'Failed' }, { status: 500 });
  } finally {
    if (client) {
      await client.disconnect().catch(() => {});
      console.log('Disconnected');
    }
  }
}
