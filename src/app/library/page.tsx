'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/shared/Navbar';
import MobileHeader from '@/components/shared/MobileHeader';
import MobileNav from '@/components/shared/MobileNav';
import { SCAM_PATTERNS } from '@/lib/scam-patterns';

export default function LibraryPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <>
      <Navbar />
      <MobileHeader />

      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 pb-28 md:pb-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1.5 sm:mb-2">📚 Perpustakaan Penipuan</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Kenali jenis-jenis penipuan online yang umum di Indonesia
            </p>
          </motion.div>

          {/* Cards */}
          <div className="space-y-2.5 sm:space-y-3">
            {SCAM_PATTERNS.map((pattern, i) => (
              <motion.div
                key={pattern.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  onClick={() => setExpandedId(expandedId === pattern.id ? null : pattern.id)}
                  className="w-full text-left active:scale-[0.99]"
                >
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                      expandedId === pattern.id
                        ? 'bg-muted/50 border-primary/20'
                        : 'bg-card border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <span className="text-xl sm:text-2xl shrink-0">{pattern.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-xs sm:text-sm">{pattern.title}</h3>
                          <Badge
                            variant="secondary"
                            className={`text-[9px] sm:text-[10px] ${
                              pattern.riskLevel === 'berbahaya'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}
                          >
                            {pattern.riskLevel === 'berbahaya' ? '🔴 Berbahaya' : '⚠️ Waspada'}
                          </Badge>
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1">
                          {pattern.description}
                        </p>
                      </div>
                      <span className="text-muted-foreground text-xs sm:text-sm transition-transform shrink-0" style={{
                        transform: expandedId === pattern.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}>
                        ▼
                      </span>
                    </div>

                    <AnimatePresence>
                      {expandedId === pattern.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border space-y-3 sm:space-y-4 text-xs sm:text-sm">
                            <p className="text-foreground/80 leading-relaxed">{pattern.description}</p>

                            <div>
                              <h4 className="font-medium text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1.5 sm:mb-2">📌 Contoh</h4>
                              <ul className="space-y-1.5">
                                {pattern.examples.map((ex, j) => (
                                  <li key={j} className="flex items-start gap-2 text-foreground/70">
                                    <span className="text-muted-foreground mt-0.5 shrink-0">•</span>
                                    <span className="break-words">{ex}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-medium text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1.5 sm:mb-2">🛡️ Cara Melindungi Diri</h4>
                              <ul className="space-y-1.5">
                                {pattern.howToProtect.map((tip, j) => (
                                  <li key={j} className="flex items-start gap-2 text-foreground/70">
                                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                                    <span className="break-words">{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-medium text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1.5 sm:mb-2">🚩 Tanda-Tanda</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {pattern.indicators.map((ind, j) => (
                                  <span
                                    key={j}
                                    className="px-2 py-1 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[10px] sm:text-xs text-amber-300 break-words"
                                  >
                                    {ind}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  );
}
