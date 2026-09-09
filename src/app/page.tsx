'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import XRPLConnect from '@/components/XRPLConnect';
import { useWallet } from '@/context/WalletContext';

export default function Landing() {
  const router = useRouter();
  const { wallet, isReady } = useWallet();

  useEffect(() => {
    if (isReady && wallet?.address) {
      router.replace('/dashboard');
    }
  }, [isReady, wallet, router]);

  if (!isReady || wallet?.address) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-secondary)]">
        <div className="text-sm">{wallet?.address ? 'Opening your workspace\u2026' : 'Loading\u2026'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="text-center max-w-md px-4">
        <div className="flex justify-center mb-6">
          <img
            src="/ursa-logo.png"
            alt="UrsaDeFi Logo \u2014 non-custodial XRPL invoicing"
            className="w-20 h-20 object-contain"
          />
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter mb-4">URSADEFI</h1>

        <p className="text-[var(--text-secondary)] text-base sm:text-lg mb-8 leading-relaxed">
          Non-custodial XRPL invoicing.
          <br />
          Free drafts. 0.15% when paid. No monthly fee.
          <br />
          <span className="text-sm text-[var(--text-muted)]">Tax CSV US \u00b7 Europe \u00b7 Japan \u00b7 Settle in XRP \u00b7 Keep your keys</span>
        </p>

        <XRPLConnect />

        <div className="mt-10 flex items-center justify-center gap-4 text-sm">
          <Link
            href="/help"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
          >
            About
          </Link>
          <span className="text-[var(--text-muted)]">\u00b7</span>
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
