'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ExplainSimpleProps {
  explanation: string;
  simpleExplanation: string;
}

export default function ExplainSimple({ explanation, simpleExplanation }: ExplainSimpleProps) {
  const [isSimple, setIsSimple] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0">📝</span>
          <h3 className="font-semibold text-sm sm:text-base">Penjelasan AI</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSimple(!isSimple)}
          className="text-[10px] sm:text-xs gap-1 sm:gap-1.5 shrink-0 border-border active:scale-95 h-8 px-2.5 sm:px-3"
        >
          {isSimple ? '📊 Detail' : '👵 Sederhana'}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={isSimple ? 'simple' : 'detailed'}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="p-3 sm:p-4 rounded-xl bg-card border border-border"
        >
          {isSimple && (
            <div className="flex items-center gap-2 mb-2.5 sm:mb-3 pb-2.5 sm:pb-3 border-b border-border">
              <span className="text-base sm:text-lg">👵</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                Mode &ldquo;Jelaskan Seperti ke Orang Tua Saya&rdquo;
              </span>
            </div>
          )}
          <div className={`leading-relaxed break-words ${isSimple ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'} text-foreground/80 space-y-3`}>
            {(isSimple ? simpleExplanation : explanation).split('\n').map((paragraph, i) => (
              paragraph.trim() ? <p key={i}>{paragraph}</p> : null
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
