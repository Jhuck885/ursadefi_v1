'use client';

import Link from 'next/link';
import {
  FileText, Shield, Wallet, HelpCircle,
  ExternalLink, ArrowLeft, Layers, Download, PlayCircle
} from 'lucide-react';

const docs = [
  {
    title: 'Getting Started',
    description: 'Connect Xaman or use Demo, set up your profile, and send your first invoice.',
    status: 'Live',
    href: '#getting-started',
  },
  {
    title: 'Product Overview',
    description: 'What UrsaDeFi is, who it is for, and how XRPL invoicing works.',
    status: 'Live',
    href: '#about',
  },
  {
    title: 'Whitepaper',
    description: 'Business model, fee structure, non-custodial design, and roadmap.',
    status: 'Live',
    href: '#whitepaper',
  },
  {
    title: 'Tax & regional CSV export',
    description: 'US 1099-NEC / IRIS, Europe VAT ledger, Japan qualified-invoice oriented export.',
    status: 'Live',
    href: '#tax',
  },
];

const faqs = [
  {
    q: 'What is UrsaDeFi?',
    a: 'UrsaDeFi is a non-custodial, XRPL-native invoicing platform built in Dallas, Texas. Freelancers, operators, and small businesses create invoices in USD, settle in XRP, optionally mint invoices as XRPL NFTs, and export tax-oriented CSVs — while keeping full control of their private keys in Xaman.',
  },
  {
    q: 'Is UrsaDeFi custodial?',
    a: 'No. UrsaDeFi is 100% non-custodial. Your private keys and funds stay in your Xaman wallet. UrsaDeFi never holds user funds or seed phrases.',
  },
  {
    q: 'How does login security work?',
    a: 'UrsaDeFi does not use passwords. You authenticate by connecting your XRPL wallet through Xaman. Xaman holds your keys and signs transactions on your device. UrsaDeFi never receives your seed phrase or private key. This removes password databases, credential stuffing, and shared-secret risk from the product.',
  },
  {
    q: 'What does UrsaDeFi cost?',
    a: 'The platform fee is 0.15% of the service amount, with a minimum of $0.25 per paid invoice. Draft invoices are free. No monthly subscription. The fee is paid by the invoice creator when the invoice is settled. End clients simply pay the total shown on the invoice.',
  },
  {
    q: 'What are the minimum amounts?',
    a: 'Minimum invoice (service) amount is $25. Minimum amount to mint an invoice as an XRPL NFT is $50. The platform fee has a floor of $0.25 even when 0.15% would be lower.',
  },
  {
    q: 'Do I need to create a password?',
    a: 'No. You sign in with your XRPL wallet via Xaman. There are no passwords and no seed phrases stored by UrsaDeFi.',
  },
  {
    q: 'What is the “Try Demo” button?',
    a: 'Try Demo lets you explore the full app in a private sandbox on your device. No real wallet is connected. Each demo session is isolated. When you are ready for real work, connect with Xaman instead.',
  },
  {
    q: 'How do invoices get paid?',
    a: 'Each invoice can include an XRP amount and payment details. Clients can pay with Xaman. You can detect on-ledger payment or mark Paid when funds arrive. Settled status (and tax CSV / mint) unlock after the platform fee is paid.',
  },
  {
    q: 'Can I mint an invoice as an XRPL NFT?',
    a: 'Yes. After an invoice is settled, you can optionally mint it as an XRPL NFT for a permanent on-chain record. Minimum service amount to mint is $50.',
  },
  {
    q: 'Can I export data for my accountant?',
    a: 'Yes. The Reports page exports CSVs for the United States (IRIS-oriented 1099-NEC helper), Europe (invoice/VAT ledger), and Japan (qualified-invoice oriented ledger). These are bookkeeping helpers — not finished filings. Confirm with your accountant before submitting anything to a tax authority.',
  },
  {
    q: 'Where is the platform fee sent?',
    a: 'The platform fee is a normal non-custodial XRPL Payment signed in Xaman to UrsaDeFi’s official fee destination. The destination is configured server-side and shown only in the fee payment payload in Xaman — it is not published on this page.',
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">About UrsaDeFi</h1>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            Non-custodial XRPL invoicing for freelancers and small businesses.
            Bill in USD, settle in XRP, keep your keys.
          </p>
        </div>

        <section className="mb-14">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Key facts</h2>
            <dl className="grid gap-3 text-sm">
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-[var(--text-muted)] sm:w-44 flex-shrink-0">Product</dt>
                <dd className="text-[var(--text-primary)]">UrsaDeFi — non-custodial XRPL-native invoicing</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-[var(--text-muted)] sm:w-44 flex-shrink-0">Location</dt>
                <dd className="text-[var(--text-primary)]">Dallas, Texas, USA</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-[var(--text-muted)] sm:w-44 flex-shrink-0">Login model</dt>
                <dd className="text-[var(--text-primary)]">XRPL wallet via Xaman — no passwords</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-[var(--text-muted)] sm:w-44 flex-shrink-0">Platform fee</dt>
                <dd className="text-[var(--text-primary)]">0.15% of service amount (minimum $0.25) when paid — no monthly fee</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-[var(--text-muted)] sm:w-44 flex-shrink-0">Who pays the fee</dt>
                <dd className="text-[var(--text-primary)]">Invoice creator, after client pays. Drafts are free.</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-[var(--text-muted)] sm:w-44 flex-shrink-0">Min. invoice amount</dt>
                <dd className="text-[var(--text-primary)]">$25 service amount</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-[var(--text-muted)] sm:w-44 flex-shrink-0">Min. to mint NFT</dt>
                <dd className="text-[var(--text-primary)]">$50 service amount (after settled)</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-[var(--text-muted)] sm:w-44 flex-shrink-0">Custody</dt>
                <dd className="text-[var(--text-primary)]">Non-custodial. Keys stay in Xaman.</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-[var(--text-muted)] sm:w-44 flex-shrink-0">Settlement</dt>
                <dd className="text-[var(--text-primary)]">Bill in USD, settle in XRP on the XRP Ledger</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-[var(--text-muted)] sm:w-44 flex-shrink-0">Tax exports</dt>
                <dd className="text-[var(--text-primary)]">US · Europe · Japan CSVs on the Reports page</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-[var(--text-muted)] sm:w-44 flex-shrink-0">Fee destination</dt>
                <dd className="text-[var(--text-primary)]">Configured server-side · shown only in Xaman when you pay the fee</dd>
              </div>
            </dl>
          </div>
        </section>

        <section id="about" className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-2xl font-semibold">What UrsaDeFi is</h2>
          </div>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 space-y-4 text-[var(--text-secondary)] leading-relaxed">
            <p>
              <strong className="text-[var(--text-primary)]">UrsaDeFi</strong> is an XRPL-native invoicing
              platform built in Dallas, TX for freelancers, operators, and small businesses who want to bill in USD,
              settle in XRP, and keep control of their keys.
            </p>
            <p>
              Users create invoices, manage clients, track outstanding balances, optionally mint invoices
              as XRPL NFTs, and export regional tax-oriented CSVs — without giving up custody of funds.
            </p>
            <ul className="space-y-2 pt-2">
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 mt-1 text-[var(--brand-primary)] flex-shrink-0" />
                <span>Non-custodial — private keys stay in the user's Xaman wallet</span>
              </li>
              <li className="flex items-start gap-2">
                <Wallet className="w-4 h-4 mt-1 text-[var(--brand-primary)] flex-shrink-0" />
                <span>Platform fee 0.15% (minimum $0.25) — paid by the invoice creator when the invoice is paid</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-1 text-[var(--brand-primary)] flex-shrink-0" />
                <span>Regional CSV exports: US 1099-NEC / IRIS helper, Europe VAT ledger, Japan qualified-invoice ledger</span>
              </li>
            </ul>
          </div>
        </section>

        <section id="minimums" className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-2xl font-semibold">Minimum amounts and why they exist</h2>
          </div>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 space-y-5 text-[var(--text-secondary)] leading-relaxed">
            <p>
              UrsaDeFi sets a few clear floors so the product stays cheap, reliable, and economically
              sensible on the XRP Ledger.
            </p>

            <div className="space-y-4">
              <div className="border border-[var(--border-color)] rounded-xl p-4">
                <p className="font-medium text-[var(--text-primary)] mb-1">Minimum invoice amount — $25</p>
                <p className="text-sm">
                  The service amount on an invoice must be at least $25 to create or activate.
                  Below that, network fees and operational cost would eat too large a share of the value.
                </p>
              </div>

              <div className="border border-[var(--border-color)] rounded-xl p-4">
                <p className="font-medium text-[var(--text-primary)] mb-1">Minimum to mint as XRPL NFT — $50</p>
                <p className="text-sm">
                  Minting creates a permanent on-chain record. The $50 floor ensures minting is used for
                  meaningful invoices. Mint is available after settled status.
                </p>
              </div>

              <div className="border border-[var(--border-color)] rounded-xl p-4">
                <p className="font-medium text-[var(--text-primary)] mb-1">Platform fee floor — $0.25</p>
                <p className="text-sm">
                  The fee is 0.15% of the service amount, but never less than $0.25 per paid invoice.
                  The $0.25 minimum keeps fee collection practical without raising the rate for larger invoices.
                </p>
              </div>
            </div>

            <p className="text-sm pt-1">
              Draft invoices remain free. Minimums apply when you settle fees or when you choose to mint as an NFT.
            </p>
          </div>
        </section>

        <section id="tax" className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-2xl font-semibold">Tax & regional CSV export</h2>
          </div>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 space-y-5 text-[var(--text-secondary)] leading-relaxed">
            <p>
              The <Link href="/reports" className="text-[var(--brand-primary)] hover:underline">Reports</Link> page
              exports accountant-oriented CSVs for three regions. These are{' '}
              <strong className="text-[var(--text-primary)]">helpers for bookkeeping</strong>,
              not finished government filings. Confirm with your accountant before submitting anything.
            </p>

            <div className="space-y-4">
              <div className="border border-[var(--border-color)] rounded-xl p-4">
                <p className="font-medium text-[var(--text-primary)] mb-2">United States — Form 1099-NEC (IRIS)</p>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  <li>Filed by the payer of nonemployee compensation, not by the service provider reporting their own income.</li>
                  <li>Federal threshold rules apply; confirm current year with your accountant.</li>
                  <li>UrsaDeFi CSV is a bookkeeping helper. Collect recipient TINs on Form W-9 before any IRS upload.</li>
                </ul>
              </div>

              <div className="border border-[var(--border-color)] rounded-xl p-4">
                <p className="font-medium text-[var(--text-primary)] mb-2">Europe — Invoice / VAT ledger</p>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  <li>There is no single EU tax-return CSV. Member states apply local VAT rules.</li>
                  <li>UrsaDeFi export is a line-item bookkeeping ledger. Set the correct VAT rate with your accountant.</li>
                </ul>
              </div>

              <div className="border border-[var(--border-color)] rounded-xl p-4">
                <p className="font-medium text-[var(--text-primary)] mb-2">Japan — Qualified invoice ledger</p>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  <li>Under the Qualified Invoice System, buyers generally need a qualified invoice from a registered issuer.</li>
                  <li>UrsaDeFi CSV is oriented to that structure. Confirm rates and registration with your accountant.</li>
                </ul>
              </div>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              Not tax advice. Rules change. Confirm with your accountant or the relevant tax authority before filing.
            </p>
          </div>
        </section>

        <section id="whitepaper" className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-2xl font-semibold">Whitepaper — Business Model</h2>
          </div>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 space-y-6 text-[var(--text-secondary)] leading-relaxed">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">1. Core thesis</h3>
              <p>
                Traditional invoicing and payment processors extract high fees, hold funds, can freeze accounts,
                and create friction. UrsaDeFi replaces that stack with a non-custodial, XRPL-native system that
                is dramatically cheaper and keeps control with the user.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">2. Fee model</h3>
              <p className="mb-3">
                Platform fee: <strong className="text-[var(--text-primary)]">0.15%</strong> of the service amount
                (minimum <strong className="text-[var(--text-primary)]">$0.25</strong> per paid invoice).
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Draft invoices are free.</li>
                <li>No monthly subscription.</li>
                <li>The fee is charged to the invoice creator after the client pays.</li>
                <li>The end client pays only the total shown on the invoice.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">3. Login security — XRPL + Xaman</h3>
              <p className="mb-3">
                UrsaDeFi does not use passwords. Authentication is based on the user's XRPL account via Xaman.
                UrsaDeFi never receives the seed phrase or private key.
              </p>
              <p>
                Demo mode is separate: a private sandbox on your device so people can explore without connecting
                a real wallet. Real commercial use requires Xaman.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">4. Non-custodial guarantee</h3>
              <p>
                UrsaDeFi never holds user funds or private keys. All signing happens inside the user's own
                Xaman wallet. The platform fee is a standard XRPL Payment signed in Xaman to UrsaDeFi's
                official fee destination (configured server-side; shown only in the fee payload at payment time).
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">5. Audience</h3>
              <p>
                Primary users are freelancers, independent operators, and small businesses who want lower fees
                and full key control.
              </p>
            </div>
          </div>
        </section>

        <section id="getting-started" className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <PlayCircle className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-2xl font-semibold">Tutorial — Getting Started</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-sm font-bold">1</span>
                <h3 className="text-lg font-semibold">Choose how to enter</h3>
              </div>
              <div className="space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                <div className="grid gap-3">
                  <div className="border border-[var(--border-color)] rounded-xl p-4">
                    <p className="font-medium text-[var(--text-primary)] mb-1">Try Demo</p>
                    <p>Private sandbox on your device. No real wallet. Isolated every time.</p>
                  </div>
                  <div className="border border-[var(--border-color)] rounded-xl p-4">
                    <p className="font-medium text-[var(--text-primary)] mb-1">Connect with Xaman</p>
                    <p>Real XRPL wallet. Keys stay in Xaman; UrsaDeFi never sees them.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-sm font-bold">2</span>
                <h3 className="text-lg font-semibold">Set up your Profile</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Open Profile and add your company details. This appears on invoices clients receive.
              </p>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-sm font-bold">3</span>
                <h3 className="text-lg font-semibold">Create, get paid, settle fee, optionally mint</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Create invoices from the Dashboard. Drafts are free. When the client pays, settle the
                0.15% platform fee in Xaman. Tax CSV and mint unlock after settled.
              </p>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-sm font-bold">4</span>
                <h3 className="text-lg font-semibold">Track and export</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Export US, Europe, or Japan CSVs from the Reports page for your accountant.
              </p>
            </div>
          </div>
        </section>

        <section id="docs" className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-2xl font-semibold">Docs & Whitepapers</h2>
          </div>
          <div className="grid gap-3">
            {docs.map((doc) => (
              <a
                key={doc.title}
                href={doc.href}
                className="flex items-center justify-between gap-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-5 py-4 hover:border-[var(--brand-primary)]/40 transition"
              >
                <div className="min-w-0">
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">{doc.description}</p>
                </div>
                <span className="text-xs text-[var(--text-muted)] whitespace-nowrap flex-shrink-0">
                  {doc.status}
                </span>
              </a>
            ))}
          </div>
        </section>

        <section id="faq" className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-2xl font-semibold">FAQ</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((item) => (
              <div
                key={item.q}
                className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-5 py-4"
              >
                <p className="font-medium mb-1.5">{item.q}</p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-full text-sm font-medium transition"
          >
            Connect & get started
          </Link>
          <a
            href="https://xrpl.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] rounded-full text-sm transition"
          >
            Learn about XRPL
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <p className="text-center text-xs text-[var(--text-muted)] mt-10">
          UrsaDeFi · Dallas, TX · Non-custodial XRPL invoicing · Platform fee 0.15% (min $0.25)
        </p>
      </div>
    </div>
  );
}
