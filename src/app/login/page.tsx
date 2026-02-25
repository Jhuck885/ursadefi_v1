'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import XRPLConnect from '@/components/XRPLConnect';
import Image from 'next/image';

export const dynamic = 'force-dynamic'; // forces dynamic rendering so useWallet never runs on server (fixes prerender error)

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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0c10]">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Loading...</div>
        </div>
      </div>
    );
  }

  if (wallet) {
    return null;
  }

  const handleConnect = (connectedWallet: { address: string; publicKey: string }) => {
    console.log('Demo connect triggered:', connectedWallet.address);
    setWallet(connectedWallet);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] px-4">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-3">
            <Image src="/1_ursadefi_logo.png" alt="UrsaDeFi" width={64} height={64} className="rounded-full" />
            <div>
              <h1 className="text-4xl font-bold tracking-tighter text-white">UrsaDeFi</h1>
              <p className="text-[#1D9BF0] text-sm -mt-1">XRPL Invoicing</p>
            </div>
          </div>
        </div>

        <div className="bg-[#16181c] border border-gray-800 rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white mb-1">Welcome</h2>
            <p className="text-gray-400">Sign in with your XRPL wallet</p>
          </div>

          <XRPLConnect onConnect={handleConnect} />
        </div>

        <div className="text-center mt-6 text-xs text-gray-500">
          Secure • No passwords • Self-custodial
        </div>
      </div>
    </div>
  );
}