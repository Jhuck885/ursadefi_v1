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
    a: 'UrsaDeFi is a non-custodial, XRPL-native invoicing platform built in Dallas, Texas. Freelancers, operators, and small businesses create invoices in USD, settle in XRP, optionally mint invoices as XRPL NFTs, and export tax-ready data — while keeping full control of their private keys in Xaman.',
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
    a: 'The platform fee is 0.15% of the service amount, with a minimum of $0.25 per activated invoice. Draft invoices are free. The fee is paid by the invoice creator when the invoice is activated. End clients simply pay the total shown on the invoice.',
  },
  {
    q: 'What are the minimum amounts?',
    a: 'Minimum invoice (service) amount is $25. Minimum amount to mint an invoice as an XRPL NFT is $50. The platform fee has a floor of $0.25 even when 0.15% would be lower. These floors keep network costs, fee collection, and on-chain records economically sensible.',
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
    a: 'The platform fee is paid on the XRP Ledger to the official UrsaDeFi fee address: rwBJnEt8bcS558KTQTSKKRKLBZ7N1YJFJD. It is a normal non-custodial Payment transaction signed in Xaman.',
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
                <dd className="text-[var(--text-primary)]">0.15% of service amount (minimum $0.25) per activated invoice</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-[var(--text-muted)] sm:w-44 flex-shrink-0">Who pays the fee</dt>
                <dd className="text-[var(--text-primary)]">Invoice creator, on activation. Drafts are free.</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-[var(--text-muted)] sm:w-44 flex-shrink-0">Min. invoice amount</dt>
                <dd className="text-[var(--text-primary)]">$25 service amount</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="text-[var(--text-muted)] sm:w-44 flex-shrink-0">Min. to mint NFT</dt>
                <dd className="text-[var(--text-primary)]">$50 service amount</dd>
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
                <dt className="text-[var(--text-muted)] sm:w-44 flex-shrink-0">Fee address</dt>
                <dd className="text-[var(--text-primary)] font-mono text-xs break-all">rwBJnEt8bcS558KTQTSKKRKLBZ7N1YJFJD</dd>
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
                  Below that, network fees and operational cost would eat too large a share of the
                  value, and the platform fee floor would feel disproportionate. $25 keeps real
                  commercial use cases viable while filtering pure noise.
                </p>
              </div>

              <div className="border border-[var(--border-color)] rounded-xl p-4">
                <p className="font-medium text-[var(--text-primary)] mb-1">Minimum to mint as XRPL NFT — $50</p>
                <p className="text-sm">
                  Minting creates a permanent on-chain record. That has a small ledger cost and is
                  intended for invoices worth keeping as durable proof. The $50 floor ensures minting
                  is used for meaningful invoices, not every draft or micro-bill.
                </p>
              </div>

              <div className="border border-[var(--border-color)] rounded-xl p-4">
                <p className="font-medium text-[var(--text-primary)] mb-1">Platform fee floor — $0.25</p>
                <p className="text-sm">
                  The fee is 0.15% of the service amount, but never less than $0.25 per activated invoice.
                  On small invoices, a pure percentage would be too low to cover the cost of processing
                  a non-custodial fee payment on XRPL. The $0.25 minimum keeps fee collection practical
                  without raising the rate for larger invoices.
                </p>
              </div>
            </div>

            <p className="text-sm pt-1">
              Draft invoices remain free at any amount you are still preparing. Minimums apply when you
              activate (for the fee) or when you choose to mint as an NFT.
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
                paid by the creator. Minimum service amount to mint is $50.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">3. Minimums</h3>
              <p className="mb-2">
                Minimum invoice (service) amount is <strong className="text-[var(--text-primary)]">$25</strong>.
                Minimum to mint as an XRPL NFT is <strong className="text-[var(--text-primary)]">$50</strong>.
                Platform fee floor is <strong className="text-[var(--text-primary)]">$0.25</strong>.
              </p>
              <p>
                These floors exist so XRPL network costs, fee collection, and permanent on-chain records stay
                economically rational. They are not meant to exclude small operators — drafts stay free, and
                the fee rate itself remains very low once the floor is cleared.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">4. Why this model</h3>
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
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">5. Login security — XRPL + Xaman</h3>
              <p className="mb-3">
                UrsaDeFi does not use traditional username and password login. Authentication is based on the
                user&apos;s XRPL account, managed through the Xaman wallet. This is intentional and is one of the
                strongest security choices available for a non-custodial financial product.
              </p>
              <p className="mb-3">
                <strong className="text-[var(--text-primary)]">How login works:</strong> the user connects with
                Xaman. Xaman holds the private keys on the user&apos;s device and signs requests only with the
                user&apos;s approval. UrsaDeFi never receives the seed phrase, private key, or any secret that
                could move funds. There is no password database on UrsaDeFi servers to steal, leak, or
                brute-force.
              </p>
              <p className="mb-3">
                <strong className="text-[var(--text-primary)]">Why this is safer than passwords:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1 mb-3">
                <li>No shared secret stored by the application — removes credential stuffing and password reuse risk.</li>
                <li>No seed phrase or private key ever leaves the user&apos;s Xaman wallet.</li>
                <li>Every sensitive action (fee payment, mint, burn) requires an explicit signature in Xaman.</li>
                <li>Compromise of the UrsaDeFi web app cannot drain wallets, because the app cannot sign without Xaman.</li>
              </ul>
              <p className="mb-3">
                <strong className="text-[var(--text-primary)]">Why XRPL + Xaman specifically:</strong> the XRP Ledger
                is a mature, high-throughput public ledger with a long operational history. Xaman is a purpose-built
                XRPL wallet focused on secure signing, payload review, and user control. Together they give UrsaDeFi
                a login and transaction model where identity is the wallet itself, and authorization is cryptographic
                rather than password-based.
              </p>
              <p>
                Demo mode is separate: it uses a fixed test address so people can explore the interface without
                connecting a real wallet. Real commercial use requires connecting Xaman so that every action is
                signed under the user&apos;s own keys.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">6. Non-custodial guarantee</h3>
              <p>
                UrsaDeFi never holds user funds or private keys. All signing happens inside the user&apos;s own
                Xaman wallet. The platform fee is a standard XRPL Payment from the creator&apos;s wallet to the
                official fee address:
              </p>
              <p className="mt-2 font-mono text-sm text-[var(--text-primary)] break-all">
                rwBJnEt8bcS558KTQTSKKRKLBZ7N1YJFJD
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">7. Audience</h3>
              <p>
                Primary users are freelancers, independent operators, and small businesses who want lower fees
                and full key control. The product is also designed so autonomous agents and programmatic clients
                can create and activate invoices with predictable fee behavior.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">8. Roadmap</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Phase 1 (current): Fee on activation + optional XRPL NFT minting of invoices.</li>
                <li>Phase 2: Deeper payment monitoring and optional settlement flows.</li>
                <li>Phase 3: Expanded tooling and integrations for human and agent users.</li>
              </ul>
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
                      Keys stay in Xaman; UrsaDeFi never sees them.
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
                Create invoices from the Dashboard. Drafts are free. Service amount must be at least $25 to activate.
                When you activate, the platform fee (0.15%, minimum $0.25) is charged to your wallet via Xaman.
                Your client pays the total shown on the invoice. Minting as an XRPL NFT requires a $50 minimum.
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
