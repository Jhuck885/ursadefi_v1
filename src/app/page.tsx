'use client';
import Link from 'next/link';
import XRPLConnect from '@/components/XRPLConnect';

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="text-center max-w-md px-4">
        <div className="flex justify-center mb-6">
          <img
            src="/ursa-logo.png"
            alt="UrsaDeFi Logo — non-custodial XRPL invoicing"
            className="w-20 h-20 object-contain"
          />
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter mb-4">URSADEFI</h1>

        <p className="text-[var(--text-secondary)] text-base sm:text-lg mb-8 leading-relaxed">
          Non-custodial XRPL invoicing.
          <br />
          Bill in USD. Settle in XRP. Keep your keys.
        </p>

        <XRPLConnect />

        <div className="mt-10 flex items-center justify-center gap-4 text-sm">
          <Link
            href="/help"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
          >
            About
          </Link>
          <span className="text-[var(--text-muted)]">·</span>
          <Link
            href="/help#faq"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
          >
            FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
