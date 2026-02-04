// src/components/layout/LeftSidebar.tsx
'use client';

import Link from 'next/link';
import { Home, FileText, Users, BarChart3, Settings, User, LogOut } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home }, // All point to root feed
  { name: 'Invoices', href: '/', icon: FileText },
  { name: 'Clients', href: '/', icon: Users },
  { name: 'Reports', href: '/', icon: BarChart3 },
  { name: 'Settings', href: '/', icon: Settings },
  { name: 'Profile', href: '/', icon: User },
];

export default function LeftSidebar() {
  const handleLogout = () => {
    window.location.reload(); // Placeholder
  };

  return (
    <aside className="hidden lg:flex w-72 flex-col border-r border-gray-800 bg-black fixed inset-y-0 left-0">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-3xl font-bold text-white">UrsaDeFi</h1>
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

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-900 text-red-400 transition text-lg"
        >
          <LogOut className="w-6 h-6" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}