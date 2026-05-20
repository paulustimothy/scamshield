'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { SuspiciousPhrase } from '@/lib/types';

interface SuspiciousHighlightProps {
  originalText: string;
  phrases: SuspiciousPhrase[];
}

export default function SuspiciousHighlight({ originalText, phrases }: SuspiciousHighlightProps) {
  const [activeTip, setActiveTip] = useState<number | null>(null);

  if (!phrases.length) return null;

  const renderHighlightedText = () => {
    let lastIndex = 0;
    const elements: React.ReactNode[] = [];

    const sortedPhrases = [...phrases]
      .map((p) => ({
        ...p,
        index: originalText.toLowerCase().indexOf(p.text.toLowerCase()),
      }))
      .filter((p) => p.index !== -1)
      .sort((a, b) => a.index - b.index);

    sortedPhrases.forEach((phrase, i) => {
      if (phrase.index > lastIndex) {
        elements.push(
          <span key={`text-${i}`} className="text-foreground/80">
            {originalText.slice(lastIndex, phrase.index)}
          </span>
        );
      }

      const severityColors = {
        low: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
        medium: 'bg-orange-500/20 border-orange-500/40 text-orange-300',
        high: 'bg-red-500/20 border-red-500/40 text-red-300',
      };

      elements.push(
        <span key={`highlight-${i}`} className="relative inline">
          <mark
            className={`${severityColors[phrase.severity]} border-b-2 bg-transparent px-0.5 rounded-sm cursor-help`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveTip(activeTip === i ? null : i);
            }}
            onMouseEnter={() => setActiveTip(i)}
            onMouseLeave={() => setActiveTip(null)}
          >
            {originalText.slice(phrase.index, phrase.index + phrase.text.length)}
          </mark>
          {/* Tooltip — works on both hover and tap */}
          {activeTip === i && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-0 bottom-full mb-2 w-48 sm:w-56 p-2 sm:p-2.5 rounded-lg bg-card border border-border text-xs z-40 shadow-xl"
            >
              <span className="font-semibold text-foreground block mb-1">⚠️ {phrase.reason}</span>
            </motion.span>
          )}
        </span>
      );

      lastIndex = phrase.index + phrase.text.length;
    });

    if (lastIndex < originalText.length) {
      elements.push(
        <span key="text-end" className="text-foreground/80">
          {originalText.slice(lastIndex)}
        </span>
      );
    }

    return elements.length > 0 ? elements : <span className="text-foreground/80">{originalText}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
      onClick={() => setActiveTip(null)}
    >
      <div className="p-3 sm:p-4 rounded-xl bg-card border border-border text-sm leading-relaxed whitespace-pre-wrap break-words">
        {renderHighlightedText()}
      </div>

      {/* Mobile-friendly phrase list — always visible on mobile */}
      <div className="space-y-2 sm:hidden">
        {phrases.slice(0, 5).map((phrase, i) => (
          <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-card border border-border text-xs">
            <span className={`shrink-0 mt-0.5 ${
              phrase.severity === 'high' ? 'text-red-400' :
              phrase.severity === 'medium' ? 'text-orange-400' : 'text-yellow-400'
            }`}>⚠️</span>
            <div>
              <span className="font-medium text-foreground/80 break-words">&quot;{phrase.text}&quot;</span>
              <p className="text-muted-foreground mt-0.5">{phrase.reason}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-yellow-500 rounded" />
          <span>Rendah</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-orange-500 rounded" />
          <span>Sedang</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-red-500 rounded" />
          <span>Tinggi</span>
        </div>
        <span className="hidden sm:inline text-muted-foreground/60">(klik teks untuk detail)</span>
      </div>
    </motion.div>
  );
}
