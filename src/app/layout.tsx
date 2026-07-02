'use client';

import './globals.css';
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { WalletProvider } from '@/context/WalletContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = saved ? saved === 'dark' : prefersDark;

    setDark(initialDark);
    document.documentElement.classList.toggle('dark', initialDark);
  }, []);

  const toggle = () => {
    const newDark = !dark;
    setDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  return (
    <html lang="en" className={dark ? 'dark' : ''}>
      <body className="bg-black text-white min-h-screen">
        <WalletProvider>
          <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 border-b border-zinc-800 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/ursa-logo.png" alt="UrsaDeFi" className="h-8 w-auto" />
              <div className="text-xs text-zinc-500">Dallas, TX • XRPL Invoicing</div>
            </div>
            <button
              onClick={toggle}
              className="p-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 transition flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-blue-400" />}
            </button>
          </nav>
          <div className="pt-16">{children}</div>
        </WalletProvider>
      </body>
    </html>
  );
}

export const metadata = {
  title: 'UrsaDeFi | XRPL Invoicing',
  description: 'XRPL Invoicing • Dallas, TX • Pay 0.15% max, keep the rest',
  icons: {
    icon: '/ursa-logo.png',
  },
};
