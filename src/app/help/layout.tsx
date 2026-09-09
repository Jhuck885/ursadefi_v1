'use client';

import HeroBackdrop from '@/components/layout/HeroBackdrop';

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <HeroBackdrop intensity="page" />
      <div className="relative z-10 [&>div]:!bg-transparent">{children}</div>
    </div>
  );
}
