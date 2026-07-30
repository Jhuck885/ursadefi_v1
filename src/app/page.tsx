'use client';
import Link from 'next/link';
import XRPLConnect from '@/components/XRPLConnect';

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="text-center max-w-lg px-4">
        <div className="flex justify-center mb-6">
          <img
            src="/ursa-logo.png"
            alt="UrsaDeFi Logo — non-custodial XRPL invoicing"
            className="w-20 h-20 object-contain"
          />
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter mb-4">URSADEFI</h1>

        <p className="text-[var(--text-secondary)] text-base sm:text-lg mb-2 leading-relaxed">
          Non-custodial XRPL invoicing for freelancers and small businesses.
        </p>
        <p className="text-[var(--text-muted)] text-sm mb-3 leading-relaxed">
          Bill in USD. Settle in XRP. Keep your keys in Xaman.
        </p>

        {/* Pricing hierarchy — no $50 anywhere on the door */}
        <div className="mb-8 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-5 py-4 text-left text-sm space-y-2">
          <p className="text-[var(--text-primary)] font-medium">Pricing (simple)</p>
          <ul className="space-y-1.5 text-[var(--text-secondary)]">
            <li>
              <span className="text-[var(--text-primary)] font-medium">Free to start</span>
              {' '}— drafts cost nothing. No signup fee.
            </li>
            <li>
              <span className="text-[var(--text-primary)] font-medium">0.15% platform fee</span>
              {' '}(minimum $0.25) when <em>you</em> activate an invoice — paid from your wallet, not a $50 charge.
            </li>
            <li>
              Optional NFT mint is a separate feature for larger invoices — not required to use UrsaDeFi.
            </li>
          </ul>
        </div>

        <XRPLConnect />

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
          <Link
            href="/help"
            className="text-[var(--brand-primary)] hover:underline"
          >
            About UrsaDeFi
          </Link>
          <span className="hidden sm:inline text-[var(--text-muted)]">·</span>
          <Link
            href="/help#whitepaper"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          >
            Business model
          </Link>
          <span className="hidden sm:inline text-[var(--text-muted)]">·</span>
          <Link
            href="/help#faq"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          >
            FAQ
          </Link>
        </div>

        <p className="mt-10 text-xs text-[var(--text-muted)]">
          Dallas, TX · Non-custodial · XRPL-native · No $50 to join
        </p>
      </div>
    </div>
  );
}
