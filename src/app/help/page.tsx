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
    title: 'Tax & IRIS CSV Export',
    description: 'How to export accountant-ready reports and use the Reports page.',
    status: 'Available soon',
    href: '#tax',
  },
];

const faqs = [
  {
    q: 'What is UrsaDeFi?',
    a: 'UrsaDeFi is a non-custodial, XRPL-native invoicing platform. Freelancers, operators, and small businesses create invoices in USD, settle in XRP, optionally mint invoices as XRPL NFTs, and export tax-ready data — while keeping full control of their private keys in Xaman.',
  },
  {
    q: 'Is UrsaDeFi custodial?',
    a: 'No. UrsaDeFi is 100% non-custodial. Your private keys and funds stay in your Xaman wallet. UrsaDeFi never holds user funds or seed phrases.',
  },
  {
    q: 'What does UrsaDeFi cost?',
    a: 'The platform fee is 0.15% of the service amount, with a minimum of $0.25 per activated invoice. Draft invoices are free. The fee is paid by the invoice creator when the invoice is activated. End clients simply pay the total shown on the invoice.',
  },
  {
    q: 'Do I need to create a password?',
    a: 'No. You sign in with your XRPL wallet via Xaman. There are no passwords and no seed phrases stored by UrsaDeFi.',
  },
  {
    q: 'What is the “Try Demo” button?',
    a: 'Try Demo lets you explore the full app using a fixed test XRPL address. No real wallet is connected. It is ideal for learning the interface safely. When you are ready for real work, connect with Xaman instead.',
  },
  {
    q: 'How do invoices get paid?',
    a: 'Each invoice can include an XRP amount and payment details. Clients can pay with Xaman. You can also mark invoices as paid manually once funds arrive.',
  },
  {
    q: 'Can I mint an invoice as an XRPL NFT?',
    a: 'Yes. After an invoice is activated, you can optionally mint it as an XRPL NFT to create a permanent on-chain record. The minimum service amount to mint is $50. Burning an NFT is possible but requires explicit confirmation because it is irreversible.',
  },
  {
    q: 'Can I export data for my accountant?',
    a: 'Yes. The Reports page supports CSV export designed for tax and IRIS-style workflows, including company EIN information when provided in your profile.',
  },
  {
    q: 'Where is the platform fee sent?',
    a: 'The platform fee is paid on the XRP Ledger to the official UrsaDeFi fee address: rs6nu5gcDn6HYLzd6HCFNLp6UjXDyYYTQi. It is a normal non-custodial Payment transaction signed in Xaman.',
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

        {/* ========== KEY FACTS (GEO-friendly) ========= */}
        <section className="mb-14">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Key facts</h2>
            <dl className="grid gap-3 text-sm">
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-[var(--text-muted)] sm:w-40 flex-shrink-0">Product</dt>
                <dd className="text-[var(--text-primary)]">UrsaDeFi — non-custodial XRPL-native invoicing</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-[var(--text-muted)] sm:w-40 flex-shrink-0">Platform fee</dt>
                <dd className="text-[var(--text-primary)]">0.15% of service amount (minimum $0.25) per activated invoice</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-[var(--text-muted)] sm:w-40 flex-shrink-0">Who pays the fee</dt>
                <dd className="text-[var(--text-primary)]">Invoice creator, on activation. Drafts are free.</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-[var(--text-muted)] sm:w-40 flex-shrink-0">Custody</dt>
                <dd className="text-[var(--text-primary)]">Non-custodial. Keys stay in Xaman.</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-[var(--text-muted)] sm:w-40 flex-shrink-0">Settlement</dt>
                <dd className="text-[var(--text-primary)]">Bill in USD, settle in XRP on the XRP Ledger</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-[var(--text-muted)] sm:w-40 flex-shrink-0">Fee address</dt>
                <dd className="text-[var(--text-primary)] font-mono text-xs break-all">rs6nu5gcDn6HYLzd6HCFNLp6UjXDyYYTQi</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ========== ABOUT ========= */}
        <section id="about" className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-2xl font-semibold">What UrsaDeFi is</h2>
          </div>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 space-y-4 text-[var(--text-secondary)] leading-relaxed">
            <p>
              <strong className="text-[var(--text-primary)]">UrsaDeFi</strong> is an XRPL-native invoicing
              platform for freelancers, operators, and small businesses who want to bill in USD,
              settle in XRP, and keep control of their keys.
            </p>
            <p>
              Users create invoices, manage clients, track outstanding balances, optionally mint invoices
              as XRPL NFTs, and export tax-ready CSVs — without giving up custody of funds.
            </p>
            <ul className="space-y-2 pt-2">
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 mt-1 text-[var(--brand-primary)] flex-shrink-0" />
                <span>Non-custodial — private keys stay in the user&apos;s Xaman wallet</span>
              </li>
              <li className="flex items-start gap-2">
                <Wallet className="w-4 h-4 mt-1 text-[var(--brand-primary)] flex-shrink-0" />
                <span>Platform fee 0.15% (minimum $0.25) — paid by the invoice creator on activation</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-1 text-[var(--brand-primary)] flex-shrink-0" />
                <span>1099 / IRIS-oriented CSV exports for accountants</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ========== WHITEPAPER ========= */}
        <section id="whitepaper" className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-2xl font-semibold">Whitepaper — Business Model</h2>
          </div>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 space-y-6 text-[var(--text-secondary)] leading-relaxed">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">1. Core thesis</h3>
              <p>
                Traditional invoicing and payment processors (banks, Stripe, PayPal, and similar services)
                extract high fees, hold funds, can freeze accounts, and create friction. UrsaDeFi replaces
                that stack with a non-custodial, XRPL-native system that is dramatically cheaper and keeps
                control with the user.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">2. Fee model</h3>
              <p className="mb-3">
                Platform fee: <strong className="text-[var(--text-primary)]">0.15%</strong> of the service amount
                (minimum <strong className="text-[var(--text-primary)]">$0.25</strong> per activated invoice).
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Draft invoices are free.</li>
                <li>The fee is charged to the <strong>invoice creator</strong> when the invoice is activated.</li>
                <li>The end client pays only the total shown on the invoice. No separate platform-fee step for the client.</li>
                <li>This model produces revenue for UrsaDeFi whenever real commercial activity is activated.</li>
              </ul>
              <p className="mt-3">
                Optional features such as minting an invoice as an XRPL NFT can carry additional small costs
                paid by the creator.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">3. Why this model</h3>
              <p>
                Charging the end client a separate platform fee creates friction and complicates payment flows.
                Waiting until the client pays is hard to enforce in a fully non-custodial design.
              </p>
              <p className="mt-2">
                Charging the invoice creator a small, transparent fee at activation is simple, enforceable,
                and keeps the client experience clean. Drafts remain free so users can prepare work without cost.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">4. Non-custodial guarantee</h3>
              <p>
                UrsaDeFi never holds user funds or private keys. All signing happens inside the user&apos;s own
                Xaman wallet. The platform fee is a standard XRPL Payment from the creator&apos;s wallet to the
                official fee address:
              </p>
              <p className="mt-2 font-mono text-sm text-[var(--text-primary)] break-all">
                rs6nu5gcDn6HYLzd6HCFNLp6UjXDyYYTQi
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">5. Audience</h3>
              <p>
                Primary users are freelancers, independent operators, and small businesses who want lower fees
                and full key control. The product is also designed so autonomous agents and programmatic clients
                can create and activate invoices with predictable fee behavior.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">6. Roadmap</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Phase 1 (current): Fee on activation + optional XRPL NFT minting of invoices.</li>
                <li>Phase 2: Deeper payment monitoring and optional settlement flows.</li>
                <li>Phase 3: Expanded tooling and integrations for human and agent users.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ========== TUTORIAL ========= */}
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
                <p>On the home page you have two clear options:</p>
                <div className="grid gap-3">
                  <div className="border border-[var(--border-color)] rounded-xl p-4">
                    <p className="font-medium text-[var(--text-primary)] mb-1">Try Demo</p>
                    <p>
                      Explore the full app with a fixed test XRPL address. No real wallet is connected.
                      Ideal for learning the interface safely.
                    </p>
                  </div>
                  <div className="border border-[var(--border-color)] rounded-xl p-4">
                    <p className="font-medium text-[var(--text-primary)] mb-1">Connect with Xaman</p>
                    <p>
                      Link your real XRPL wallet. This is the path for actual invoicing, activation fees, and payments.
                    </p>
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
                Open <strong className="text-[var(--text-primary)]">Profile</strong> and add your company name,
                address, EIN (if applicable), and logo. This information appears on the invoices your clients receive.
              </p>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-sm font-bold">3</span>
                <h3 className="text-lg font-semibold">Create and activate invoices</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Create invoices from the Dashboard. Drafts are free. When you activate an invoice, the platform fee
                (0.15%, minimum $0.25) is charged to your wallet via Xaman. Your client pays the total shown on the invoice.
              </p>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-sm font-bold">4</span>
                <h3 className="text-lg font-semibold">Track, mark paid, and export</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Monitor outstanding invoices, mark them paid when funds arrive, optionally mint them as XRPL NFTs,
                and export clean CSVs for your accountant from the Reports page.
              </p>
            </div>
          </div>
        </section>

        {/* ========== DOCS ========= */}
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

        {/* ========== FAQ ========= */}
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
          UrsaDeFi · Non-custodial XRPL invoicing · Platform fee 0.15% (min $0.25)
        </p>
      </div>
    </div>
  );
}
