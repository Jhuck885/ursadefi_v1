'use client';

import './globals.css';
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { WalletProvider } from '@/context/WalletContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState<boolean | null>(null);

  // Initialize theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = saved ? saved === 'dark' : prefersDark;

    setDark(initialDark);
    if (initialDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (dark === null) return;

    const newDark = !dark;
    setDark(newDark);

    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Prevent flash before theme is determined
  if (dark === null) {
    return (
      <html lang="en" className="dark">
        <body className="bg-black text-white min-h-screen">
          <div className="pt-16">{children}</div>
        </body>
      </html>
    );
  }

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
              onClick={toggleTheme}
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
