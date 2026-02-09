'use client';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { useWallet } from '@/context/WalletContext';
import { QRCodeCanvas } from 'qrcode.react';
import { Client } from 'xrpl';

interface InvoiceData {
  invoiceNumber: string;
  clientName: string;
  amount: number;
  currency: string;
  memo?: string;
  description?: string;
  dueDate?: string;
}

interface InvoiceFormProps {
  onSuccess: () => void;
}

export default function InvoiceForm({ onSuccess }: InvoiceFormProps) {
  const { wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [invoiceDbId, setInvoiceDbId] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<InvoiceData>({
    defaultValues: {
      currency: 'XRP',
      amount: 0,
    }
  });

  const generateMintQR = async (data: InvoiceData) => {
    setLoading(true);
    setError('');

    try {
      const client = new Client('wss://s.altnet.rippletest.net:51233');
      await client.connect();

      const invoiceJson = JSON.stringify({
        invoice_id: data.invoiceNumber,
        client: data.clientName,
        amount: data.amount,
        currency: data.currency,
        description: data.description || '',
        due_date: data.dueDate || '',
        memo: data.memo || '',
      });

      const uri = Buffer.from(invoiceJson).toString('hex').toUpperCase();

      const prepared = await client.autofill({
        TransactionType: 'NFTokenMint',
        Account: wallet.address,
        URI: uri,
        Flags: 1,
        NFTokenTaxon: 0,
      });

      await client.disconnect();

      const payload = {
        txjson: prepared,
      };

      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const qrCodeUrl = `https://xumm.app/sign/${base64Payload}`;

      setQrUrl(qrCodeUrl);

      const { data: inserted, error: dbError } = await supabaseBrowser
        .from('invoices')
        .insert({
          wallet_address: wallet.address,
          invoice_id: data.invoiceNumber,
          to_wallet: wallet.address,
          amount: data.amount,
          currency: data.currency,
          memo: data.memo,
          description: data.description,
          due_date: data.dueDate,
          status: 'pending'
        })
        .select('id')
        .single();

      if (dbError) throw dbError;

      setInvoiceDbId(inserted.id);
      alert(`Invoice saved! Scan QR to mint NFToken on-chain. Polling for confirmation...`);
    } catch (err: any) {
      setError(err.message || 'Failed to prepare mint');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!qrUrl || !invoiceDbId) return;

    const interval = setInterval(async () => {
      try {
        const client = new Client('wss://s.altnet.rippletest.net:51233');
        await client.connect();

        const response = await client.request({
          command: 'account_nfts',
          account: wallet.address,
        });

        await client.disconnect();

        const nfts = response.result.account_nfts || [];

        if (nfts.length > 0) {
          const latestNft = nfts[0];
          const nftId = latestNft.NFTokenID;

          const { error } = await supabaseBrowser
            .from('invoices')
            .update({ nftoken_id: nftId, status: 'minted' })
            .eq('id', invoiceDbId);

          if (error) throw error;

          alert(`NFToken minted! ID: ${nftId}`);
          onSuccess();
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [qrUrl, invoiceDbId, wallet, onSuccess]);

  const handleMintToXRPL = () => {
    const testNftokenId = '00000000' + Date.now().toString(16).toUpperCase().padStart(56, '0');
    alert(`Demo mint complete! Fake NFTokenID: ${testNftokenId}`);
    onSuccess();
  };

  const onSubmit = async (data: InvoiceData) => {
    if (!wallet) {
      setError('Wallet not connected');
      return;
    }

    await generateMintQR(data);
  };

  return (
    <div className="space-y-6">
      {!qrUrl ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="invoiceNumber" className="block text-sm font-medium mb-1">Invoice Number</label>
            <input
              id="invoiceNumber"
              {...register('invoiceNumber', { required: 'Invoice number is required' })}
              className="w-full p-3 bg-[#1e293b] rounded-lg border border-gray-700 focus:border-[#1D9BF0] outline-none font-mono placeholder:text-gray-500 text-white"
              placeholder="INV-XYZ"
            />
            {errors.invoiceNumber && <p className="text-red-400 text-xs mt-1">{errors.invoiceNumber.message}</p>}
          </div>

          <div>
            <label htmlFor="clientName" className="block text-sm font-medium mb-1">Client Name</label>
            <input
              id="clientName"
              {...register('clientName', { required: 'Client name is required' })}
              className="w-full p-3 bg-[#1e293b] rounded-lg border border-gray-700 focus:border-[#1D9BF0] outline-none placeholder:text-gray-500 text-white"
              placeholder="Acme Corp"
            />
            {errors.clientName && <p className="text-red-400 text-xs mt-1">{errors.clientName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium mb-1">Amount</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                {...register('amount', { required: true, valueAsNumber: true })}
                className="w-full p-3 bg-[#1e293b] rounded-lg border border-gray-700 focus:border-[#1D9BF0] outline-none text-white"
                placeholder="0.00"
              />
            </div>
            <div>
              <label htmlFor="currency" className="block text-sm font-medium mb-1">Currency</label>
              <select
                id="currency"
                {...register('currency')}
                className="w-full p-3 bg-[#1e293b] rounded-lg border border-gray-700 focus:border-[#1D9BF0] outline-none text-white"
                >
                <option value="XRP">XRP</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium mb-1">Due Date (optional)</label>
            <input
              id="dueDate"
              type="date"
              {...register('dueDate')}
              className="w-full p-3 bg-[#1e293b] rounded-lg border border-gray-700 focus:border-[#1D9BF0] outline-none text-white"
            />
          </div>

          <div>
            <label htmlFor="memo" className="block text-sm font-medium mb-1">Memo / Invoice Note (optional)</label>
            <input
              id="memo"
              {...register('memo')}
              className="w-full p-3 bg-[#1e293b] rounded-lg border border-gray-700 focus:border-[#1D9BF0] outline-none text-white"
              placeholder="Payment for services"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description (optional)</label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className="w-full p-3 bg-[#1e293b] rounded-lg border border-gray-700 focus:border-[#1D9BF0] outline-none resize-y text-white placeholder:text-gray-500"
              placeholder="Detailed description of the invoice"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#1D9BF0] rounded-full font-bold hover:bg-[#1a8cd8] transition disabled:opacity-50"
          >
            {loading ? 'Preparing...' : 'Create & Mint Invoice'}
          </button>
        </form>
      ) : (
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-300">Scan with Xaman to mint NFToken on-chain</p>
          <div className="inline-block p-4 bg-white rounded-2xl">
            <QRCodeCanvas value={qrUrl} size={220} />
          </div>
          <button
            onClick={handleMintToXRPL}
            className="w-full py-4 bg[#1D9BF0] rounded-full font-bold hover:bg[#1a8cd8] transition"
          >
            Mint Invoice to XRPL
          </button>
          <button
            onClick={() => setQrUrl('')}
            className="text-xs text-gray-500 hover:text-white"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
