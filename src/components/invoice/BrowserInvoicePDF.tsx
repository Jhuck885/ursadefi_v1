'use client';
import { Invoice } from '@/types';

interface CompanyProfile {
  username?: string;
  companyName?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  cityStateZip?: string;
  country?: string;
  ein?: string;
  tagline?: string;
  logoDataUrl?: string;
}

interface Props {
  invoice: Invoice;
  compact?: boolean;
  /** open = PDF only; reminder = PDF + mailto; full = create flow (default) */
  mode?: 'open' | 'reminder' | 'full';
}

function loadCompanyProfile(): CompanyProfile {
  try {
    const raw = localStorage.getItem('ursadefi_company_profile');
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

/** Always the same string for the same invoice — never re-price */
export function buildPaymentUri(invoice: Invoice): string {
  // Prefer frozen URI saved at create time
  const frozen = (invoice as any).paymentUri as string | undefined;
  if (frozen && frozen.startsWith('xrp:')) return frozen;

  const receiver = (invoice.receiver || '').trim();
  // Lock amount to 6 decimal places so QR payload never drifts
  const amount = Number(invoice.xrpAmount || 0).toFixed(6);
  const id = String(invoice.id || '').replace(/^PREVIEW-/, '');
  // Include invoice id (dt) so URI is unique and stable per invoice
  return `xrp:${receiver}?amount=${amount}&dt=${encodeURIComponent(id)}`;
}

export default function BrowserInvoicePDF({
  invoice,
  compact = false,
  mode,
}: Props) {
  const resolvedMode: 'open' | 'reminder' | 'full' =
    mode || (compact ? 'reminder' : 'full');

  const openPDF = async () => {
    const win = window.open('', '_blank');
    if (!win) {
      alert('Pop-up blocked — allow for PDF');
      return;
    }

    const profile = loadCompanyProfile();

    const companyName = profile.companyName || invoice.from || 'Your Company';
    const companyTagline = profile.tagline || invoice.companyTagline || '';
    const companyAddress = profile.address || invoice.companyAddress || '';
    const companyCity = profile.cityStateZip || '';
    const companyCountry = profile.country || 'United States';
    const companyPhone = profile.phone || invoice.companyPhone || '';
    const companyEmail = profile.email || '';
    const companyWebsite = profile.website || '';
    const companyEin = profile.ein || '';
    const companyLogo = profile.logoDataUrl || '';

    const cleanId = String(invoice.id || '').replace(/^PREVIEW-/, '');
    const xrpFixed = Number(invoice.xrpAmount || 0).toFixed(6);
    const paymentUri = buildPaymentUri(invoice);

    // Stable QR: same paymentUri always produces the same code content
    let qrDataUrl = '';
    try {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=170x170&ecc=M&margin=8&data=${encodeURIComponent(paymentUri)}`;
      const response = await fetch(qrApiUrl);
      const blob = await response.blob();
      qrDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error('QR generation failed', err);
      qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(paymentUri)}`;
    }

    // Persist frozen URI on local copy so future opens never diverge
    try {
      const existing: any[] = JSON.parse(localStorage.getItem('invoices') || '[]');
      const next = existing.map((i) =>
        i.id === invoice.id
          ? { ...i, paymentUri, xrpAmount: Number(xrpFixed) }
          : i
      );
      if (!existing.find((i) => i.id === invoice.id)) {
        next.unshift({ ...invoice, paymentUri, xrpAmount: Number(xrpFixed) });
      }
      localStorage.setItem('invoices', JSON.stringify(next));
    } catch {}

    const companyLines = [
      companyTagline ? `<p>${companyTagline}</p>` : '',
      companyAddress ? `<p>${companyAddress}</p>` : '',
      companyCity ? `<p>${companyCity}</p>` : '',
      companyCountry ? `<p>${companyCountry}</p>` : '',
      companyPhone ? `<p>Phone: ${companyPhone}</p>` : '',
      companyEmail ? `<p>${companyEmail}</p>` : '',
      companyWebsite ? `<p>${companyWebsite}</p>` : '',
      companyEin ? `<p>EIN: ${companyEin}</p>` : '',
    ]
      .filter(Boolean)
      .join('');

    const logoHtml = companyLogo
      ? `<img src="${companyLogo}" alt="${companyName}" style="height: 48px; max-width: 160px; object-fit: contain; margin-bottom: 8px;" />`
      : '';

    const invDate = invoice.created_at
      ? new Date(invoice.created_at).toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: '2-digit',
        })
      : new Date().toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: '2-digit',
        });

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Invoice #${cleanId}</title>
  <meta charset="utf-8">
  <style>
    @page { size: letter; margin: 0.5in; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0; padding: 0.55in 0.65in; color: #111; line-height: 1.35; font-size: 13px;
    }
    .header { display: flex; justify-content: space-between; align-items: flex-start;
      border-bottom: 2.5px solid #111; padding-bottom: 12px; margin-bottom: 20px; }
    .company-info h1 { margin: 0 0 3px 0; font-size: 20px; font-weight: 700; letter-spacing: -0.4px; }
    .company-info p { margin: 1px 0; font-size: 11px; color: #444; }
    .invoice-title { text-align: right; }
    .invoice-title h1 { margin: 0; font-size: 30px; font-weight: 800; letter-spacing: 2.5px; }
    .invoice-meta { text-align: right; margin-top: 5px; font-size: 12px; }
    .sections { display: flex; justify-content: space-between; margin-bottom: 20px; gap: 35px; }
    .section { width: 48%; }
    .section strong { display: block; font-size: 10.5px; color: #555; margin-bottom: 3px; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; margin: 14px 0 6px; font-size: 12.5px; }
    th { text-align: left; padding: 7px 0 6px; border-bottom: 1.5px solid #111; font-weight: 600; font-size: 11px; color: #333; }
    th.right { text-align: right; }
    td { padding: 7px 0; border-bottom: 1px solid #ddd; vertical-align: top; }
    td.right { text-align: right; }
    .total-row { border-top: 2px solid #111; font-weight: 700; }
    .total-row td { padding-top: 8px; border-bottom: none; }
    .payment-line { margin-top: 14px; font-size: 12px; }
    .qr-section { margin-top: 18px; text-align: center; }
    .qr-section img { border: 1px solid #ddd; padding: 5px; background: white; }
    .footer-text { margin-top: 28px; font-size: 11px; color: #444; line-height: 1.45; }
    .footer-brand { text-align: center; margin-top: 22px; font-size: 12px; }
    .footer-brand .powered { font-size: 10px; color: #666; }
    @media print { body { padding: 0.4in; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      ${logoHtml}
      <h1>${companyName}</h1>
      ${companyLines}
    </div>
    <div class="invoice-title">
      <h1>INVOICE</h1>
      <div class="invoice-meta">
        <div><strong>INVOICE:</strong> #${cleanId}</div>
        <div><strong>DATE:</strong> ${invDate}</div>
      </div>
    </div>
  </div>

  <div class="sections">
    <div class="section">
      <strong>TO:</strong>
      <div style="margin-top:3px; line-height:1.3;">
        ${invoice.to || 'Client Name'}<br>
        ${invoice.clientAddress || ''}<br>
        ${invoice.clientCityState || ''}<br>
        United States
      </div>
    </div>
    <div class="section" style="text-align:right;">
      <strong>FOR:</strong>
      <div style="margin-top:3px; line-height:1.3;">
        ${invoice.description || 'Professional Services'}<br>
        XRPL Invoicing & Payments<br>
        UrsaDeFi Platform
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>DESCRIPTION</th>
        <th class="right" style="width: 85px;">HOURS</th>
        <th class="right" style="width: 85px;">RATE</th>
        <th class="right" style="width: 105px;">AMOUNT</th>
      </tr>
    </thead>
    <tbody>
      ${(invoice.items || [])
        .map((item) => {
          const amount = (item.qty * item.price).toFixed(2);
          return `<tr>
            <td>${item.desc || ''}</td>
            <td class="right">${item.qty}</td>
            <td class="right">$${Number(item.price).toFixed(2)}</td>
            <td class="right">$${amount}</td>
          </tr>`;
        })
        .join('')}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="3" style="text-align:right; padding-right:10px;"><strong>TOTAL</strong></td>
        <td class="right" style="font-size:15px;"><strong>$${Number(invoice.total).toFixed(2)}</strong></td>
      </tr>
    </tfoot>
  </table>

  <div class="payment-line">
    <strong>Pay ${xrpFixed} XRP</strong> to wallet:
    <span style="font-family:monospace; font-size:11px;">${invoice.receiver || ''}</span>
  </div>

  <div class="qr-section">
    <img src="${qrDataUrl}" alt="XRP Payment QR Code" width="170" height="170" />
    <p style="margin: 6px 0 0; font-size:10.5px; color:#555;">
      Scan with Xaman to pay • Invoice #${cleanId} • Amount locked
    </p>
  </div>

  <div class="footer-text">
    Make all checks payable to ${companyName}.<br>
    Total due in 15 days. Overdue accounts subject to a service charge of 1% per month.<br><br>
    <strong>THANK YOU FOR YOUR BUSINESS!</strong>
  </div>

  <div class="footer-brand">
    ${
      companyLogo
        ? `<img src="${companyLogo}" alt="${companyName}" style="height: 28px; max-width: 120px; object-fit: contain;" />`
        : '<img src="/ursa-logo.png" alt="UrsaDeFi" />'
    }
    <div class="powered">Powered by ursadefi.com</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>`;

    win.document.write(html);
    win.document.close();

    if (resolvedMode === 'open') return;

    setTimeout(() => {
      const subject =
        resolvedMode === 'reminder'
          ? `Payment reminder — Invoice #${cleanId}`
          : `Invoice #${cleanId}`;
      const body =
        resolvedMode === 'reminder'
          ? `Hi,%0A%0AThis is a friendly reminder that invoice #${cleanId} is still outstanding.%0A%0AAmount due: $${Number(invoice.total).toFixed(2)} (≈ ${xrpFixed} XRP).%0A%0APlease find the invoice via the print window. Pay with Xaman when ready.%0A%0AThank you,%0A${encodeURIComponent(companyName)}`
          : `Please find invoice #${cleanId} via UrsaDeFi (XRPL). Pay ${xrpFixed} XRP with Xaman.`;
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
    }, 2200);
  };

  if (resolvedMode === 'open') {
    return (
      <button
        onClick={openPDF}
        className="px-4 py-1.5 text-xs font-medium border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] rounded-full transition"
      >
        Open PDF
      </button>
    );
  }

  if (resolvedMode === 'reminder' || compact) {
    return (
      <button
        onClick={openPDF}
        className="px-4 py-1.5 text-xs font-medium border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] rounded-full transition"
      >
        Send Reminder
      </button>
    );
  }

  return (
    <button
      onClick={openPDF}
      className="w-full py-3.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-semibold rounded-full transition"
    >
      Save & Send Invoice
    </button>
  );
}
