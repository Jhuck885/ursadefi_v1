'use client';
import Link from 'next/link';
import XRPLConnect from '@/components/XRPLConnect';

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="text-center max-w-md px-4">
        <div className="flex justify-center mb-6">
          <img
            src="/ursa-logo.png"
            alt="UrsaDeFi Logo"
            className="w-20 h-20 object-contain"
          />
        </div>

        <h1 className="text-6xl font-bold tracking-tighter mb-8">URSADEFI</h1>
        <XRPLConnect />
        <div className="mt-6">
          <Link
            href="/help"
            className="text-sm text-[var(--brand-primary)] hover:underline"
          >
            About
          </Link>
        </div>
      </div>
    </div>
  );
}
