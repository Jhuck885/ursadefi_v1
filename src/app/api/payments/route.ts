import { Client, Transaction } from 'xrpl';
import { NextResponse } from 'next/server';

const RECEIVING_ADDRESS = process.env.NEXT_PUBLIC_XRPL_RECEIVER_ADDRESS || 'rNb4AKqA6QwhD8Nfff7rVxg5RPmyTE1vVn';
const XRPL_SERVER = process.env.XRPL_SERVER || 'wss://s.altnet.rippletest.net:51233/';

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
        const tx = transaction.tx as Transaction | undefined;
        return (
          tx &&
          tx.TransactionType === 'Payment' &&
          tx.Destination === RECEIVING_ADDRESS &&
          typeof tx.Amount === 'string' // XRP amount is in drops (string)
        );
      })
      .map((transaction: any) => {
        const tx = transaction.tx as Transaction;
        return {
          id: tx.hash,
          amount: Number(tx.Amount) / 1_000_000,
          date: new Date(
            Number(tx.date) * 1000 + 946684800000 // XRPL epoch (2000-01-01)
          ).toISOString(),
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
