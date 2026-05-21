'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileHeader() {
  const pathname = usePathname();

  // Hide on landing page
  if (pathname === '/') return null;

  return (
    <header className="md:hidden sticky top-0 z-40 glass-strong border-b border-border">
      <div className="px-4 py-3 flex items-center gap-2.5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            S
          </div>
          <span className="font-semibold text-base tracking-tight">ScamShield</span>
        </Link>
      </div>
    </header>
  );
}
