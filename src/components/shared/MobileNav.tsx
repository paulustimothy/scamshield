'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { NAV_ITEMS } from '@/lib/constants';

export default function MobileNav() {
  const pathname = usePathname();

  // Hide on landing page
  if (pathname === '/') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass-strong border-t border-border mobile-nav-safe">
        <div className="flex items-center justify-around px-1 py-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl transition-colors min-w-[56px] active:scale-95"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-active"
                    className="absolute inset-0 bg-primary/15 rounded-xl"
                    transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
                  />
                )}
                <span className="text-lg relative z-10">{item.icon}</span>
                <span
                  className={`text-[10px] relative z-10 font-medium leading-tight ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
