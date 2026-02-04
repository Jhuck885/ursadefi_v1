// src/app/dashboard/layout.tsx
import '../globals.css';
import { Inter } from 'next/font/google';
import LeftSidebar from '@/components/layout/LeftSidebar';
import RightSidebar from '@/components/layout/RightSidebar';
const inter = Inter({ subsets: ['latin'] });
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`flex min-h-screen flex-col ${inter.className}`}> {/* Outer wrapper for full height */}
      <div className="flex flex-1"> {/* Flex row for columns */}
        {/* Left Sidebar */}
        <aside className="w-64 bg-black border-r border-gray-800 overflow-y-auto hidden md:block flex-shrink-0">
          <LeftSidebar />
        </aside>
        {/* Center Feed - dashboard/page.tsx renders here */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-4 pt-8 pb-20 md:pb-0">
            {children}
          </div>
        </main>
        {/* Right Sidebar */}
        <aside className="w-80 bg-black border-l border-gray-800 overflow-y-auto hidden lg:block flex-shrink-0">
          <RightSidebar />
        </aside>
      </div>
      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 md:hidden z-10 safe-bottom"> {/* Added safe-bottom for insets */}
        <div className="flex justify-around py-3">
          <button className="text-lg font-medium">Dashboard</button>
          <button className="text-lg font-medium">Invoices</button>
          <button className="text-lg font-medium">Clients</button>
          <button className="text-lg font-medium">Profile</button>
        </div>
      </div>
    </div>
  );
}