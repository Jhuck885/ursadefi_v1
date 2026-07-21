'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useWallet } from '@/context/WalletContext';
import BrowserInvoicePDF from './BrowserInvoicePDF';
import { Invoice } from '@/types';
import { supabaseBrowser } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';
import {
  MIN_INVOICE_USD,
  MIN_MINT_USD,
  PLATFORM_FEE_RATE,
  PLATFORM_FEE_PERCENT_LABEL,
  MIN_PLATFORM_FEE_USD,
  calcPlatformFee,
} from '@/lib/constants';

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
  const { success, error, warning, info } = useToast();
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
      receiver: process.env.NEXT_PUBLIC_XRPL_RECEIVER_ADDRESS || '',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
  });

  const watchedAmount = watch('amount');
  const watchedXrp = watch('xrpAmount');

  const subtotal = Number(watchedAmount) || 0;
  const platformFee = useMemo(() => calcPlatformFee(subtotal), [subtotal]);
  const amountDue = useMemo(
    () => (subtotal > 0 ? parseFloat((subtotal + platformFee).toFixed(2)) : 0),
    [subtotal, platformFee]
  );

  const fetchClients = async () => {
    if (!wallet?.address) return;
    try {
      const { data, error: err } = await supabaseBrowser
        .from('clients')
        .select('*')
        .eq('wallet_address', wallet.address)
        .order('created_at', { ascending: false });
      if (!err && data) setClients(data as Client[]);
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
      warning('Please enter a client name');
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
        const { data, error: err } = await supabaseBrowser
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
        if (!err && data) {
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
      success('Client added');
    } catch (e) {
      console.error(e);
      error('Failed to add client');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fee = calcPlatformFee(subtotal);
    const due = subtotal > 0 ? parseFloat((subtotal + fee).toFixed(2)) : 0;
    const xrpAmount = xrpRate > 0 && due > 0 ? due / xrpRate : 0;
    setValue('total', due);
    setValue('xrpAmount', parseFloat(xrpAmount.toFixed(6)));
  }, [subtotal, xrpRate, setValue]);

  const saveInvoice = async (formData: InvoiceFormData): Promise<Invoice | null> => {
    if (!formData.to || !formData.invoiceName) {
      warning('Please enter Invoice Name and Client');
      return null;
    }
    if (!wallet?.address) {
      warning('Please connect your wallet first');
      return null;
    }

    const serviceAmount = Number(formData.amount) || 0;
    if (serviceAmount < MIN_INVOICE_USD) {
      warning(`Minimum invoice amount is $${MIN_INVOICE_USD}`);
      return null;
    }

    const fee = calcPlatformFee(serviceAmount);
    const due = parseFloat((serviceAmount + fee).toFixed(2));
    const xrpAmount = xrpRate > 0 ? parseFloat((due / xrpRate).toFixed(6)) : 0;

    const newInvoice: Invoice = {
      id: 'INV-' + Date.now(),
      from: formData.invoiceName,
      to: formData.to,
      items: [{ desc: formData.description, qty: 1, price: serviceAmount }],
      subtotal: serviceAmount,
      platformFee: fee,
      feeRate: PLATFORM_FEE_RATE,
      total: due,
      xrpAmount,
      receiver: formData.receiver,
      dueDate: formData.dueDate,
      description: formData.description,
      status: 'draft',
      created_at: new Date().toISOString(),
      user_id: wallet.address,
    };

    try {
      const existing = JSON.parse(localStorage.getItem('invoices') || '[]');
      localStorage.setItem('invoices', JSON.stringify([newInvoice, ...existing]));
      window.dispatchEvent(new Event('invoices-updated'));
    } catch (e) {
      console.error('localStorage save failed', e);
    }

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

  const triggerPlatformFeePayment = async (invoice: Invoice) => {
    try {
      setMintStatus('Creating platform fee payment...');
      const res = await fetch('/api/xaman/pay-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.warn('Fee payment payload failed:', data.error);
        warning('Mint succeeded. Platform fee payment could not be created automatically.');
        return;
      }

      if (data.next) {
        setMintStatus('Approve platform fee in Xaman...');
        info(`Approve platform fee of $${data.feeUsd?.toFixed(2) || '0.25'} in Xaman`);
        window.open(data.next, '_blank');
      }
    } catch (err) {
      console.warn('Auto fee payment error:', err);
      warning('Mint succeeded. Please pay the platform fee manually if prompted.');
    }
  };

  const onSubmit: SubmitHandler<InvoiceFormData> = async (formData) => {
    setLoading(true);
    try {
      const inv = await saveInvoice(formData);
      if (inv) {
        success('Invoice saved');
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

  const handleMint = async () => {
    const formValues = watch();
    const serviceAmount = Number(formValues.amount) || 0;

    if (serviceAmount < MIN_MINT_USD) {
      warning(`Minimum $${MIN_MINT_USD} service amount to mint an NFT`);
      return;
    }
    if (!formValues.invoiceName || !formValues.to) {
      warning('Please fill Invoice Name and Client before minting');
      return;
    }
    if (!wallet?.address) {
      warning('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setMintStatus('Saving invoice...');

    try {
      const invoice = await saveInvoice(formValues as InvoiceFormData);
      if (!invoice) {
        setLoading(false);
        setMintStatus(null);
        return;
      }

      setMintStatus('Creating Xaman payload...');
      const res = await fetch('/api/xaman/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create mint payload');
      if (!data.next || !data.uuid) throw new Error('No Xaman deep link returned');

      setMintStatus('Open Xaman and approve the mint...');
      info('Open Xaman and approve the mint');
      window.open(data.next, '_blank');

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
            success(`Minted successfully · ${resolveData.nftokenId.slice(0, 12)}…`);

            // === AUTOMATIC PLATFORM FEE PAYMENT (Option A) ===
            await triggerPlatformFeePayment({
              ...invoice,
              nftoken_id: resolveData.nftokenId,
              status: 'minted',
            });

            setMintStatus(null);
            setLoading(false);

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
            error('Xaman payload expired. Please try again.');
            return;
          }

          if (attempts >= maxAttempts) {
            setMintStatus(null);
            setLoading(false);
            warning('Timed out waiting for signature. Check Activity if you already signed.');
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
      error(e.message || 'Mint failed');
    }
  };

  const pillButton =
    'flex-1 py-3.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-semibold rounded-full transition disabled:opacity-60';

  const belowInvoiceMin = subtotal > 0 && subtotal < MIN_INVOICE_USD;
  const belowMintMin = subtotal > 0 && subtotal < MIN_MINT_USD;

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
              className="px-3 py-1 text-xs font-medium rounded-full transition border border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white"
            >
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
              <button
                type="button"
                onClick={handleAddNewClient}
                disabled={loading || !newClientName.trim()}
                className="w-full py-2.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-semibold rounded-full transition disabled:opacity-50"
              >
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
            <label className="block text-xs text-[var(--text-secondary)] mb-1">SERVICE AMOUNT (USD)</label>
            <input
              type="number"
              step="0.01"
              min={MIN_INVOICE_USD}
              {...register('amount', {
                valueAsNumber: true,
                required: true,
                min: { value: MIN_INVOICE_USD, message: `Minimum $${MIN_INVOICE_USD}` },
              })}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:border-[var(--brand-primary)]"
            />
            {belowInvoiceMin && (
              <p className="text-amber-400 text-xs mt-1">Minimum service amount is ${MIN_INVOICE_USD}</p>
            )}
            {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>}
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">DUE DATE</label>
            <input type="date" {...register('dueDate')} className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm" />
          </div>
        </div>

        {subtotal > 0 && (
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 space-y-2 text-sm">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Service subtotal</span>
              <span className="text-[var(--text-primary)] font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>
                Platform fee ({PLATFORM_FEE_PERCENT_LABEL}, min ${MIN_PLATFORM_FEE_USD.toFixed(2)})
              </span>
              <span className="text-[var(--text-primary)] font-medium">${platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[var(--border-color)] font-semibold text-[var(--text-primary)]">
              <span>Amount due</span>
              <span>${amountDue.toFixed(2)}</span>
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              ≈ {watchedXrp.toFixed(2)} XRP (auto) · Shown on invoice for client transparency
            </div>
          </div>
        )}

        {mintStatus && (
          <div className="text-sm text-[var(--brand-primary)] animate-pulse text-center py-1">
            {mintStatus}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button type="submit" disabled={loading || belowInvoiceMin} className={pillButton}>
            Save Invoice
          </button>
          <button type="button" onClick={handleMint} disabled={loading || belowMintMin} className={pillButton}>
            {loading && mintStatus ? 'Minting...' : 'Mint as XRPL NFT'}
          </button>
        </div>

        <div className="text-[10px] text-[var(--text-muted)] text-center">
          Fee {PLATFORM_FEE_PERCENT_LABEL} (min ${MIN_PLATFORM_FEE_USD.toFixed(2)}) · Non-custodial · Min ${MIN_INVOICE_USD} · ${MIN_MINT_USD} to mint
        </div>
      </form>

      <div className="pt-1">
        <BrowserInvoicePDF
          invoice={{
            id: 'PREVIEW-' + Date.now(),
            from: watch('invoiceName') || 'Invoice',
            to: watch('to') || 'Client',
            items: [{ desc: watch('description') || 'Professional services', qty: 1, price: subtotal }],
            subtotal,
            platformFee,
            feeRate: PLATFORM_FEE_RATE,
            total: amountDue,
            xrpAmount: watch('xrpAmount') || 0,
            receiver: watch('receiver'),
            description: watch('description') || '',
          } as Invoice}
        />
      </div>
    </div>
  );
}
