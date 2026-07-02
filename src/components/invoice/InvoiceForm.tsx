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
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

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

  const fetchClients = async () => {
    if (!wallet?.address) return;
    const { data, error } = await supabaseBrowser
      .from('clients')
      .select('*')
      .eq('wallet_address', wallet.address)
      .order('created_at', { ascending: false });
    if (!error && data) setClients(data as Client[]);
  };

  useEffect(() => { fetchClients(); }, [wallet?.address]);

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    if (!clientId) { setValue('to', ''); return; }
    const selected = clients.find(c => c.id === clientId);
    if (selected) setValue('to', selected.name);
  };

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
          address: newClientAddress.trim() || null,
          city_state: newClientPhone.trim() || null,
        }])
        .select()
        .single();
      if (error) throw error;
      await fetchClients();
      if (data) {
        setSelectedClientId(data.id);
        setValue('to', data.name);
      }
      setNewClientName(''); setNewClientEmail(''); setNewClientAddress(''); setNewClientPhone('');
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

  const onSubmit = async (formData) => { /* existing logic */ };

  const pillButton = 'flex-1 py-3.5 bg-[#1D9BF0] hover:bg-[#1a8cd8] text-white font-semibold rounded-full transition disabled:opacity-60';

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs text-zinc-400 mb-1">INVOICE NAME</label>
          <input {...register('invoiceName', { required: true })} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm" placeholder="Project Alpha - Phase 1" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs text-zinc-400">TO (Client / Company)</label>
            <button type="button" onClick={() => setShowNewClientForm(!showNewClientForm)} className="px-3 py-1 text-xs font-medium border border-zinc-700 hover:bg-zinc-900 rounded-full transition">
              {showNewClientForm ? 'Cancel' : '+ New Client'}
            </button>
          </div>

          {clients.length > 0 && !showNewClientForm && (
            <select value={selectedClientId} onChange={(e) => handleClientSelect(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm mb-2">
              <option value="">-- Select existing client --</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}

          {showNewClientForm && (
            <div className="bg-zinc-950 border border-zinc-700 rounded-2xl p-4 mb-3 space-y-3">
              <input type="text" placeholder="Client / Company Name *" value={newClientName} onChange={e => setNewClientName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm" />
              <input type="email" placeholder="Email (optional)" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm" />
              <input type="text" placeholder="Address (optional)" value={newClientAddress} onChange={e => setNewClientAddress(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm" />
              <input type="text" placeholder="Phone (optional)" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm" />
              <button type="button" onClick={handleAddNewClient} disabled={loading || !newClientName.trim()} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-full transition disabled:opacity-50">
                Save New Client
              </button>
            </div>
          )}

          <input {...register('to', { required: true })} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm" placeholder="Client name or email" />
        </div>

        {/* Keep other fields */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button type="submit" disabled={loading} className={pillButton}>Save Invoice (Draft)</button>
          <button type="button" onClick={handleMint} disabled={loading} className={pillButton}>Mint as XRPL NFT (Testnet)</button>
        </div>
      </form>

      <BrowserInvoicePDF invoice={{/* preview */}} />
    </div>
  );
}
