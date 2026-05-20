'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface TranscriptViewerProps {
  transcript: string;
}

export default function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  const [expanded, setExpanded] = useState(false);

  if (!transcript) return null;

  const isLong = transcript.length > 300;
  const displayText = expanded ? transcript : transcript.slice(0, 300);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="p-3 sm:p-4 rounded-xl bg-card border border-border">
        {/* Waveform decoration */}
        <div className="flex items-center gap-[2px] h-6 mb-3 opacity-40">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="w-0.5 rounded-full bg-cyan-400"
              style={{ height: `${4 + Math.sin(i * 0.6) * 10 + Math.random() * 6}px` }}
            />
          ))}
        </div>

        <p className="text-sm text-foreground/70 whitespace-pre-wrap break-words leading-relaxed">
          {displayText}
          {isLong && !expanded && '...'}
        </p>

        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs text-primary/80 hover:text-primary transition-colors"
          >
            {expanded ? '↑ Tampilkan lebih sedikit' : '↓ Tampilkan selengkapnya'}
          </button>
        )}
      </div>

      <div className="p-2.5 rounded-lg bg-cyan-500/[0.04] border border-cyan-500/10">
        <p className="text-[10px] sm:text-xs text-cyan-300/60 leading-relaxed">
          📝 Transkripsi dihasilkan oleh AI dan mungkin tidak 100% akurat. Gunakan sebagai referensi.
        </p>
      </div>
    </motion.div>
  );
}
