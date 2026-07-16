'use client';

import Link from 'next/link';
import { Home, FileText, Users, BarChart3, Settings, User, LogOut } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard', icon: Settings },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function LeftSidebar() {
  const { wallet, disconnect, isConnected } = useWallet();

  const shortAddress = wallet?.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : null;

  return (
    <aside className="hidden lg:flex w-72 flex-col border-r border-[var(--border-color)] bg-[var(--bg-primary)] fixed inset-y-0 left-0 text-[var(--text-primary)]">
      <div className="p-6 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <img src="/ursa-logo.png" alt="UrsaDeFi" className="h-8 w-auto" />
        </div>
        {isConnected && shortAddress && (
          <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
            ● Connected {shortAddress}
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-4 px-4 py-3 rounded-full hover:bg-[var(--bg-secondary)] transition text-lg"
          >
            <item.icon className="w-6 h-6" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--border-color)] space-y-2">
        {isConnected ? (
          <button
            onClick={disconnect}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-full hover:bg-red-950/30 text-red-400 text-sm transition border border-transparent hover:border-red-900"
          >
            <LogOut className="w-5 h-5" />
            <span>Disconnect Wallet</span>
          </button>
        ) : (
          <div className="space-y-3 px-1">
            <div className="text-sm text-[var(--text-secondary)] px-3">
              Wallet disconnected
            </div>
            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-full bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-medium transition"
            >
              Connect Wallet
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
