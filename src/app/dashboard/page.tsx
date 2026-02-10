'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { supabaseBrowser } from '@/lib/supabase';

interface Invoice {
  id: string;
  invoice_id: string;
  to_wallet: string;
  amount: number;
  currency: string;
  memo?: string;
  description?: string;
  status: string;
  created_at: string;
  due_date?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { wallet, disconnect, isReady } = useWallet();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isReady && !wallet) {
      router.replace('/login');
    }
  }, [isReady, wallet, router]);

  const fetchInvoices = async () => {
    if (!wallet) return;
    setLoading(true);
    try {
      const { data, error } = await supabaseBrowser
        .from('invoices')
        .select('*')
        .eq('wallet_address', wallet.address)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setInvoices(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallet) fetchInvoices();
  }, [wallet]);

  useEffect(() => {
    const handleFocus = () => {
      if (wallet) fetchInvoices();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [wallet]);

  const handleViewPDF = async (invoice: Invoice) => {
    setPdfLoading(invoice.invoice_id);
    try {
      const response = await fetch('https://ursadefi-pdf-service-1.onrender.com/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: invoice.invoice_id,
          client_name: invoice.description || 'Client',
          amount: invoice.amount,
          currency: invoice.currency,
          description: invoice.description || '',
          due_date: invoice.due_date || '',
          memo: invoice.memo || '',
          to_wallet: invoice.to_wallet
        })
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoice_id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to generate PDF: ' + err.message);
    } finally {
      setPdfLoading(null);
    }
  };

  const handleShareOnX = (invoice: Invoice) => {
    const text = `Invoice #${invoice.invoice_id} for ${invoice.amount} ${invoice.currency} on UrsaDeFi! #XRP #XRPL`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleEmailInvoice = async (invoice: Invoice) => {
    await handleViewPDF(invoice);
    const subject = `UrsaDeFi Invoice #${invoice.invoice_id}`;
    const body = '';
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl, '_blank');
    alert('PDF downloaded — attach it to the email manually.');
  };

  const handleLogout = () => {
    localStorage.removeItem('xrpl_wallet');
    disconnect();
    router.replace('/login');
    router.refresh();
  };

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0c10]">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Loading wallet...</div>
          <div className="text-gray-400">Please wait</div>
        </div>
      </div>
    );
  }

  if (!wallet) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Wallet Header */}
      <div className="flex items-center justify-between bg-[#16181c] rounded-2xl p-4 border border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1D9BF0] rounded-full flex items-center justify-center text-white font-bold">U</div>
          <div>
            <div className="font-medium">UrsaDeFi User</div>
            <div className="text-sm text-gray-400 font-mono">{wallet.address.slice(0, 8)}...{wallet.address.slice(-4)}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-sm font-medium">
          Disconnect Wallet
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Invoice Feed</h2>
        <button onClick={fetchInvoices} className="text-sm text-gray-400 hover:text-white">Refresh</button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <div className="bg-[#1e293b] rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <div className="text-xl font-semibold mb-2">No invoices yet</div>
          <div className="text-gray-400 mb-6">Use the right sidebar to create your first invoice</div>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="bg-[#1e293b] rounded-2xl p-6 border border-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-sm text-gray-400 mb-1">#{invoice.invoice_id}</div>
                  <div className="font-semibold">{invoice.description || 'No description'}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    To: {invoice.to_wallet.slice(0, 8)}...{invoice.to_wallet.slice(-4)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl">
                    {invoice.amount} {invoice.currency}
                  </div>
                  <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${
                    invoice.status === 'pending' ? 'bg-yellow-900 text-yellow-300' : 
                    invoice.status === 'paid' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                  }`}>
                    {invoice.status.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button 
                  onClick={() => handleViewPDF(invoice)}
                  disabled={pdfLoading === invoice.invoice_id}
                  className="flex-1 py-3 bg-[#1D9BF0] rounded-xl font-medium hover:bg-[#1a8cd8] disabled:opacity-50"
                >
                  {pdfLoading === invoice.invoice_id ? 'Generating...' : 'View PDF'}
                </button>
                <button 
                  onClick={() => handleShareOnX(invoice)}
                  className="flex-1 py-3 bg-[#1e293b] border border-gray-700 rounded-xl font-medium hover:bg[#334155]"
                >
                  Share on X
                </button>
                <button 
                  onClick={() => handleEmailInvoice(invoice)}
                  className="flex-1 py-3 bg[#1e293b] border border-gray-700 rounded-xl font-medium hover:bg[#334155]"
                >
                  Email Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
