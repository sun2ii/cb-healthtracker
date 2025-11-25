'use client';

import { useEffect } from 'react';
import { BottomNav, TopNav } from '@/components/ui';
import { useHealthStore } from '@/lib/stores/health-store';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const initialize = useHealthStore((state) => state.initialize);
  const isLoading = useHealthStore((state) => state.isLoading);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-pulse text-[#9a9a9a]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#f8fafc] flex flex-col overflow-hidden">
      {/* Desktop top nav */}
      <div className="hidden md:block flex-shrink-0">
        <TopNav />
      </div>

      {/* Main content - centered, no scroll */}
      <main className="flex-1 flex justify-center pt-4 pb-20 md:pt-16 md:pb-4 overflow-hidden">
        <div className="w-full max-w-[1000px] px-4 md:px-6 h-full">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <div className="md:hidden flex-shrink-0">
        <BottomNav />
      </div>
    </div>
  );
}
