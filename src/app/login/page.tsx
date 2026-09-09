'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import XRPLConnect from '@/components/XRPLConnect';
import Image from 'next/image';
import HeroBackdrop from '@/components/layout/HeroBackdrop';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const router = useRouter();
  const { wallet, isReady, setWallet } = useWallet();

  useEffect(() => {
    if (isReady && wallet) {
      router.replace('/dashboard');
    }
  }, [isReady, wallet, router]);

  if (!isReady) {
    return (
      <div className="relative min-h-screen flex items-center justify-center text-[var(--text-primary)]">
        <HeroBackdrop intensity="hero" />
        <div className="relative z-10 text-center">
          <div className="text-2xl font-bold mb-4">Loading...</div>
        </div>
      </div>
    );
  }

  if (wallet) {
    return null;
  }

  const handleConnect = (connectedWallet: { address: string; publicKey: string }) => {
    setWallet(connectedWallet);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 text-[var(--text-primary)]">
      <HeroBackdrop intensity="hero" />
      <div className="relative z-10 max-w-md w-full">
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-3">
            <Image src="/1_ursadefi_logo.png" alt="UrsaDeFi" width={64} height={64} className="rounded-full" />
            <div>
              <h1 className="text-4xl font-bold tracking-tighter">UrsaDeFi</h1>
              <p className="text-[var(--brand-primary)] text-sm -mt-1">XRPL Invoicing</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)]/90 backdrop-blur-md border border-[var(--border-color)] rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-1">Welcome</h2>
            <p className="text-[var(--text-secondary)]">Sign in with your XRPL wallet</p>
          </div>

          <XRPLConnect onConnect={handleConnect} />
        </div>

        <div className="text-center mt-6 text-xs text-[var(--text-secondary)]">
          Secure • No passwords • Self-custodial
        </div>
      </div>
    </div>
  );
}
