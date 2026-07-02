'use client';

import Link from 'next/link';
import { Home, FileText, Users, BarChart3, Settings, User, LogOut, Download } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Invoices', href: '/dashboard', icon: FileText },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Reports', href: '/dashboard', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard', icon: Settings },
  { name: 'Profile', href: '/dashboard', icon: User },
];

export default function LeftSidebar() {
  const { wallet, disconnect, isConnected } = useWallet();

  const handleExportCSV = () => {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    if (invoices.length === 0) {
      alert('No invoices to export yet');
      return;
    }

    const headers = ['id', 'created_at', 'from', 'to', 'total', 'xrpAmount', 'status', 'dueDate'];
    const csvRows = [
      headers.join(','),
      ...invoices.map((inv: any) =>
        [
          inv.id,
          inv.created_at || '',
          `"${(inv.from || '').replace(/"/g, '""')}"`,
          `"${(inv.to || '').replace(/"/g, '""')}"`,
          inv.total || 0,
          inv.xrpAmount || 0,
          inv.status || 'draft',
          inv.dueDate || '',
        ].join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ursadefi_invoices_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const shortAddress = wallet?.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : null;

  return (
    <aside className="hidden lg:flex w-72 flex-col border-r border-gray-800 bg-black fixed inset-y-0 left-0">
      <div className="p-6 border-b border-gray-800">
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
            className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-900 transition text-lg"
          >
            <item.icon className="w-6 h-6" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-2">
        <button
          onClick={handleExportCSV}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-sm transition"
        >
          <Download className="w-5 h-5" />
          <span>Export CSV (Free)</span>
        </button>

        {isConnected ? (
          <button
            onClick={disconnect}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-950 text-red-400 text-sm transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Disconnect Wallet</span>
          </button>
        ) : (
          <div className="space-y-3 px-1">
            <div className="text-sm text-zinc-400 px-3">
              Wallet disconnected
            </div>
            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#1D9BF0] hover:bg-[#1a8cd8] text-white text-sm font-medium transition"
            >
              Connect Wallet
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}