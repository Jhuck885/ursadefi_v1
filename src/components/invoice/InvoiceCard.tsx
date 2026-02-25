'use client';
import { Invoice } from '@/types';
import BrowserInvoicePDF from './BrowserInvoicePDF'; // relative — same folder
import { mintInvoiceNFT } from '@/lib/xrpl'; // your exact xrpl.ts

interface Props { invoice: Invoice; }

export default function InvoiceCard({ invoice }: Props) {
  const handleMint = async () => {
    try {
      await mintInvoiceNFT(invoice); // opens Xaman — your xrpl.ts
      alert('✅ Xaman opened — sign to mint NFT (deferred until paid)');
    } catch (e) { alert('Retry — Xaman required'); }
  };

  return (
    <div className="border border-zinc-800 rounded-3xl p-6 bg-zinc-950 hover:border-white transition-all">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-mono text-sm text-zinc-500">#{invoice.id}</div>
          <div className="text-xl font-semibold">$${invoice.total}</div>
          <div className="text-sm text-zinc-400">To: {invoice.to || invoice.clientName}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-emerald-400">XRPL NFT Ready</div>
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <BrowserInvoicePDF invoice={invoice} /> {/* your exact PDF component */}
        <button onClick={handleMint} className="btn-pill flex-1 bg-white text-black">Mint as XRPL NFT</button>
      </div>
    </div>
  );
}