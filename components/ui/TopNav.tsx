'use client';

import { cn } from '@/lib/utils/cn';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TopNavProps {
  basePath?: '/user' | '/demo';
}

export function TopNav({ basePath = '/user' }: TopNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: basePath, label: 'Home' },
    { href: `${basePath}/medications`, label: 'Medications' },
    { href: `${basePath}/checkin`, label: 'Check-in' },
    { href: `${basePath}/activity`, label: 'Activity' },
    { href: `${basePath}/profile`, label: 'Profile' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="mx-auto max-w-[1000px] h-16 flex items-center justify-between px-6">
        {/* Logo/Brand - links to marketing page */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#4a9d94] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="font-semibold text-[#1a1a1a]">CB HealthTracker</span>
        </Link>

        {/* Nav Links */}
        <div data-onboarding="top-nav" className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== basePath && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#4a9d94]/10 text-[#4a9d94]'
                    : 'text-[#6b6b6b] hover:bg-gray-100 hover:text-[#1a1a1a]'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
