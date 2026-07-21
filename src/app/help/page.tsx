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
    a: 'Platform fee is 0.15% of the service amount (minimum $0.25 per invoice). Core invoicing and CSV tools are built for freelancers and small operators first.',
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
            How UrsaDeFi works, a full product tutorial, and answers — no login required.
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
                <span>Platform fee 0.15% (min $0.25) — keep the rest</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-1 text-[var(--brand-primary)] flex-shrink-0" />
                <span>1099 / IRIS-oriented exports for accountants</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ========== TUTORIAL ========= */}
        <section id="getting-started" className="mb-14">
          <div className="flex items-center gap-2 mb-4">
            <PlayCircle className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-2xl font-semibold">Tutorial — Getting Started</h2>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
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
                      No real wallet is connected. Perfect for learning the interface, creating sample invoices,
                      and testing the flow without any risk.
                    </p>
                  </div>
                  <div className="border border-[var(--border-color)] rounded-xl p-4">
                    <p className="font-medium text-[var(--text-primary)] mb-1">Connect with Xaman</p>
                    <p>
                      Links your real XRPL wallet. This is the path for actual invoicing and payments.
                      Scan the QR code with the Xaman app on your phone and approve the sign-in.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  You can switch from Demo to a real wallet at any time by returning to the home page and connecting with Xaman.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-sm font-bold">2</span>
                <h3 className="text-lg font-semibold">Set up your Profile</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Go to <strong className="text-[var(--text-primary)]">Profile</strong> in the left sidebar (or bottom nav on mobile).
                Fill in your company name, address, EIN (if applicable), and upload a logo.
                This information appears on the invoices and PDFs your clients receive.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-sm font-bold">3</span>
                <h3 className="text-lg font-semibold">Add clients</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Open the <strong className="text-[var(--text-primary)]">Clients</strong> page and add the people or companies you bill.
                You can also create a new client directly while building an invoice.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-sm font-bold">4</span>
                <h3 className="text-lg font-semibold">Create your first invoice</h3>
              </div>
              <div className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-3">
                <p>
                  From the Dashboard, use the <strong className="text-[var(--text-primary)]">Create Invoice</strong> button
                  (right sidebar on desktop, floating button on mobile).
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Enter an invoice name and select or create a client</li>
                  <li>Add a description of the work</li>
                  <li>Set the service amount (minimum $25)</li>
                  <li>Choose a due date</li>
                </ul>
                <p>
                  The platform fee (0.15%, minimum $0.25) is calculated automatically and shown transparently
                  so your client can see the full breakdown.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-sm font-bold">5</span>
                <h3 className="text-lg font-semibold">Save or Mint as NFT</h3>
              </div>
              <div className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">
                <p>
                  <strong className="text-[var(--text-primary)]">Save Invoice</strong> stores it in your account as a draft.
                </p>
                <p>
                  <strong className="text-[var(--text-primary)]">Mint as XRPL NFT</strong> creates a permanent,
                  on-chain record of the invoice (minimum service amount $50). You’ll be prompted to approve the transaction in Xaman.
                </p>
              </div>
            </div>

            {/* Step 6 */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center text-sm font-bold">6</span>
                <h3 className="text-lg font-semibold">Send, track & export</h3>
              </div>
              <div className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">
                <p>
                  Download the PDF, share the payment QR, or send a reminder.
                  Mark invoices as paid when funds arrive.
                </p>
                <p>
                  When tax time comes, go to <strong className="text-[var(--text-primary)]">Reports</strong>
                  and export a clean CSV for your accountant (IRIS / 1099 friendly).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== DOCS ========= */}
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
