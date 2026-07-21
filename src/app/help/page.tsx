'use client';

import Link from 'next/link';
import {
  BookOpen, FileText, Shield, Wallet, HelpCircle,
  ExternalLink, ArrowLeft, Layers, Download, Play, Key
} from 'lucide-react';

const docs = [
  {
    title: 'Getting Started',
    description: 'Connect Xaman, set up your company profile, and send your first invoice.',
    status: 'Available',
    href: '#getting-started',
  },
  {
    title: 'Product Overview',
    description: 'What UrsaDeFi is, who it\'s for, and how XRPL invoicing works.',
    status: 'Available',
    href: '#about',
  },
  {
    title: 'Tax & IRIS CSV Export',
    description: 'How to export accountant-ready reports and use the Reports page.',
    status: 'Available soon',
    href: '#tax',
  },
  {
    title: 'Whitepaper (Technical)',
    description: 'Architecture, non-custodial design, XRPL settlement, and roadmap.',
    status: 'Coming soon',
    href: '#',
  },
];

const faqs = [
  {
    q: 'What is the difference between "Try Demo" and "Connect with Xaman"?',
    a: '"Try Demo" loads a fixed test account so you can explore the interface without connecting a real wallet. "Connect with Xaman" uses your actual XRPL wallet. Nothing you do in Demo mode affects a real wallet.',
  },
  {
    q: 'Do I need to create a password?',
    a: 'No. You sign in with your XRPL wallet via Xaman. No passwords, no seed phrases stored by us.',
  },
  {
    q: 'Is UrsaDeFi custodial?',
    a: 'No. 100% non-custodial. Your keys stay in Xaman. We never hold your funds.',
  },
  {
    q: 'What network is this on?',
    a: 'Currently XRPL Testnet for MVP testing. Mainnet settlement is the next production step.',
  },
  {
    q: 'How do invoices get paid?',
    a: 'Each invoice includes an XRP amount and a QR code. Clients scan with Xaman to pay. You can also mark invoices paid manually.',
  },
  {
    q: 'Can I export data for my accountant?',
    a: 'Yes. Use the Reports page to export a CSV designed for tax/IRIS workflows and print a summary with your company EIN. IRIS upload compatible.',
  },
  {
    q: 'What does it cost?',
    a: 'Target fee is ~0.15% max on settlement (with a small minimum). Core invoicing and CSV tools are built for freelancers and small operators first.',
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
            How UrsaDeFi works, a short tutorial, and answers — no login required.
          </p>
        </div>

        {/* About */}
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
                <span>Pay ~0.15% max — keep the rest</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-1 text-[var(--brand-primary)] flex-shrink-0" />
                <span>1099 / IRIS-oriented exports for accountants</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Tutorial / Getting Started */}
        <section id="getting-started" className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-2xl font-semibold">Tutorial — Getting Started</h2>
          </div>

          <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
            Two ways to enter the app. Choose the one that fits what you want to do right now.
          </p>

          {/* Two entry paths */}
          <div className="grid gap-4 mb-8">
            {/* Try Demo card */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Play className="w-4 h-4 text-[var(--brand-primary)]" />
                <h3 className="font-semibold">Option 1 — Try Demo</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                Click <strong className="text-[var(--text-primary)]">Try Demo</strong> on the home page.
                This loads a fixed test account so you can click around the interface, create sample invoices,
                and explore every page without connecting a real wallet.
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Nothing you do in Demo mode touches a real XRPL account.
              </p>
            </div>

            {/* Real connect card */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-[var(--brand-primary)]" />
                <h3 className="font-semibold">Option 2 — Connect with Xaman (recommended)</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                Click <strong className="text-[var(--text-primary)]">Connect with Xaman</strong>, scan the QR code
                with the Xaman app on your phone, and approve the SignIn request. Your real wallet address
                becomes your login. All invoices and clients will be tied to that address.
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                We never see or store your seed phrase or private keys.
              </p>
            </div>
          </div>

          {/* After you are inside */}
          <h3 className="font-semibold text-lg mb-3">Once you\'re inside</h3>
          <ol className="space-y-3">
            {[
              {
                title: 'Set up your Profile',
                desc: 'Go to Profile. Add your company name, address, EIN (optional but useful for exports), and logo. This information appears on your invoices.',
              },
              {
                title: 'Add clients',
                desc: 'Open the Clients page and create the people or companies you bill. You can also add a new client while creating an invoice.',
              },
              {
                title: 'Create an invoice',
                desc: 'From the Dashboard or Invoices page, fill in the invoice name, client, description, and service amount. The platform fee and XRP amount are calculated automatically.',
              },
              {
                title: 'Save or Mint as NFT',
                desc: 'Save the invoice as a draft, or Mint it as an XRPL NFT (requires the higher minimum amount). Minting creates a permanent on-chain record.',
              },
              {
                title: 'Send & track',
                desc: 'Download the PDF, share the payment QR, or send a reminder. Mark the invoice paid when funds arrive.',
              },
              {
                title: 'Export for taxes',
                desc: 'Use the Reports page to generate a CSV ready for your accountant or IRIS-style workflows.',
              },
            ].map((step, i) => (
              <li
                key={i}
                className="flex gap-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3.5"
              >
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] flex items-center justify-center text-sm font-semibold">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-sm">{step.title}</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)]">Tip:</strong> You can switch from Demo mode to your real wallet at any time by returning to the home page and connecting with Xaman.
          </div>
        </section>

        {/* Docs */}
        <section id="docs" className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-2xl font-semibold">Docs & Whitepapers</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Instruction manuals and technical papers will live here.
          </p>
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

        {/* FAQ */}
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

        <section className="mb-10">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
            <h3 className="font-semibold mb-2">AI Help Agent (planned)</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Next phase: an in-app assistant that answers product questions, walks through invoicing,
              and points you to the right doc — without leaving UrsaDeFi.
            </p>
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
