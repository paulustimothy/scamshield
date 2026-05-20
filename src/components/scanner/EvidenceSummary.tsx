'use client';

import { motion } from 'framer-motion';

interface EvidenceSummaryProps {
  counts: {
    text: number;
    url: number;
    image: number;
    audio: number;
  };
}

export default function EvidenceSummary({ counts }: EvidenceSummaryProps) {
  const items: { emoji: string; label: string; count: number }[] = [];
  if (counts.image > 0) items.push({ emoji: '🖼', label: 'Screenshot', count: counts.image });
  if (counts.url > 0) items.push({ emoji: '🌐', label: 'Link', count: counts.url });
  if (counts.text > 0) items.push({ emoji: '💬', label: 'Pesan Teks', count: counts.text });
  if (counts.audio > 0) items.push({ emoji: '🎙️', label: 'Audio', count: counts.audio });

  if (items.length === 0) return null;

  const totalEvidence = counts.text + counts.url + counts.image + counts.audio;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2 mb-1">
        <span>🗂️</span>
        <h3 className="font-semibold text-sm sm:text-base">Bukti yang Dianalisis</h3>
        <span className="text-xs text-muted-foreground">({totalEvidence} bukti)</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border text-xs text-foreground/80"
          >
            <span>{item.emoji}</span>
            <span>{item.count} {item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
