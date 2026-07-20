'use client';
import { Invoice } from '@/types';
import { calcPlatformFee, PLATFORM_FEE_PERCENT_LABEL, MIN_PLATFORM_FEE_USD } from '@/lib/constants';

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
  mode?: 'open' | 'reminder' | 'full';
}

function loadCompanyProfile(): CompanyProfile {
  try {
    const raw = localStorage.getItem('ursadefi_company_profile');
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function resolveFeeBreakdown(invoice: Invoice) {
  const subtotal =
    typeof invoice.subtotal === 'number' && invoice.subtotal > 0
      ? invoice.subtotal
      : Number(invoice.items?.[0]?.price) || Number(invoice.total) || 0;

  const platformFee =
    typeof invoice.platformFee === 'number' && invoice.platformFee >= 0
      ? invoice.platformFee
      : calcPlatformFee(subtotal);

  const total =
    typeof invoice.total === 'number' && invoice.total > 0
      ? invoice.total
      : parseFloat((subtotal + platformFee).toFixed(2));

  return { subtotal, platformFee, total };
}

export function buildPaymentUri(invoice: Invoice): string {
  const frozen = (invoice as any).paymentUri as string | undefined;
  if (frozen && frozen.startsWith('xrp:')) return frozen;

  const receiver = (invoice.receiver || '').trim();
  const amount = Number(invoice.xrpAmount || 0).toFixed(6);
  const id = String(invoice.id || '').replace(/^PREVIEW-/, '');
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
    const { subtotal, platformFee, total } = resolveFeeBreakdown(invoice);

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

    let qrDataUrl = '';
    try {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&ecc=M&margin=4&data=${encodeURIComponent(paymentUri)}`;
      const response = await fetch(qrApiUrl);
      const blob = await response.blob();
      qrDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error('QR generation failed', err);
      qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(paymentUri)}`;
    }

    try {
      const existing: any[] = JSON.parse(localStorage.getItem('invoices') || '[]');
      const next = existing.map((i) =>
        i.id === invoice.id
          ? {
              ...i,
              paymentUri,
              xrpAmount: Number(xrpFixed),
              subtotal,
              platformFee,
              total,
            }
          : i
      );
      if (!existing.find((i) => i.id === invoice.id)) {
        next.unshift({
          ...invoice,
          paymentUri,
          xrpAmount: Number(xrpFixed),
          subtotal,
          platformFee,
          total,
        });
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
      ? `<img src="${companyLogo}" alt="${companyName}" class="company-logo" />`
      : '';

    const ursaLogoSrc =
      typeof window !== 'undefined'
        ? `${window.location.origin}/ursa-logo.png`
        : '/ursa-logo.png';

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

    const serviceDesc =
      invoice.description ||
      invoice.items?.[0]?.desc ||
      'Professional services';

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Invoice #${cleanId}</title>
  <meta charset="utf-8">
  <style>
    @page { size: letter; margin: 0.4in; }
    * { box-sizing: border-box; }
    html, body { height: auto; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 0.35in 0.5in;
      color: #111;
      line-height: 1.3;
      font-size: 12px;
    }
    img { max-width: 100%; height: auto; }
    .company-logo {
      display: block;
      height: 32px !important;
      width: auto !important;
      max-height: 32px !important;
      max-width: 110px !important;
      object-fit: contain;
      margin: 0 0 6px 0;
    }
    .footer-logo {
      display: block;
      margin: 0 auto 4px auto;
      height: 22px !important;
      width: auto !important;
      max-height: 22px !important;
      max-width: 72px !important;
      object-fit: contain;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #111;
      padding-bottom: 8px;
      margin-bottom: 14px;
    }
    .company-info h1 {
      margin: 0 0 2px 0;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.3px;
    }
    .company-info p { margin: 0; font-size: 10px; color: #444; }
    .invoice-title { text-align: right; }
    .invoice-title h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 2px;
    }
    .invoice-meta { text-align: right; margin-top: 4px; font-size: 11px; }
    .sections {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      gap: 24px;
    }
    .section { width: 48%; }
    .section strong {
      display: block;
      font-size: 10px;
      color: #555;
      margin-bottom: 2px;
      letter-spacing: 0.4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 4px;
      font-size: 11.5px;
    }
    th {
      text-align: left;
      padding: 5px 0 4px;
      border-bottom: 1.5px solid #111;
      font-weight: 600;
      font-size: 10px;
      color: #333;
    }
    th.right { text-align: right; }
    td { padding: 5px 0; border-bottom: 1px solid #ddd; vertical-align: top; }
    td.right { text-align: right; }
    .muted { color: #555; font-size: 10.5px; }
    .total-row { border-top: 2px solid #111; font-weight: 700; }
    .total-row td { padding-top: 6px; border-bottom: none; }
    .payment-line { margin-top: 10px; font-size: 11px; }
    .qr-section { margin-top: 12px; text-align: center; page-break-inside: avoid; }
    .qr-section img {
      width: 120px !important;
      height: 120px !important;
      border: 1px solid #ddd;
      padding: 3px;
      background: white;
    }
    .footer-text {
      margin-top: 14px;
      font-size: 10px;
      color: #444;
      line-height: 1.4;
      page-break-inside: avoid;
    }
    .footer-brand {
      text-align: center;
      margin-top: 12px;
      font-size: 10px;
      page-break-inside: avoid;
    }
    .footer-brand .powered { font-size: 9px; color: #666; margin-top: 2px; }
    @media print {
      body { padding: 0.25in 0.35in; }
      .company-logo {
        height: 28px !important;
        max-height: 28px !important;
        max-width: 100px !important;
      }
      .footer-logo {
        height: 20px !important;
        max-height: 20px !important;
        max-width: 64px !important;
      }
    }
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
      <div style="margin-top:2px; line-height:1.3;">
        ${invoice.to || 'Client Name'}<br>
        ${invoice.clientAddress || ''}<br>
        ${invoice.clientCityState || ''}<br>
        United States
      </div>
    </div>
    <div class="section" style="text-align:right;">
      <strong>FOR:</strong>
      <div style="margin-top:2px; line-height:1.3;">
        ${serviceDesc}<br>
        XRPL settlement via UrsaDeFi
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>DESCRIPTION</th>
        <th class="right" style="width: 70px;">QTY</th>
        <th class="right" style="width: 70px;">RATE</th>
        <th class="right" style="width: 90px;">AMOUNT</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${serviceDesc}</td>
        <td class="right">1</td>
        <td class="right">$${subtotal.toFixed(2)}</td>
        <td class="right">$${subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td>
          UrsaDeFi platform fee
          <div class="muted">${PLATFORM_FEE_PERCENT_LABEL} of services (minimum $${MIN_PLATFORM_FEE_USD.toFixed(2)}) — processing & XRPL settlement</div>
        </td>
        <td class="right">1</td>
        <td class="right">$${platformFee.toFixed(2)}</td>
        <td class="right">$${platformFee.toFixed(2)}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3" style="text-align:right; padding-right:8px;" class="muted">Subtotal (services)</td>
        <td class="right muted">$${subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="3" style="text-align:right; padding-right:8px;" class="muted">Platform fee</td>
        <td class="right muted">$${platformFee.toFixed(2)}</td>
      </tr>
      <tr class="total-row">
        <td colspan="3" style="text-align:right; padding-right:8px;"><strong>TOTAL DUE</strong></td>
        <td class="right" style="font-size:13px;"><strong>$${total.toFixed(2)}</strong></td>
      </tr>
    </tfoot>
  </table>

  <div class="payment-line">
    <strong>Pay ${xrpFixed} XRP</strong> to wallet:
    <span style="font-family:monospace; font-size:10px;">${invoice.receiver || ''}</span>
  </div>

  <div class="qr-section">
    <img src="${qrDataUrl}" alt="XRP Payment QR Code" width="120" height="120" />
    <p style="margin: 4px 0 0; font-size:9.5px; color:#555;">
      Scan with Xaman • Invoice #${cleanId} • Amount locked
    </p>
  </div>

  <div class="footer-text">
    Make all checks payable to ${companyName}.
    Total due in 15 days. Overdue accounts subject to a service charge of 1% per month.<br>
    Platform fee is collected by UrsaDeFi for non-custodial XRPL invoicing & settlement (${PLATFORM_FEE_PERCENT_LABEL}, min $${MIN_PLATFORM_FEE_USD.toFixed(2)}).<br>
    <strong>THANK YOU FOR YOUR BUSINESS!</strong>
  </div>

  <div class="footer-brand">
    <img src="${ursaLogoSrc}" alt="UrsaDeFi" class="footer-logo" />
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
          ? `Hi,%0A%0AThis is a friendly reminder that invoice #${cleanId} is still outstanding.%0A%0AAmount due: $${total.toFixed(2)} (services $${subtotal.toFixed(2)} + platform fee $${platformFee.toFixed(2)}; ≈ ${xrpFixed} XRP).%0A%0APlease find the invoice via the print window. Pay with Xaman when ready.%0A%0AThank you,%0A${encodeURIComponent(companyName)}`
          : `Please find invoice #${cleanId} via UrsaDeFi (XRPL). Total due $${total.toFixed(2)} (includes transparent platform fee). Pay ${xrpFixed} XRP with Xaman.`;
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
