'use client';
import './globals.css';
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { WalletProvider } from '@/context/WalletContext'; // your existing context — wraps everything

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setDark(saved === 'dark');
    document.documentElement.classList.toggle('dark', saved === 'dark');
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
        <WalletProvider> {/* ← WRAPS ALL PAGES — fixes useWallet prerender forever */}
          <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 border-b border-zinc-800 px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold tracking-tighter">URSADEFI</div>
              <div className="text-xs text-zinc-500">Dallas, TX • XRPL Invoicing</div>
            </div>
            <button onClick={toggle} className="btn-pill p-2">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </nav>
          <div className="pt-16">{children}</div>
        </WalletProvider>
      </body>
    </html>
  );
}