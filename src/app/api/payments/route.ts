import { Client, Transaction } from 'xrpl';
import { NextResponse } from 'next/server';
import { parseXrplAmount } from '@/lib/stablecoins';

const RECEIVING_ADDRESS = process.env.NEXT_PUBLIC_XRPL_RECEIVER_ADDRESS || 'rNb4AKqA6QwhD8Nfff7rVxg5RPmyTE1vVn';
const XRPL_SERVER = process.env.XRPL_SERVER || process.env.NEXT_PUBLIC_XRPL_SERVER || 'wss://xrplcluster.com';

export async function GET() {
  const client = new Client(XRPL_SERVER);
  try {
    await client.connect();

    const response = await client.request({
      command: 'account_tx',
      account: RECEIVING_ADDRESS,
      limit: 50,
      ledger_index_max: -1,
      ledger_index_min: -1,
      forward: false,
    });

    const txs = response.result.transactions
      .filter((transaction: any) => {
        const tx = (transaction.tx || transaction.tx_json) as Transaction | undefined;
        return tx && tx.TransactionType === 'Payment' && (tx as any).Destination === RECEIVING_ADDRESS;
      })
      .map((transaction: any) => {
        const tx = (transaction.tx || transaction.tx_json) as any;
        const parsed = parseXrplAmount(tx.Amount);
        return {
          id: tx.hash,
          amount: parsed.value,
          asset: parsed.assetId,
          date: new Date(Number(tx.date) * 1000 + 946684800000).toISOString(),
        };
      });

    return NextResponse.json(txs);
  } catch (error) {
    console.error('Payments error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  } finally {
    await client.disconnect();
  }
}
