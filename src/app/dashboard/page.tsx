'use client';
import InvoiceFeed from '@/components/invoice/InvoiceFeed';
import InvoiceForm from '@/components/invoice/InvoiceForm';
import { useWallet } from '@/context/WalletContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { wallet, isReady } = useWallet();
  const router = useRouter();

  // Basic protection: redirect to home if not connected (after ready)
  useEffect(() => {
    if (isReady && !wallet) {
      // Soft prompt instead of hard redirect for better UX
      // router.push('/');
    }
  }, [isReady, wallet, router]);

  if (!isReady) {
    return <div className="flex h-screen items-center justify-center text-zinc-500">Loading wallet...</div>;
  }

  return (
    <div className="flex h-screen pt-16">
      {/* LEFT nav - now enhanced with wallet + CSV */}
      <div className="w-72 border-r border-zinc-800 p-4 hidden lg:block">
        {/* LeftSidebar is rendered by dashboard/layout.tsx */}
      </div>

      {/* CENTER thread */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-4 pt-8">
          {!wallet && (
            <div className="mb-6 p-4 bg-yellow-950/50 border border-yellow-600 rounded-2xl text-sm">
              Connect your Xaman wallet on the homepage for full dashboard features (demo still works).
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Invoice Feed</h2>
            <p className="text-zinc-400 text-sm">Your saved invoices appear here. Use the form below or the + button in the right sidebar.</p>
          </div>

          <InvoiceFeed />
        </div>

        <div className="max-w-2xl mx-auto p-4 border-t border-zinc-800 mt-8">
          <div className="mb-4">
            <h3 className="font-semibold text-lg">Quick Create (Inline)</h3>
            <p className="text-xs text-zinc-500">Or use the modal from Right Sidebar for focused entry</p>
          </div>
          <InvoiceForm onSuccess={() => window.location.reload()} />
        </div>
      </div>

      {/* RIGHT - rendered by layout */}
      <div className="w-80 border-l border-zinc-800 p-4 hidden xl:block">
        {/* RightSidebar content lives in layout */}
      </div>
    </div>
  );
}