'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { useWallet } from '@/context/WalletContext';
import { supabaseBrowser } from '@/lib/supabase';
import BrowserInvoicePDF from './BrowserInvoicePDF';
import { mintInvoiceNFT } from '@/lib/xrpl';
import { Invoice } from '@/types';

interface InvoiceFormData {
  from: string;
  to: string;
  items: Array<{ desc: string; qty: number; price: number }>;
  total: number;
  xrpAmount: number;
  receiver: string;
  dueDate: string;
  description: string;
}

interface Props {
  onSuccess?: (data: Invoice) => void;
}

export default function InvoiceForm({ onSuccess }: Props = {}) {
  const { wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [xrpRate] = useState(2.45);

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<InvoiceFormData>({
    defaultValues: {
      from: wallet?.address ? `Wallet ${wallet.address.slice(0, 8)}...` : 'Your Business / Wallet',
      to: '',
      items: [{ desc: '', qty: 1, price: 0 }],
      total: 0,
      xrpAmount: 0,
      receiver: process.env.NEXT_PUBLIC_XRPL_RECEIVER_ADDRESS || 'rNb4AKqA6QwhD8Nfff7rVxg5RPmyTE1vVn',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: '',
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const watchedItems = watch('items');

  // Proper auto-calculation using useEffect + watch
  const calculateTotals = () => {
    const total = (watchedItems || []).reduce(
      (sum, item) => sum + (Number(item?.qty) || 0) * (Number(item?.price) || 0),
      0
    );
    const xrpAmount = xrpRate > 0 ? total / xrpRate : 0;

    setValue('total', parseFloat(total.toFixed(2)));
    setValue('xrpAmount', parseFloat(xrpAmount.toFixed(6)));
  };

  useEffect(() => {
    calculateTotals();
  }, [watchedItems, xrpRate, setValue]);

  const onSubmit: SubmitHandler<InvoiceFormData> = async (formData) => {
    if (!formData.to || !formData.items || formData.items.length === 0) {
      alert('Please add client and at least one line item');
      return;
    }

    setLoading(true);

    const newInvoice: Invoice = {
      id: 'INV-' + Date.now(),
      from: formData.from,
      to: formData.to,
      items: formData.items.map(i => ({ desc: i.desc, qty: Number(i.qty), price: Number(i.price) })),
      total: formData.total,
      xrpAmount: formData.xrpAmount,
      receiver: formData.receiver,
      dueDate: formData.dueDate,
      description: formData.description,
      status: 'draft',
      created_at: new Date().toISOString(),
      user_id: wallet?.address || 'demo-user',
    };

    try {
      const existing = JSON.parse(localStorage.getItem('invoices') || '[]');
      localStorage.setItem('invoices', JSON.stringify([newInvoice, ...existing]));

      onSuccess?.(newInvoice);
      alert('✅ Invoice saved! Check feed or modal.');

      reset({
        from: wallet?.address ? `Wallet ${wallet.address.slice(0, 8)}...` : 'Your Business / Wallet',
        to: '',
        items: [{ desc: '', qty: 1, price: 0 }],
        total: 0,
        xrpAmount: 0,
        receiver: formData.receiver,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: '',
      });
    } catch (e) {
      console.error(e);
      alert('Save failed — try again');
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async () => {
    const currentTotal = watch('total');
    if (!currentTotal || currentTotal < 5) {
      alert('Min $5 total to mint');
      return;
    }
    const formValues = watch();
    const tempInvoice = {
      id: 'INV-' + Date.now(),
      from: formValues.from,
      to: formValues.to || 'Client',
      items: formValues.items || [],
      total: formValues.total || 0,
      xrpAmount: formValues.xrpAmount || 0,
      receiver: formValues.receiver,
      status: 'draft',
    };

    setLoading(true);
    try {
      await mintInvoiceNFT(tempInvoice);
      alert('Xaman opened — sign the NFTokenMint on testnet!');
    } catch (e) {
      console.error(e);
      alert('Mint failed — check Xumm key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">FROM</label>
            <input
              {...register('from')}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1D9BF0]"
              placeholder="Your name or wallet"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">TO (Client / Company)</label>
            <input
              {...register('to', { required: 'Client name required' })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1D9BF0]"
              placeholder="Acme Corp or client@ email"
            />
            {errors.to && <p className="text-red-400 text-xs mt-1">{errors.to.message}</p>}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs text-zinc-400">LINE ITEMS</label>
            <button
              type="button"
              onClick={() => append({ desc: '', qty: 1, price: 0 })}
              className="text-xs px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-full"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-end bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <div className="col-span-5">
                  <input
                    {...register(`items.${index}.desc` as const, { required: true })}
                    placeholder="Description / service"
                    className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    {...register(`items.${index}.qty` as const, { valueAsNumber: true, min: 1 })}
                    placeholder="Qty"
                    className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-center"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.price` as const, { valueAsNumber: true, min: 0 })}
                    placeholder="Unit Price $"
                    className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-right"
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-400 hover:text-red-500 px-2"
                    disabled={fields.length === 1}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">TOTAL USD</label>
            <input type="number" step="0.01" {...register('total', { valueAsNumber: true })} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-lg font-semibold" readOnly />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">XRP AMOUNT (est. @ ${xrpRate})</label>
            <input type="number" step="0.000001" {...register('xrpAmount', { valueAsNumber: true })} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-lg font-semibold" readOnly />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">DUE DATE</label>
            <input type="date" {...register('dueDate')} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">NOTES / DESCRIPTION (optional)</label>
          <textarea {...register('description')} rows={2} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm resize-y" placeholder="Project scope, payment terms..." />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button type="submit" disabled={loading} className="flex-1 py-3.5 bg-white text-black font-semibold rounded-2xl hover:bg-zinc-200 transition disabled:opacity-60">
            {loading ? 'Saving...' : '💾 Save Invoice (Draft)'}
          </button>
          <button type="button" onClick={handleMint} disabled={loading} className="flex-1 py-3.5 border border-[#1D9BF0] text-[#1D9BF0] font-semibold rounded-2xl hover:bg-[#1D9BF0]/10 transition disabled:opacity-60">
            {loading ? 'Opening Xaman...' : '🔗 Mint as XRPL NFT (Testnet)'}
          </button>
        </div>

        <div className="text-[10px] text-zinc-500 text-center">Fee ~0.15% max • Non-custodial • PDF + email ready</div>
      </form>

      <BrowserInvoicePDF
        invoice={{
          id: 'PREVIEW-' + Date.now(),
          from: watch('from'),
          to: watch('to') || 'Client',
          items: watch('items') || [],
          total: watch('total') || 0,
          xrpAmount: watch('xrpAmount') || 0,
          receiver: watch('receiver'),
        } as Invoice}
      />
    </div>
  );
}