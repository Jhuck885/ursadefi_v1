'use client';

import './globals.css';
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { WalletProvider } from '@/context/WalletContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = saved ? saved === 'dark' : prefersDark;

    setIsDark(shouldBeDark);

    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <html lang="en" className={isDark ? 'dark' : ''}>
      <body className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <WalletProvider>
          <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/95 border-b border-[var(--border-color)] px-4 py-3 flex justify-between items-center backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 overflow-hidden flex items-center justify-center">
                <img 
                  src="/ursa-logo.png" 
                  alt="UrsaDeFi" 
                  className="h-8 w-auto max-w-none" 
                  style={{
                    filter: 'none',
                    boxShadow: 'none',
                    WebkitFilter: 'none',
                    outline: 'none',
                    border: 'none'
                  }}
                />
              </div>
              <div className="text-xs text-zinc-500">Dallas, TX • XRPL Invoicing</div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-blue-400" />}
            </button>
          </nav>
          <div className="pt-16">{children}</div>
        </WalletProvider>
      </body>
    </html>
  );
}
