'use client';
import { useState, useEffect } from 'react';
import InvoiceForm from '@/components/invoice/InvoiceForm';
import { Client } from 'xrpl';

interface FormattedPayment {
  amount: number;
  date: string;
  hash: string;
  tag: number | null;
}

const PriceCard = ({ coinId, label }: { coinId: string; label: string }) => {
  const [price, setPrice] = useState<number | null>(null);
  const [change, setChange] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
        );
        if (res.ok) {
          const data = await res.json();
          const coin = data[coinId];
          setPrice(coin.usd);
          setChange(coin.usd_24h_change);
        }
      } catch (err) {
        console.error(`${label} price fetch failed`, err);
        setPrice(null);
        setChange(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, [coinId, label]);

  if (loading) {
    return (
      <div className="mb-4 p-4 bg-[#1e293b] rounded-xl border border-[#1D9BF0]/30">
        <div className="text-sm text-gray-400">{label} Price (Live)</div>
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  const isUp = change !== null && change > 0;
  const arrow = isUp ? '↑' : '↓';
  const color = isUp ? 'text-green-500' : 'text-red-500';

  return (
    <div className="mb-4 p-4 bg-[#1e293b] rounded-xl border border-[#1D9BF0]/30">
      <div className="text-sm text-gray-400 mb-1">{label} Price (Live)</div>
      <div className="text-2xl font-bold text-white">
        ${price?.toFixed(2) || '—.--'}
        {change !== null && (
          <span className={`ml-2 text-lg ${color}`}>
            {arrow} {Math.abs(change).toFixed(2)}%
          </span>
        )}
      </div>
      <div className="text-xs text-gray-500 mt-1">Powered by CoinGecko</div>
    </div>
  );
};

const XRPPriceCard = () => <PriceCard coinId="ripple" label="XRP Price" />;
const BTCPriceCard = () => <PriceCard coinId="bitcoin" label="BTC Price" />;

const RecentPaymentsCard = () => {
  const [payments, setPayments] = useState<FormattedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const RECEIVING_ADDRESS = process.env.NEXT_PUBLIC_XRPL_RECEIVER_ADDRESS || 'rNb4AKqA6QwhD8Nfff7rVxg5RPmyTE1vVn';

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const client = new Client('wss://s.altnet.rippletest.net:51233');
        await client.connect();
        const response = await client.request({
          command: 'account_tx',
          account: RECEIVING_ADDRESS,
          limit: 10,
          ledger_index_min: -1,
          ledger_index_max: -1,
          forward: false,
        });

        const transactions = response.result.transactions || [];

        const filteredTransactions = transactions.filter((tx: any) =>
          tx.tx?.TransactionType === 'Payment' &&
          tx.tx?.Destination === RECEIVING_ADDRESS &&
          tx.validated === true
        ).slice(0, 5);

        const formatted = filteredTransactions.map((tx: any) => {
          const txData = tx.tx;
          const amountDrops = typeof txData?.Amount === 'string' ? Number(txData.Amount) : 0;
          const amountXRP = amountDrops / 1000000;
          const xrplTime = txData?.date || 0;
          const unixTime = (xrplTime + 946684800) * 1000;
          const date = new Date(unixTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

          return {
            amount: amountXRP,
            date,
            hash: txData?.hash || '',
            tag: txData?.DestinationTag || null,
          };
        });

        setPayments(formatted);
        await client.disconnect();
      } catch (err: unknown) {
        console.error('Payments fetch failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
    const interval = setInterval(fetchPayments, 60000);
    return () => clearInterval(interval);
  }, [RECEIVING_ADDRESS]);

  if (loading) return <p className="text-gray-500 mb-8">Loading recent payments...</p>;
  if (payments.length === 0) return <p className="text-gray-500 mb-8">No recent payments</p>;

  return (
    <div className="mb-8 space-y-3">
      {payments.map((p) => (
        <div key={p.hash} className="p-3 bg-[#1e293b] rounded-lg border border-[#1D9BF0]/30">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-white">+{p.amount.toFixed(2)} XRP</span>
            <span className="text-sm text-gray-400">{p.date}</span>
          </div>
          {p.tag && <span className="text-xs text-gray-400">Tag: {p.tag}</span>}
          <a
            href={`https://test.bithomp.com/explorer/${p.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 text-xs text-[#1D9BF0] hover:underline"
          >
            View transaction
          </a>
        </div>
      ))}
    </div>
  );
};

export default function RightSidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInvoiceSuccess = () => {
    setIsModalOpen(false);
    alert('✅ Invoice created successfully! Saved to cloud.');
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <XRPPriceCard />
      <BTCPriceCard />

      <h2 className="text-xl font-bold mb-4">Tax Overview</h2>
      <div className="bg-[#16181c] rounded-xl p-4 mb-6 border border-yellow-600">
        <p className="text-sm text-gray-400">Next est. payment</p>
        <p className="text-2xl font-bold">$6,283</p>
        <p className="text-sm text-gray-400">Apr 15, 2026</p>
        <p className="text-yellow-500 text-sm mt-2">Upcoming</p>
      </div>

      <h3 className="text-lg font-bold mb-4">Recent Payments</h3>
      <RecentPaymentsCard />

      <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full py-4 bg-[#1D9BF0] rounded-full font-bold hover:bg-[#1a8cd8] transition"
      >
        Create New Invoice
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-[#16181c] rounded-3xl p-8 w-full max-w-lg h-[95vh] overflow-y-auto border border-gray-800 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white text-2xl"
            >
              &times;
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold">Create New Invoice</h2>
              <p className="text-gray-400 text-sm">Fill in the details below</p>
            </div>

            <InvoiceForm onSuccess={handleInvoiceSuccess} />
          </div>
        </div>
      )}
    </div>
  );
}
