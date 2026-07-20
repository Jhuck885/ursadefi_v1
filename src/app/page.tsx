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
            alt="UrsaDeFi Logo"
            className="w-20 h-20 object-contain"
          />
        </div>

        <h1 className="text-6xl font-bold tracking-tighter mb-4">URSADEFI</h1>
        <p className="text-xl mb-8 text-[var(--text-secondary)]">
          XRPL Invoicing • Dallas, TX • Pay 0.15% max, keep the rest
        </p>
        <XRPLConnect />
        <div className="mt-8 text-xs text-[var(--text-secondary)]">
          2 free CSVs/year • 100% non-custodial • 1099-ready
        </div>
        <div className="mt-6">
          <Link
            href="/help"
            className="text-sm text-[var(--brand-primary)] hover:underline"
          >
            About & Help
          </Link>
        </div>
      </div>
    </div>
  );
}
