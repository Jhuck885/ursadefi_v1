// src/app/dashboard/layout.tsx
import '../globals.css';
import { Inter } from 'next/font/google';
import LeftSidebar from '@/components/layout/LeftSidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import CreateInvoiceButton from '@/components/layout/CreateInvoiceButton';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, Users, User } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || (href === '/dashboard' && pathname.startsWith('/dashboard'));

  return (
    <div className={`flex min-h-screen flex-col ${inter.className}`}>
      <div className="flex flex-1">
        {/* Left Sidebar — desktop only */}
        <aside className="w-64 bg-[var(--bg-primary)] border-r border-[var(--border-color)] overflow-y-auto hidden md:block flex-shrink-0">
          <LeftSidebar />
        </aside>

        {/* Center Feed */}
        <main className="flex-1 overflow-y-auto bg-[var(--bg-primary)]">
          <div className="max-w-2xl mx-auto p-4 pt-8 pb-24 md:pb-0">
            {children}
          </div>
        </main>

        {/* Right Sidebar — large screens only */}
        <aside className="w-80 bg-[var(--bg-primary)] border-l border-[var(--border-color)] overflow-y-auto hidden lg:block flex-shrink-0">
          <RightSidebar />
        </aside>
      </div>

      {/* Mobile floating Create button */}
      <CreateInvoiceButton variant="fab" />

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--bg-primary)] border-t border-[var(--border-color)] md:hidden z-10 safe-bottom">
        <div className="flex justify-around py-2 text-[var(--text-primary)] text-xs">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center gap-1 transition ${isActive('/dashboard') ? 'text-[var(--brand-primary)] font-medium' : 'hover:text-[var(--brand-primary)]'}`}
          >
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/invoices"
            className={`flex flex-col items-center gap-1 transition ${isActive('/invoices') ? 'text-[var(--brand-primary)] font-medium' : 'hover:text-[var(--brand-primary)]'}`}
          >
            <FileText className="w-5 h-5" />
            <span>Invoices</span>
          </Link>
          <Link
            href="/clients"
            className={`flex flex-col items-center gap-1 transition ${isActive('/clients') ? 'text-[var(--brand-primary)] font-medium' : 'hover:text-[var(--brand-primary)]'}`}
          >
            <Users className="w-5 h-5" />
            <span>Clients</span>
          </Link>
          <Link
            href="/profile"
            className={`flex flex-col items-center gap-1 transition ${isActive('/profile') ? 'text-[var(--brand-primary)] font-medium' : 'hover:text-[var(--brand-primary)]'}`}
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
