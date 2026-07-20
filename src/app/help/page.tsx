'use client';

import Link from 'next/link';
import {
  BookOpen, FileText, Shield, Wallet, HelpCircle,
  ExternalLink, ArrowLeft, Layers, Download
} from 'lucide-react';

const docs = [
  {
    title: 'Getting Started',
    description: 'Connect Xaman, set up your company profile, and send your first invoice.',
    status: 'Available soon',
    href: '#getting-started',
  },
  {
    title: 'Product Overview',
    description: 'What UrsaDeFi is, who it’s for, and how XRPL invoicing works.',
    status: 'Available soon',
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
    a: 'Yes. Use the Reports page to export a CSV designed for tax/IRIS workflows and print a summary with your company EIN.',
  },
  {
    q: 'What does it cost?',
    a: 'Target fee is ~0.15% max on settlement. Core invoicing and CSV tools are built for freelancers and small operators first.',
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
          <h1 className="text-4xl font-bold tracking-tight mb-3">About & Help</h1>
          <p className="text-[var(--text-secondary)] text-lg">
            How UrsaDeFi works, docs, and answers — no login required.
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

        {/* Getting started */}
        <section id="getting-started" className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-2xl font-semibold">Getting Started</h2>
          </div>
          <ol className="space-y-3">
            {[
              'Connect with Xaman (or sign in as an existing user).',
              'Open Profile and fill in your company name, address, EIN, and logo.',
              'Add clients from the Clients page.',
              'Create an invoice from the Dashboard.',
              'Send the PDF / reminder. Mark paid when funds arrive.',
              'Use Reports to export CSV for your accountant.',
            ].map((step, i) => (
              <li
                key={i}
                className="flex gap-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3"
              >
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] flex items-center justify-center text-sm font-semibold">
                  {i + 1}
                </span>
                <span className="text-sm pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Docs / Whitepapers */}
        <section id="docs" className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-2xl font-semibold">Docs & Whitepapers</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Instruction manuals and technical papers will live here. Placeholders are ready for upload.
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

        {/* AI agent teaser */}
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
