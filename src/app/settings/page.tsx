'use client';

import { useWallet } from '@/context/WalletContext';
import Link from 'next/link';
import LeftSidebar from '@/components/layout/LeftSidebar';
import { Settings, Wallet, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { wallet, disconnect, isConnected } = useWallet();

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="w-72 border-r border-[var(--border-color)] hidden lg:block flex-shrink-0">
        <LeftSidebar />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-8">
            <Settings className="w-7 h-7 text-[var(--brand-primary)]" />
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          </div>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 space-y-6">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Connected Wallet</p>
              {isConnected && wallet?.address ? (
                <p className="font-mono text-sm break-all">{wallet.address}</p>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">No wallet connected</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-full text-sm font-medium transition"
              >
                <Wallet className="w-4 h-4" />
                {isConnected ? 'Switch Wallet' : 'Connect Wallet'}
              </Link>

              {isConnected && (
                <button
                  onClick={disconnect}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 border border-red-900/50 text-red-400 hover:bg-red-950/30 rounded-full text-sm transition"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-[var(--text-muted)] text-center mt-8">
            UrsaDeFi is non-custodial. Your keys stay in Xaman.
          </p>
        </div>
      </div>
    </div>
  );
}
