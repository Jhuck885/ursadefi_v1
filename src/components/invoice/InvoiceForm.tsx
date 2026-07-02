'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useWallet } from '@/context/WalletContext';
import BrowserInvoicePDF from './BrowserInvoicePDF';
import { mintInvoiceNFT } from '@/lib/xrpl';
import { Invoice } from '@/types';
import { supabaseBrowser } from '@/lib/supabase';

interface InvoiceFormData {
  invoiceName: string;
  to: string;
  description: string;
  amount: number;
  total: number;
  xrpAmount: number;
  receiver: string;
  dueDate: string;
}

interface Client {
  id: string;
  name: string;
  email?: string;
  address?: string;
  city_state?: string;
}

interface Props {
  onSuccess?: (data: Invoice) => void;
}

export default function InvoiceForm({ onSuccess }: Props = {}) {
  const { wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [xrpRate] = useState(2.45);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<InvoiceFormData>({
    defaultValues: {
      invoiceName: '',
      to: '',
      description: '',
      amount: 0,
      total: 0,
      xrpAmount: 0,
      receiver: process.env.NEXT_PUBLIC_XRPL_RECEIVER_ADDRESS || 'rNb4AKqA6QwhD8Nfff7rVxg5RPmyTE1vVn',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
  });

  const watchedAmount = watch('amount');
  const watchedXrp = watch('xrpAmount');

  // Fetch user's saved clients
  const fetchClients = async () => {
    if (!wallet?.address) return;

    const { data, error } = await supabaseBrowser
      .from('clients')
      .select('*')
      .eq('wallet_address', wallet.address)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setClients(data as Client[]);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [wallet?.address]);

  // Auto-fill when client is selected
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);

    if (!clientId) {
      setValue('to', '');
      return;
    }

    const selected = clients.find(c => c.id === clientId);
    if (selected) {
      setValue('to', selected.name);
      // You can expand this later to also set address/description if needed
    }
  };

  // Add new client
  const handleAddNewClient = async () => {
    if (!newClientName.trim() || !wallet?.address) {
      alert('Please enter a client name');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabaseBrowser
        .from('clients')
        .insert([{
          wallet_address: wallet.address,
          name: newClientName.trim(),
          email: newClientEmail.trim() || null,
        }])
        .select()
        .single();

      if (error) throw error;

      // Refresh clients list
      await fetchClients();

      // Auto-select the new client
      if (data) {
        setSelectedClientId(data.id);
        setValue('to', data.name);
      }

      // Reset new client form
      setNewClientName('');
      setNewClientEmail('');
      setShowNewClientForm(false);

      alert('Client added successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to add client');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const total = Number(watchedAmount) || 0;
    const xrpAmount = xrpRate > 0 ? total / xrpRate : 0;
    setValue('total', parseFloat(total.toFixed(2)));
    setValue('xrpAmount', parseFloat(xrpAmount.toFixed(6)));
  }, [watchedAmount, xrpRate, setValue]);

  const onSubmit: SubmitHandler<InvoiceFormData> = async (formData) => {
    if (!formData.to || !formData.invoiceName) {
      alert('Please enter Invoice Name and Client');
      return;
    }

    if (!wallet?.address) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);

    const newInvoice: Invoice = {
      id: 'INV-' + Date.now(),
      from: formData.invoiceName,
      to: formData.to,
      items: [{ desc: formData.description, qty: 1, price: formData.amount }],
      total: formData.total,
      xrpAmount: formData.xrpAmount,
      receiver: formData.receiver,
      dueDate: formData.dueDate,
      description: formData.description,
      status: 'draft',
      created_at: new Date().toISOString(),
      user_id: wallet.address,
    };

    try {
      const { error } = await supabaseBrowser
        .from('invoices')
        .insert([{
          id: newInvoice.id,
          wallet_address: wallet.address,
          from_name: newInvoice.from,
          to_name: newInvoice.to,
          items: newInvoice.items,
          total: newInvoice.total,
          xrp_amount: newInvoice.xrpAmount,
          receiver: newInvoice.receiver,
          due_date: newInvoice.dueDate,
          description: newInvoice.description,
          status: newInvoice.status,
        }]);

      if (error) throw error;

      const existing = JSON.parse(localStorage.getItem('invoices') || '[]');
      localStorage.setItem('invoices', JSON.stringify([newInvoice, ...existing]));

      window.dispatchEvent(new Event('invoices-updated'));

      onSuccess?.(newInvoice);
      alert('✅ Invoice saved to cloud!');

      reset({
        invoiceName: '',
        to: '',
        description: '',
        amount: 0,
        total: 0,
        xrpAmount: 0,
        receiver: formData.receiver,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });

      setSelectedClientId('');
      setShowNewClientForm(false);
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
      alert('Min $5 to mint');
      return;
    }

    const formValues = watch();
    const tempInvoice = {
      id: 'INV-' + Date.now(),
      from: formValues.invoiceName,
      to: formValues.to || 'Client',
      items: [{ desc: formValues.description, qty: 1, price: formValues.amount }],
      total: formValues.total || 0,
      xrpAmount: formValues.xrpAmount || 0,
      receiver: formValues.receiver,
      status: 'draft',
    };

    setLoading(true);
    try {
      await mintInvoiceNFT(tempInvoice);
      alert('Xaman opened — check your app to sign the mint!');
    } catch (e: any) {
      console.error(e);
      alert('Mint failed — check console or try again later');
    } finally {
      setLoading(false);
    }
  };

  const pillButton =
    'flex-1 py-3.5 bg-[#1D9BF0] hover:bg-[#1a8cd8] text-white font-semibold rounded-full transition disabled:opacity-60';

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Invoice Name */}
        <div>
          <label className="block text-xs text-zinc-400 mb-1">INVOICE NAME</label>
          <input
            {...register('invoiceName', { required: 'Invoice name is required' })}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1D9BF0]"
            placeholder="Project Alpha - Phase 1"
          />
          {errors.invoiceName && <p className="text-red-400 text-xs mt-1">{errors.invoiceName.message}</p>}
        </div>

        {/* Client Selection */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs text-zinc-400">TO (Client / Company)</label>
            <button
              type="button"
              onClick={() => setShowNewClientForm(!showNewClientForm)}
              className="text-xs text-[#1D9BF0] hover:underline"
            >
              {showNewClientForm ? 'Cancel' : '+ New Client'}
            </button>
          </div>

          {/* Client Dropdown */}
          {clients.length > 0 && !showNewClientForm && (
            <select
              value={selectedClientId}
              onChange={(e) => handleClientSelect(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm mb-2 focus:outline-none focus:border-[#1D9BF0]"
            >
              <option value="">-- Select existing client --</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          )}

          {/* New Client Form */}
          {showNewClientForm && (
            <div className="bg-zinc-950 border border-zinc-700 rounded-xl p-4 mb-3 space-y-3">
              <input
                type="text"
                placeholder="Client / Company Name *"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={newClientEmail}
                onChange={(e) => setNewClientEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm"
              />
              <button
                type="button"
                onClick={handleAddNewClient}
                disabled={loading || !newClientName.trim()}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
              >
                Save New Client
              </button>
            </div>
          )}

          {/* Manual TO input (always visible) */}
          <input
            {...register('to', { required: 'Client is required' })}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1D9BF0]"
            placeholder="Client name or email"
          />
          {errors.to && <p className="text-red-400 text-xs mt-1">{errors.to.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs text-zinc-400 mb-1">DESCRIPTION (max 1500 characters)</label>
          <textarea
            {...register('description', { maxLength: 1500 })}
            rows={5}
            maxLength={1500}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm resize-y focus:outline-none focus:border-[#1D9BF0]"
            placeholder="Detailed description of work..."
          />
          <p className="text-[10px] text-zinc-500 text-right mt-1">{watch('description')?.length || 0}/1500</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">AMOUNT (USD)</label>
            <input
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true, required: true })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:border-[#1D9BF0]"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">DUE DATE</label>
            <input type="date" {...register('dueDate')} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm" />
          </div>
        </div>

        {watchedAmount > 0 && (
          <div className="text-sm text-zinc-400">
            ≈ <span className="font-semibold text-white">{watchedXrp.toFixed(2)} XRP</span> (auto)
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button type="submit" disabled={loading} className={pillButton}>
            Save Invoice (Draft)
          </button>
          <button type="button" onClick={handleMint} disabled={loading} className={pillButton}>
            Mint as XRPL NFT (Testnet)
          </button>
        </div>

        <div className="text-[10px] text-zinc-500 text-center">Fee ~0.15% max • Non-custodial • PDF + email ready</div>
      </form>

      <div className="pt-1">
        <BrowserInvoicePDF
          invoice={{
            id: 'PREVIEW-' + Date.now(),
            from: watch('invoiceName') || 'Invoice',
            to: watch('to') || 'Client',
            items: [{ desc: watch('description') || '', qty: 1, price: watch('amount') || 0 }],
            total: watch('total') || 0,
            xrpAmount: watch('xrpAmount') || 0,
            receiver: watch('receiver'),
          } as Invoice}
        />
      </div>
    </div>
  );
}
