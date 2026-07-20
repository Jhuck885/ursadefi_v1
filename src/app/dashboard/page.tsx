'use client';

import InvoiceFeed from '@/components/invoice/InvoiceFeed';
import CreateInvoiceButton from '@/components/layout/CreateInvoiceButton';
import { useWallet } from '@/context/WalletContext';

export default function DashboardPage() {
  const { wallet, isReady } = useWallet();

  if (!isReady) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-zinc-500">
        Loading wallet...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-2 pb-20">
      {!wallet && (
        <div className="mb-6 p-4 bg-yellow-950/60 border border-yellow-600/60 rounded-2xl text-sm text-yellow-200">
          Connect your Xaman wallet from the homepage for full features (demo mode still works below).
        </div>
      )}

      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tighter">Activity</h1>
        {/* Visible on tablet / when right sidebar is hidden */}
        <div className="lg:hidden">
          <CreateInvoiceButton variant="inline" />
        </div>
      </div>

      <InvoiceFeed />
    </div>
  );
}
