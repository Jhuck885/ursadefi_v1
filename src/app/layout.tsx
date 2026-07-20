'use client';

import './globals.css';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { WalletProvider } from '@/context/WalletContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

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
    <html lang="en" className={`${poppins.variable} ${isDark ? 'dark' : ''}`}>
      <body className="min-h-screen transition-colors duration-200 bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
        <WalletProvider>
          <ToastProvider>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/95 border-b border-[var(--border-color)] px-4 py-3 flex justify-between items-center backdrop-blur">
              <div className="flex items-center gap-3 logo-wrapper">
                <Link href="/" className="flex items-center gap-3">
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
                  <div className="text-xs text-[var(--text-secondary)] hidden sm:block">
                    Invoicing made easy and damn near free
                  </div>
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/help"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                >
                  About
                </Link>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] transition flex items-center justify-center"
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-blue-400" />}
                </button>
              </div>
            </nav>
            <div className="pt-16">{children}</div>
          </ToastProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
