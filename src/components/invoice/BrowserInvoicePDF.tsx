'use client';
import { Invoice } from '@/types';

interface Props { invoice: Invoice; compact?: boolean; }

export default function BrowserInvoicePDF({ invoice, compact = false }: Props) {
  const openPDF = () => {
    const win = window.open('', '_blank');
    if (!win) { alert('Pop-up blocked — allow for PDF'); return; }

    const qrData = `xrp:${invoice.receiver}?amount=${invoice.xrpAmount}`;
    const html = `
      <!DOCTYPE html>
      <html><head><title>Invoice #${invoice.id}</title>
      <style>body{font-family: system-ui; margin:0; padding:20mm; color:#000; line-height:1.5;}
      .header{text-align:center; border-bottom:2px solid #000; padding-bottom:10px;}
      table{width:100%; border-collapse:collapse; margin:20px 0;} td,th{border:1px solid #000; padding:8px;}</style>
      </head><body class="pdf-page">
        <div class="header"><h1>URSADEFI INVOICE</h1><p>Dallas, Texas • XRPL RWA</p></div>
        <div>From: ${invoice.from} • To: ${invoice.to}</div>
        <table><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
        ${invoice.items.map(i => `<tr><td>${i.desc}</td><td>${i.qty}</td><td>$${i.price}</td><td>$${(i.qty*i.price).toFixed(2)}</td></tr>`).join('')}
        </table>
        <div style="text-align:right">Total: $${invoice.total} • Pay ${invoice.xrpAmount} XRP</div>
        <div style="text-align:center;margin-top:30px">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}" alt="Pay QR" />
          <p>Scan to pay • NFT mints on confirmation</p>
        </div>
        <script>window.print();</script>
      </body></html>`;

    win.document.write(html);
    win.document.close();

    setTimeout(() => {
      const mailto = `mailto:?subject=Invoice%20%23${invoice.id}&body=Attached%20PDF%20via%20UrsaDeFi%20—%20pay%20via%20Xaman`;
      window.location.href = mailto;
    }, 1500);
  };

  if (compact) {
    return (
      <button
        onClick={openPDF}
        className="px-4 py-1.5 text-xs font-medium border border-zinc-700 hover:bg-zinc-900 rounded-full transition w-full"
      >
        Save & Email PDF
      </button>
    );
  }

  return (
    <button
      onClick={openPDF}
      className="w-full py-3.5 bg-[#1D9BF0] hover:bg-[#1a8cd8] text-white font-semibold rounded-full transition"
    >
      Save & Email PDF
    </button>
  );
}