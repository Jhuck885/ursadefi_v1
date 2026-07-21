'use client';

import { useWallet } from '@/context/WalletContext';
import Link from 'next/link';
import { Settings, Moon, Sun, LogOut, Shield, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const { wallet, disconnect, isConnected } = useWallet();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = saved ? saved === 'dark' : prefersDark;
    setIsDark(shouldBeDark);
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

  if (!isConnected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">Please connect your wallet to access settings.</p>
          <Link href="/" className="text-[var(--brand-primary)] hover:underline">
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-7 h-7 text-[var(--brand-primary)]" />
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <section className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Switch between light and dark mode
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-full border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition text-sm font-medium"
            >
              {isDark ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>
        </section>

        {/* Account */}
        <section className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Account
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Connected Wallet</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono break-all">
                {wallet?.address || 'Not connected'}
              </p>
            </div>
            <button
              onClick={disconnect}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-red-900/50 text-red-400 hover:bg-red-950/30 transition text-sm"
            >
              <LogOut className="w-4 h-4" />
              Disconnect Wallet
            </button>
          </div>
        </section>

        {/* Notifications placeholder */}
        <section className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Email and push notification preferences will be available in a future update.
          </p>
        </section>

        <p className="text-xs text-[var(--text-muted)] text-center pt-4">
          More settings coming soon as the product grows.
        </p>
      </div>
    </div>
  );
}
