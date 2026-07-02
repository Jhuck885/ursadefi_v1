'use client';

import InvoiceFeed from '@/components/invoice/InvoiceFeed';
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
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-20">
      {!wallet && (
        <div className="mb-6 p-4 bg-yellow-950/60 border border-yellow-600/60 rounded-2xl text-sm text-yellow-200">
          Connect your Xaman wallet from the homepage for full features (demo mode still works below).
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tighter">Activities</h1>
        <p className="text-zinc-400 mt-1 text-sm">Your XRPL activity • Create via the blue button in the right sidebar or the form below</p>
      </div>

      <InvoiceFeed />

      {/* Optional inline form for power users — or rely on the modal in RightSidebar */}
      <div className="mt-12 pt-8 border-t border-zinc-800">
        <h3 className="font-semibold mb-4 text-lg tracking-tight">Quick Create</h3>
        <p className="text-xs text-zinc-500 mb-4">Inline form (modal version in right sidebar is recommended for focus)</p>
        {/* InvoiceForm can be added here if you prefer inline always visible. For X-feed style, the modal keeps the main column clean like Twitter posts. */}
      </div>
    </div>
  );
}