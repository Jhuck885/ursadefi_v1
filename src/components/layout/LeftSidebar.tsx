'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();

  const shortAddress = wallet?.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : null;

  // Only highlight the *first* matching item so Settings (which also points to /dashboard)
  // does not steal the active state from Dashboard
  const getActiveName = () => {
    if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) return 'Dashboard';
    if (pathname === '/invoices') return 'Invoices';
    if (pathname === '/clients') return 'Clients';
    if (pathname === '/reports') return 'Reports';
    if (pathname === '/profile') return 'Profile';
    return null;
  };

  const activeName = getActiveName();

  return (
    <div className="flex flex-col h-full w-full text-[var(--text-primary)]">
      <div className="p-6 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3 logo-wrapper">
          <img
            src="/ursa-logo.png"
            alt="UrsaDeFi"
            className="h-8 w-auto object-contain logo-clean"
            style={{
              filter: 'none',
              WebkitFilter: 'none',
              boxShadow: 'none',
              outline: 'none',
              border: 'none',
              background: 'transparent',
            }}
          />
        </div>
        {isConnected && shortAddress && (
          <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
            ● Connected {shortAddress}
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = activeName === item.name;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-full transition text-lg ${
                active
                  ? 'bg-[var(--bg-secondary)] font-semibold text-[var(--brand-primary)]'
                  : 'hover:bg-[var(--bg-secondary)]'
              }`}
            >
              <item.icon className={`w-6 h-6 ${active ? 'text-[var(--brand-primary)]' : ''}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
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
    </div>
  );
}
