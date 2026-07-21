'use client';

import Link from 'next/link';
import {
  BookOpen, FileText, Shield, Wallet, HelpCircle,
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
    description: 'What UrsaDeFi is, who it’s for, and how XRPL invoicing works.',
    status: 'Live',
    href: '#about',
  },
  {
    title: 'Whitepaper',
    description: 'Business model, fee structure, and non-custodial design.',
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
    q: 'Do I need to create a password?',
    a: 'No. You sign in with your XRPL wallet via Xaman. No passwords, no seed phrases stored by us.',
  },
  {
    q: 'Is UrsaDeFi custodial?',
    a: 'No. 100% non-custodial. Your keys stay in Xaman. We never hold your funds.',
  },
  {
    q: 'What is the “Try Demo” button?',
    a: 'Try Demo lets you explore the full app using a fixed test XRPL address. No real wallet is connected. Perfect for learning the interface safely. When you’re ready for real work, disconnect and connect with Xaman instead.',
  },
  {
    q: 'How do invoices get paid?',
    a: 'Each invoice includes an XRP amount and a QR code. Clients scan with Xaman to pay. You can also mark invoices paid manually.',
  },
  {
    q: 'Can I export data for my accountant?',
    a: 'Yes. Use the Reports page to export a CSV designed for tax/IRIS workflows and print a summary with your company EIN.',
  },
  {
    q: 'What does it cost?',
    a: 'Platform fee is 0.15% of the service amount (minimum $0.25). The fee is paid by the invoice creator when the invoice is activated. Draft invoices are free. End clients simply pay the total shown on the invoice.',
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
          <h1 className="text-4xl font-bold tracking-tight mb-3">About</h1>
          <p className="text-[var(--text-secondary)] text-lg">
            How UrsaDeFi works, the business model, and a full product tutorial.
          </p>
        </div>

        {/* ========== ABOUT ========= */}
        <section id="about" className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-2xl font-semibold">About UrsaDeFi</h2>
          </div>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 space-y-4 text-[var(--text-secondary)] leading-relaxed">
            <p>
              <strong className="text-[var(--text-primary)]">UrsaDeFi</strong> is XRPL-native invoicing
              built in Dallas, TX for freelancers, operators, and small businesses who want to bill in USD,
              settle in XRP, and keep control of their keys.
            </p>
            <p>
              Create invoices, manage clients, track outstanding balances, export tax-ready CSVs,
              and send payment reminders — without giving up custody of funds.
            </p>
            <ul className="space-y-2 pt-2">
              <li className="flex items-start gap-2">
                <Shield className="w-4 h-4 mt-1 text-[var(--brand-primary)] flex-shrink-0" />
                <span>Non-custodial — wallet stays in Xaman</span>
              </li>
              <li className="flex items-start gap-2">
                <Wallet className="w-4 h-4 mt-1 text-[var(--brand-primary)] flex-shrink-0" />
                <span>Platform fee 0.15% (min $0.25) — paid by the invoice creator on activation</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-1 text-[var(--brand-primary)] flex-shrink-0" />
                <span>1099 / IRIS-oriented exports for accountants</span>
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
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">1. Core Thesis</h3>
              <p>
                Traditional invoicing and payment processors (banks, Stripe, PayPal, etc.) extract high fees,
                hold funds, impose arbitrary freezes, and create friction. UrsaDeFi replaces that stack with a
                non-custodial, XRPL-native system that is dramatically cheaper.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">2. Fee Model (Guaranteed Revenue)</h3>
              <p className="mb-3">
                Platform fee: <strong className="text-[var(--text-primary)]">0.15%</strong> of the service amount
                (minimum $0.25 per invoice).
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Draft invoices are free.</li>
                <li>The fee is charged to the <strong>invoice creator</strong> when the invoice is activated/sent.</li>
                <li>The end client simply pays the total amount shown on the invoice. No extra steps or notices.</li>
                <li>This model guarantees UrsaDeFi is paid whenever real commercial activity occurs.</li>
              </ul>
              <p className="mt-3">
                Special services (minting an invoice as an XRPL NFT, advanced features, etc.) can carry additional
                small fees paid by the creator.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">3. Why This Model</h3>
              <p>
                Charging the end client a separate “platform fee” creates friction and requires complex payment
                splitting. Charging only when the client pays is unreliable and hard to enforce non-custodially.
              </p>
              <p className="mt-2">
                Charging the invoice creator a tiny fee at the moment of activation is simple, enforceable,
                and keeps the experience clean for everyone. Draft invoices remain free.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">4. Non-Custodial Guarantee</h3>
              <p>
                UrsaDeFi never holds user funds or private keys. All signing happens in the user’s own Xaman wallet.
                The platform fee is a normal XRPL Payment from the creator’s wallet to the official fee address:
              </p>
              <p className="mt-2 font-mono text-sm text-[var(--text-primary)] break-all">
                rs6nu5gcDn6HYLzd6HCFNLp6UjXDyYYTQi
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">5. Roadmap Notes</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Phase 1: Fee charged to creator on invoice activation + optional NFT minting.</li>
                <li>Phase 2: Deeper payment monitoring and optional automatic settlement flows.</li>
                <li>Phase 3: Expanded tooling and integrations.</li>
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
                      Instantly explores the full app using a fixed test XRPL address.
                      No real wallet is connected. Perfect for learning the interface safely.
                    </p>
                  </div>
                  <div className="border border-[var(--border-color)] rounded-xl p-4">
                    <p className="font-medium text-[var(--text-primary)] mb-1">Connect with Xaman</p>
                    <p>
                      Links your real XRPL wallet. This is the path for actual invoicing and payments.
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
                Go to <strong className="text-[var(--text-primary)]">Profile</strong> and fill in your company details.
                This information appears on the invoices your clients receive.
              </p>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-sm font-bold">3</span>
                <h3 className="text-lg font-semibold">Create and activate invoices</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Create invoices from the Dashboard. Drafts are free. When you activate/send an invoice,
                the small platform fee (0.15%, min $0.25) is charged to your wallet. Your client simply pays the total.
              </p>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-sm font-bold">4</span>
                <h3 className="text-lg font-semibold">Track, mark paid, and export</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Monitor outstanding invoices, mark them paid when funds arrive, and export clean CSVs for your accountant.
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
              <div
                key={doc.title}
                className="flex items-center justify-between gap-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">{doc.description}</p>
                </div>
                <span className="text-xs text-[var(--text-muted)] whitespace-nowrap flex-shrink-0">
                  {doc.status}
                </span>
              </div>
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
          UrsaDeFi • Dallas, TX • Non-custodial XRPL invoicing
        </p>
      </div>
    </div>
  );
}
