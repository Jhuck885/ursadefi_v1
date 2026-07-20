'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useWallet } from '@/context/WalletContext';
import BrowserInvoicePDF from './BrowserInvoicePDF';
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
  const [mintStatus, setMintStatus] = useState<string | null>(null);
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
    try {
      const { data, error } = await supabaseBrowser
        .from('clients')
        .select('*')
        .eq('wallet_address', wallet.address)
        .order('created_at', { ascending: false });
      if (!error && data) setClients(data as Client[]);
    } catch (err) {
      console.warn('Supabase clients fetch failed (offline mode)', err);
    }
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
      const localClient = {
        id: 'local-' + Date.now(),
        name: newClientName.trim(),
        email: newClientEmail.trim() || undefined,
        address: newClientAddress.trim() || undefined,
        city_state: newClientPhone.trim() || undefined,
      };

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
        if (!error && data) {
          setClients(prev => [data as Client, ...prev]);
          setSelectedClientId(data.id);
          setValue('to', data.name);
        } else {
          setClients(prev => [localClient as Client, ...prev]);
          setSelectedClientId(localClient.id);
          setValue('to', localClient.name);
        }
      } catch {
        setClients(prev => [localClient as Client, ...prev]);
        setSelectedClientId(localClient.id);
        setValue('to', localClient.name);
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

  /** Save invoice to local + Supabase, return the saved Invoice object */
  const saveInvoice = async (formData: InvoiceFormData): Promise<Invoice | null> => {
    if (!formData.to || !formData.invoiceName) {
      alert('Please enter Invoice Name and Client');
      return null;
    }
    if (!wallet?.address) {
      alert('Please connect your wallet first');
      return null;
    }

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

    // localStorage first
    try {
      const existing = JSON.parse(localStorage.getItem('invoices') || '[]');
      localStorage.setItem('invoices', JSON.stringify([newInvoice, ...existing]));
      window.dispatchEvent(new Event('invoices-updated'));
    } catch (e) {
      console.error('localStorage save failed', e);
    }

    // Supabase best-effort
    try {
      await supabaseBrowser.from('invoices').insert([{
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
    } catch (e) {
      console.warn('Supabase insert failed (saved locally)', e);
    }

    onSuccess?.(newInvoice);
    return newInvoice;
  };

  const onSubmit: SubmitHandler<InvoiceFormData> = async (formData) => {
    setLoading(true);
    try {
      const inv = await saveInvoice(formData);
      if (inv) {
        alert('✅ Invoice saved!');
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
      }
    } finally {
      setLoading(false);
    }
  };

  /** Mint flow: save first, then mint with real invoice ID */
  const handleMint = async () => {
    const formValues = watch();
    const currentTotal = Number(formValues.total) || 0;

    if (currentTotal < 5) {
      alert('Minimum $5 to mint an NFT');
      return;
    }
    if (!formValues.invoiceName || !formValues.to) {
      alert('Please fill Invoice Name and Client before minting');
      return;
    }
    if (!wallet?.address) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setMintStatus('Saving invoice...');

    try {
      // 1. Save the invoice first so we have a real ID
      const invoice = await saveInvoice(formValues as InvoiceFormData);
      if (!invoice) {
        setLoading(false);
        setMintStatus(null);
        return;
      }

      // 2. Create Xaman mint payload (server-side)
      setMintStatus('Creating Xaman payload...');
      const res = await fetch('/api/xaman/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create mint payload');
      if (!data.next || !data.uuid) throw new Error('No Xaman deep link returned');

      // 3. Open Xaman
      setMintStatus('Open Xaman and approve the mint...');
      window.open(data.next, '_blank');

      // 4. Poll for result
      const uuid = data.uuid;
      let attempts = 0;
      const maxAttempts = 60;

      const poll = async (): Promise<void> => {
        attempts += 1;
        setMintStatus(`Waiting for signature... (${attempts})`);

        try {
          const resolveRes = await fetch('/api/xaman/resolve-mint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uuid, invoiceId: invoice.id }),
          });
          const resolveData = await resolveRes.json();

          if (resolveData.signed && resolveData.nftokenId) {
            // Success — save NFT ID
            setMintStatus('Minted! Saving NFT ID...');

            try {
              const existing: any[] = JSON.parse(localStorage.getItem('invoices') || '[]');
              const next = existing.map((i) =>
                i.id === invoice.id
                  ? { ...i, nftoken_id: resolveData.nftokenId, xrpl_tx_hash: resolveData.txid, status: 'minted' }
                  : i
              );
              localStorage.setItem('invoices', JSON.stringify(next));
            } catch {}

            try {
              await supabaseBrowser
                .from('invoices')
                .update({
                  nftoken_id: resolveData.nftokenId,
                  xrpl_tx_hash: resolveData.txid,
                  status: 'minted',
                })
                .eq('id', invoice.id);
            } catch {}

            window.dispatchEvent(new Event('invoices-updated'));
            setMintStatus(null);
            setLoading(false);
            alert(`Successfully minted!\n\nNFTokenID:\n${resolveData.nftokenId}`);

            // Reset form
            reset({
              invoiceName: '',
              to: '',
              description: '',
              amount: 0,
              total: 0,
              xrpAmount: 0,
              receiver: formValues.receiver,
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
            setSelectedClientId('');
            return;
          }

          if (resolveData.expired) {
            setMintStatus(null);
            setLoading(false);
            alert('Xaman payload expired. Please try again.');
            return;
          }

          if (attempts >= maxAttempts) {
            setMintStatus(null);
            setLoading(false);
            alert('Timed out waiting for signature. If you already signed, check the Activities feed — the NFT may still appear.');
            return;
          }

          setTimeout(poll, 2500);
        } catch (err) {
          console.error('Poll error', err);
          if (attempts < maxAttempts) setTimeout(poll, 2500);
          else {
            setMintStatus(null);
            setLoading(false);
          }
        }
      };

      setTimeout(poll, 4000);
    } catch (e: any) {
      console.error(e);
      setMintStatus(null);
      setLoading(false);
      alert(e.message || 'Mint failed');
    }
  };

  const pillButton =
    'flex-1 py-3.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-semibold rounded-full transition disabled:opacity-60';

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">INVOICE NAME</label>
          <input
            {...register('invoiceName', { required: 'Invoice name is required' })}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand-primary)]"
            placeholder="Project Alpha - Phase 1"
          />
          {errors.invoiceName && <p className="text-red-400 text-xs mt-1">{errors.invoiceName.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs text-[var(--text-secondary)]">TO (Client / Company)</label>
            <button
              type="button"
              onClick={() => setShowNewClientForm(!showNewClientForm)}
              className="px-3 py-1 text-xs font-medium border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] rounded-full transition">
              {showNewClientForm ? 'Cancel' : '+ New Client'}
            </button>
          </div>

          {clients.length > 0 && !showNewClientForm && (
            <select
              value={selectedClientId}
              onChange={(e) => handleClientSelect(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm mb-2 focus:outline-none focus:border-[var(--brand-primary)]"
            >
              <option value="">-- Select existing client --</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          )}

          {showNewClientForm && (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 mb-3 space-y-3">
              <input type="text" placeholder="Client / Company Name *" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm" />
              <input type="email" placeholder="Email (optional)" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm" />
              <input type="text" placeholder="Address (optional)" value={newClientAddress} onChange={(e) => setNewClientAddress(e.target.value)} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm" />
              <input type="text" placeholder="Phone (optional)" value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm" />
              <button type="button" onClick={handleAddNewClient} disabled={loading || !newClientName.trim()} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-full transition disabled:opacity-50">
                Save New Client
              </button>
            </div>
          )}

          <input
            {...register('to', { required: 'Client is required' })}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--brand-primary)]"
            placeholder="Client name or email"
          />
          {errors.to && <p className="text-red-400 text-xs mt-1">{errors.to.message}</p>}
        </div>

        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">DESCRIPTION (max 1500 characters)</label>
          <textarea
            {...register('description', { maxLength: 1500 })}
            rows={5}
            maxLength={1500}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm resize-y focus:outline-none focus:border-[var(--brand-primary)]"
            placeholder="Detailed description of work..."
          />
          <p className="text-[10px] text-[var(--text-muted)] text-right mt-1">{watch('description')?.length || 0}/1500</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">AMOUNT (USD)</label>
            <input
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true, required: true })}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">DUE DATE</label>
            <input type="date" {...register('dueDate')} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm" />
          </div>
        </div>

        {watchedAmount > 0 && (
          <div className="text-sm text-[var(--text-secondary)]">
            ≈ <span className="font-semibold text-[var(--text-primary)]">{watchedXrp.toFixed(2)} XRP</span> (auto)
          </div>
        )}

        {mintStatus && (
          <div className="text-sm text-[var(--brand-primary)] animate-pulse text-center py-1">
            {mintStatus}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button type="submit" disabled={loading} className={pillButton}>
            Save Invoice
          </button>
          <button type="button" onClick={handleMint} disabled={loading} className={pillButton}>
            {loading && mintStatus ? 'Minting...' : 'Mint as XRPL NFT'}
          </button>
        </div>

        <div className="text-[10px] text-[var(--text-muted)] text-center">
          Fee ~0.15% max • Non-custodial • Min $5 to mint • PDF + email ready
        </div>
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
