'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import Link from 'next/link';
import LeftSidebar from '@/components/layout/LeftSidebar';
import { Copy, Check, ExternalLink, Wallet, User, Settings, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { wallet, isConnected, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);

  useEffect(() => {
    // Load local stats for now
    try {
      const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      setInvoiceCount(invoices.length);
    } catch {
      setInvoiceCount(0);
    }
  }, []);

  const copyAddress = () => {
    if (!wallet?.address) return;
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddress = wallet?.address
    ? `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}`
    : null;

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">Please connect your wallet to view your profile.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-full text-sm font-medium transition"
          >
            Connect Wallet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Left Navigation */}
      <div className="w-72 border-r border-[var(--border-color)] hidden lg:block flex-shrink-0">
        <LeftSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-[var(--text-secondary)] mt-1">Your wallet and account settings</p>
          </div>

          {/* Wallet Card */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center">
                  <Wallet className="w-7 h-7 text-[var(--brand-primary)]" />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-1">Connected Wallet</p>
                  <p className="font-mono text-lg font-medium">{shortAddress}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={copyAddress}
                  className="flex items-center gap-2 px-4 py-2 border border-[var(--border-color)] hover:bg-[var(--bg-primary)] rounded-full text-sm transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <a
                  href={`https://test.bithomp.com/explorer/${wallet?.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border border-[var(--border-color)] hover:bg-[var(--bg-primary)] rounded-full text-sm transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Explorer
                </a>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-[var(--border-color)]">
              <p className="text-xs text-[var(--text-muted)] mb-1">Full Address</p>
              <p className="font-mono text-sm break-all text-[var(--text-secondary)]">{wallet?.address}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
              <p className="text-sm text-[var(--text-secondary)] mb-1">Invoices Created</p>
              <p className="text-3xl font-bold">{invoiceCount}</p>
            </div>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5">
              <p className="text-sm text-[var(--text-secondary)] mb-1">Network</p>
              <p className="text-xl font-semibold text-[var(--brand-primary)]">XRPL Testnet</p>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Account Actions
            </h2>

            <div className="space-y-3">
              <Link
                href="/clients"
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-[var(--bg-primary)] transition border border-transparent hover:border-[var(--border-color)]"
              >
                <span className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[var(--text-secondary)]" />
                  Manage Clients
                </span>
                <span className="text-[var(--text-muted)]">→</span>
              </Link>

              <Link
                href="/dashboard"
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-[var(--bg-primary)] transition border border-transparent hover:border-[var(--border-color)]"
              >
                <span className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-[var(--text-secondary)]" />
                  View Activity & Invoices
                </span>
                <span className="text-[var(--text-muted)]">→</span>
              </Link>

              <button
                onClick={disconnect}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-red-950/30 text-red-400 transition border border-transparent hover:border-red-900/50"
              >
                <span className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  Disconnect Wallet
                </span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-[var(--text-muted)] mt-10">
            UrsaDeFi is non-custodial. Your keys, your funds.
          </p>
        </div>
      </div>
    </div>
  );
}
