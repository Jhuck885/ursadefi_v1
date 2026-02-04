'use client';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import { useWallet } from '@/context/WalletContext';

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
  const { wallet } from useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<InvoiceData>({
    defaultValues: {
      currency: 'XRP',
      amount: 0,
    }
  });

  const onSubmit = async (data: InvoiceData) => {
    if (!wallet) {
      setError('Wallet not connected');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: dbError } = await supabaseBrowser
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
        });

      if (dbError) throw dbError;

      alert(`✅ Invoice created!\nNumber: ${data.invoiceNumber}`);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Test text to confirm component renders */}
      <p className="text-green-400 font-bold">Form component loaded — fields below</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="invoiceNumber" className="block text-sm font-medium mb-1">Invoice Number</label>
          <input
            id="invoiceNumber"
            {...register('invoiceNumber', { required: 'Invoice number is required' })}
            className="w-full p-3 bg-[#1e293b] rounded-lg border border-gray-700 focus:border-[#1D9BF0] outline-none font-mono placeholder:text-gray-500"
            placeholder="INV-XYZ"
          />
          {errors.invoiceNumber && <p className="text-red-400 text-xs mt-1">{errors.invoiceNumber.message}</p>}
        </div>

        <div>
          <label htmlFor="clientName" className="block text-sm font-medium mb-1">Client Name</label>
          <input
            id="clientName"
            {...register('clientName', { required: 'Client name is required' })}
            className="w-full p-3 bg-[#1e293b] rounded-lg border border-gray-700 focus:border-[#1D9BF0] outline-none placeholder:text-gray-500"
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
              className="w-full p-3 bg-[#1e293b] rounded-lg border border-gray-700 focus:border-[#1D9BF0] outline-none"
              placeholder="0.00"
            />
          </div>
          <div>
            <label htmlFor="currency" className="block text-sm font-medium mb-1">Currency</label>
            <select
              id="currency"
              {...register('currency')}
              className="w-full p-3 bg-[#1e293b] rounded-lg border border-gray-700 focus:border-[#1D9BF0] outline-none"
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
            className="w-full p-3 bg-[#1e293b] rounded-lg border border-gray-700 focus:border-[#1D9BF0] outline-none"
          />
        </div>

        <div>
          <label htmlFor="memo" className="block text-sm font-medium mb-1">Memo / Invoice Note (optional)</label>
          <input
            id="memo"
            {...register('memo')}
            className="w-full p-3 bg-[#1e293b] rounded-lg border border-gray-700 focus:border-[#1D9BF0] outline-none"
            placeholder="Payment for services"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">Description (optional)</label>
          <textarea
            id="description"
            {...register('description')}
            rows={3}
            className="w-full p-3 bg-[#1e293b] rounded-lg border border-gray-700 focus:border-[#1D9BF0] outline-none resize-y"
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
          className="w-full py-4 bg-[#1D9BF0] hover:bg-[#1a8cd8] disabled:opacity-50 rounded-full font-semibold text-lg transition"
        >
          {loading ? 'Creating Invoice...' : 'Create Invoice'}
        </button>
      </form>
    </div>
  );
}
