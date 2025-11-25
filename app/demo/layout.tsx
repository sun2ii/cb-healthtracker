'use client';

import { useEffect } from 'react';
import { BottomNav, TopNav } from '@/components/ui';
import { useHealthStore } from '@/lib/stores/health-store';

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const initializeDemo = useHealthStore((state) => state.initializeDemo);
  const isLoading = useHealthStore((state) => state.isLoading);

  useEffect(() => {
    initializeDemo();
  }, [initializeDemo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-pulse text-[#9a9a9a]">Loading demo...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#f8fafc] flex flex-col overflow-hidden">
      {/* Demo mode banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-center flex-shrink-0">
        <span className="text-xs text-amber-700">
          Demo Mode - Changes won&apos;t be saved
        </span>
      </div>

      {/* Desktop top nav */}
      <div className="hidden md:block flex-shrink-0">
        <TopNav basePath="/demo" />
      </div>

      {/* Main content - centered, no scroll */}
      <main className="flex-1 flex justify-center pt-4 pb-20 md:pt-16 md:pb-4 overflow-hidden">
        <div className="w-full max-w-[1000px] px-4 md:px-6 h-full">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <div className="md:hidden flex-shrink-0">
        <BottomNav basePath="/demo" />
      </div>
    </div>
  );
}
