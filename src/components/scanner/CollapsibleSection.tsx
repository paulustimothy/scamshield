'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollapsibleSectionProps {
  icon: string;
  title: string;
  summary?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function CollapsibleSection({ icon, title, summary, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-border bg-card relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-3.5 sm:p-4 flex items-center gap-2.5 sm:gap-3 active:bg-muted/50 transition-colors"
      >
        <span className="text-base sm:text-lg shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-xs sm:text-sm">{title}</h3>
          {summary && !isOpen && (
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{summary}</p>
          )}
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground text-xs shrink-0"
        >
          ▼
        </motion.span>
      </button>
 
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: isOpen ? 'visible' : 'hidden' }}
          >
            <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
