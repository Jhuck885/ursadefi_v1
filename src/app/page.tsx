'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import XRPLConnect from '@/components/XRPLConnect';
import { useWallet } from '@/context/WalletContext';
import HeroBackdrop from '@/components/layout/HeroBackdrop';

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
      <div className="relative min-h-screen flex items-center justify-center text-[var(--text-secondary)]">
        <HeroBackdrop intensity="hero" />
        <div className="relative z-10 text-sm">{wallet?.address ? 'Opening your workspace...' : 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center text-[var(--text-primary)]">
      <HeroBackdrop intensity="hero" />
      <div className="relative z-10 text-center max-w-md px-4">
        <div className="flex justify-center mb-6">
          <img
            src="/ursa-logo.png"
            alt="UrsaDeFi Logo - non-custodial XRPL invoicing"
            className="w-20 h-20 object-contain"
          />
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter mb-4">URSADEFI</h1>

        <p className="text-[var(--text-secondary)] text-base sm:text-lg mb-8 leading-relaxed">
          Non-custodial XRPL invoicing.
          <br />
          Free drafts. 0.15% when paid. No monthly fee.
          <br />
          <span className="text-sm text-[var(--text-muted)]">
            Tax CSV US / Europe / Japan / Settle in XRP / Keep your keys
          </span>
        </p>

        <XRPLConnect />

        <div className="mt-10 flex items-center justify-center gap-4 text-sm">
          <Link
            href="/help"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
          >
            About
          </Link>
          <span className="text-[var(--text-muted)]">/</span>
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
