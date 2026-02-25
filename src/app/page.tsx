'use client';
import XRPLConnect from '@/components/XRPLConnect'; // your existing
export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold tracking-tighter mb-4">URSADEFI</h1>
        <p className="text-xl mb-8">XRPL Invoicing • Dallas, TX • Pay 0.15% max, keep the rest</p>
        <XRPLConnect /> {/* Xaman button + email fallback */}
        <div className="mt-8 text-xs text-zinc-500">2 free CSVs/year • 100% non-custodial • 1099-ready</div>
      </div>
    </div>
  );
}

