'use client';

import { motion } from 'framer-motion';
import type { WhyPeopleFallForThis as WhyPeopleFallForThisData } from '@/lib/types';

interface WhyPeopleFallForThisProps {
  data: WhyPeopleFallForThisData;
}

const TACTIC_ICONS: Record<string, string> = {
  urgensi: '⏰',
  waktu: '⏰',
  panik: '😰',
  takut: '😰',
  ketakutan: '😰',
  otoritas: '👔',
  resmi: '👔',
  hadiah: '🎁',
  keuntungan: '🎁',
  emosi: '💔',
  emosional: '💔',
  percaya: '🤝',
  kepercayaan: '🤝',
  sosial: '👥',
  tekanan: '💫',
  manipulasi: '🎭',
};

function getIconForTactic(tactic: string): string {
  const lower = tactic.toLowerCase();
  for (const [keyword, icon] of Object.entries(TACTIC_ICONS)) {
    if (lower.includes(keyword)) return icon;
  }
  return '🧠';
}

const TRIGGER_COLORS = [
  'from-primary/10 to-transparent border-border',
  'from-primary/10 to-transparent border-border',
  'from-primary/10 to-transparent border-border',
  'from-primary/10 to-transparent border-border',
];

export default function WhyPeopleFallForThis({ data }: WhyPeopleFallForThisProps) {
  if (!data || (!data.psychologicalTactics?.length && !data.explanation && !data.emotionalTriggers?.length)) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <span className="text-lg">🧠</span>
        <h3 className="font-semibold text-sm sm:text-base">Mengapa Orang Bisa Tertipu?</h3>
      </div>

      {/* Empathetic explanation */}
      {data.explanation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-border"
        >
          <p className="text-sm text-foreground/80 leading-relaxed">
            {data.explanation}
          </p>
        </motion.div>
      )}

      {/* Psychological tactics */}
      {data.psychologicalTactics?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider pl-1">
            Taktik Psikologis yang Digunakan
          </p>
          <div className="grid grid-cols-1 gap-2">
            {data.psychologicalTactics.map((tactic, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-card border border-primary/20"
              >
                <span className="text-base mt-0.5 shrink-0">{getIconForTactic(tactic)}</span>
                <p className="text-sm text-foreground/70 leading-relaxed">{tactic}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Emotional triggers */}
      {data.emotionalTriggers?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider pl-1">
            Pemicu Emosional
          </p>
          <div className="flex flex-wrap gap-2">
            {data.emotionalTriggers.map((trigger, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r ${
                  TRIGGER_COLORS[i % TRIGGER_COLORS.length]
                } text-foreground border`}
              >
                💭 {trigger}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Educational note */}
      <div className="p-3 rounded-xl bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          💜 <strong className="text-foreground">Penting:</strong>{' '}
          Siapapun bisa menjadi korban penipuan — bukan karena kurang cerdas, melainkan karena penipu memang ahli memanipulasi emosi dan situasi.
          Mengenali taktik mereka adalah langkah pertama untuk melindungi diri.
        </p>
      </div>
    </motion.div>
  );
}
