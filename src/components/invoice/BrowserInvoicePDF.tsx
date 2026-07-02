'use client';
import { Invoice } from '@/types';

interface Props { invoice: Invoice; compact?: boolean; }

export default function BrowserInvoicePDF({ invoice, compact = false }: Props) {
  const openPDF = () => {
    const win = window.open('', '_blank');
    if (!win) { alert('Pop-up blocked — allow for PDF'); return; }

    const qrData = `xrp:${invoice.receiver || ''}?amount=${invoice.xrpAmount}`;
    const today = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Invoice #${invoice.id}</title>
  <meta charset="utf-8">
  <style>
    @page { size: letter; margin: 0.5in; }
    body { 
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
      margin: 0; 
      padding: 0.6in 0.7in; 
      color: #111; 
      line-height: 1.4; 
      font-size: 13px;
    }
    .header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start; 
      border-bottom: 2.5px solid #111; 
      padding-bottom: 14px; 
      margin-bottom: 22px;
    }
    .company-info h1 { 
      margin: 0 0 2px 0; 
      font-size: 21px; 
      font-weight: 700; 
      letter-spacing: -0.3px;
    }
    .company-info p { 
      margin: 1px 0; 
      font-size: 11px; 
      color: #444;
    }
    .invoice-title { 
      text-align: right;
    }
    .invoice-title h1 { 
      margin: 0; 
      font-size: 32px; 
      font-weight: 800; 
      letter-spacing: 3px;
    }
    .invoice-meta { 
      text-align: right; 
      margin-top: 6px; 
      font-size: 12px;
    }
    .sections { 
      display: flex; 
      justify-content: space-between; 
      margin-bottom: 24px;
      gap: 40px;
    }
    .section { 
      width: 48%;
    }
    .section strong { 
      display: block; 
      font-size: 11px; 
      color: #555; 
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 18px 0 8px;
      font-size: 12.5px;
    }
    th { 
      text-align: left; 
      padding: 9px 0 8px; 
      border-bottom: 1.5px solid #111; 
      font-weight: 600; 
      font-size: 11px; 
      color: #333;
    }
    th.right { text-align: right; }
    td { 
      padding: 9px 0; 
      border-bottom: 1px solid #ddd;
      vertical-align: top;
    }
    td.right { text-align: right; }
    .total-row { 
      border-top: 2px solid #111; 
      font-weight: 700;
    }
    .total-row td { 
      padding-top: 10px; 
      border-bottom: none;
    }
    .footer { 
      margin-top: 38px; 
      font-size: 11px; 
      color: #444;
      line-height: 1.5;
    }
    .powered { 
      margin-top: 32px; 
      font-size: 10px; 
      color: #666; 
      display: flex; 
      justify-content: space-between; 
      align-items: center;
    }
    .qr-section { 
      margin-top: 25px; 
      text-align: center;
    }
    .qr-section img { 
      border: 1px solid #ddd; 
      padding: 6px; 
      background: white;
    }
    @media print {
      body { padding: 0.4in; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="company-info">
      <h1>${invoice.from || 'Ursa User Company Name'}</h1>
      <p>Ursa User Tagline</p>
      <p>450 East 78th Ave • Denver, CO 80205</p>
      <p>Phone: (123) 456-7890 &nbsp;&nbsp; Fax: (123) 456-7891</p>
    </div>
    
    <div class="invoice-title">
      <h1>INVOICE</h1>
      <div class="invoice-meta">
        <div><strong>INVOICE:</strong> #${invoice.id}</div>
        <div><strong>DATE:</strong> ${today}</div>
      </div>
    </div>
  </div>

  <!-- TO and FOR sections -->
  <div class="sections">
    <div class="section">
      <strong>TO:</strong>
      <div style="margin-top:4px; line-height:1.35;">
        ${invoice.to || 'Client Name'}<br>
        Client Address Line 1<br>
        City, State ZIP<br>
        United States
      </div>
    </div>
    
    <div class="section" style="text-align:right;">
      <strong>FOR:</strong>
      <div style="margin-top:4px; line-height:1.35;">
        ${invoice.description || 'Professional Services'}<br>
        XRPL Invoicing & Payments<br>
        UrsaDeFi Platform
      </div>
    </div>
  </div>

  <!-- Items Table -->
  <table>
    <thead>
      <tr>
        <th>DESCRIPTION</th>
        <th class="right" style="width: 90px;">HOURS</th>
        <th class="right" style="width: 90px;">RATE</th>
        <th class="right" style="width: 110px;">AMOUNT</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items.map(item => {
        const amount = (item.qty * item.price).toFixed(2);
        return `
          <tr>
            <td>${item.desc}</td>
            <td class="right">${item.qty}</td>
            <td class="right">$${item.price.toFixed(2)}</td>
            <td class="right">$${amount}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="3" style="text-align:right; padding-right:12px;"><strong>TOTAL</strong></td>
        <td class="right" style="font-size:15px;"><strong>$${invoice.total}</strong></td>
      </tr>
    </tfoot>
  </table>

  <!-- Payment Info -->
  <div style="margin-top: 18px; font-size:12px;">
    <strong>Pay ${invoice.xrpAmount} XRP</strong> to wallet: <span style="font-family:monospace; font-size:11px;">${invoice.receiver || 'r...'}</span>
  </div>

  <!-- QR Code -->
  <div class="qr-section">
    <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}" alt="XRP Payment QR Code" width="180" height="180" />
    <p style="margin: 8px 0 0; font-size:11px; color:#555;">Scan with Xaman to pay instantly • NFT minted on confirmation</p>
  </div>

  <!-- Footer -->
  <div class="footer">
    Make all checks payable to ${invoice.from || 'UrsaDeFi'}.<br>
    Total due in 15 days. Overdue accounts subject to a service charge of 1% per month.<br><br>
    <strong>THANK YOU FOR YOUR BUSINESS!</strong>
  </div>

  <div class="powered">
    <div>Powered by <a href="https://ursadefi.com" style="color:#1D9BF0; text-decoration:none;">ursadefi.com</a></div>
    <div style="font-size:9px; color:#888;">UrsaDeFi • XRPL Invoicing</div>
  </div>

  <script>window.print();</script>
</body>
</html>`;

    win.document.write(html);
    win.document.close();

    setTimeout(() => {
      const mailto = `mailto:?subject=Invoice%20%23${invoice.id}&body=Please%20find%20attached%20invoice%20via%20UrsaDeFi%20(XRPL).%20Pay%20with%20Xaman.`;
      window.location.href = mailto;
    }, 1800);
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