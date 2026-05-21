'use client';

import { motion } from 'framer-motion';

export type EvidenceType = 'text' | 'url' | 'image' | 'audio';

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  label: string;
  file?: File;
  text?: string;
  preview?: string; // base64 image preview
}

interface EvidenceCardProps {
  item: EvidenceItem;
  onRemove: (id: string) => void;
}

const typeConfig: Record<EvidenceType, { icon: string; color: string; border: string; bg: string }> = {
  text: { icon: '📝', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5' },
  url: { icon: '🔗', color: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5' },
  image: { icon: '📸', color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/5' },
  audio: { icon: '🎙️', color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
};

export default function EvidenceCard({ item, onRemove }: EvidenceCardProps) {
  const config = typeConfig[item.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative group flex items-center gap-3 p-3 rounded-xl ${config.bg} border ${config.border} backdrop-blur-sm transition-colors hover:bg-muted/50`}
    >
      {/* Thumbnail / icon */}
      <div className="shrink-0 w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden">
        {item.type === 'image' && item.preview ? (
          <img src={item.preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
        ) : (
          <span className="text-lg">{config.icon}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] font-medium ${config.color} uppercase tracking-wider mb-0.5`}>
          {item.type === 'text' ? 'Teks' : item.type === 'url' ? 'URL' : item.type === 'image' ? 'Gambar' : 'Audio'}
        </p>
        <p className="text-xs text-foreground/70 truncate">
          {item.label}
        </p>
      </div>

      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
        className="shrink-0 w-7 h-7 rounded-full bg-muted/50 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 flex items-center justify-center transition-all active:scale-90"
        aria-label="Hapus bukti"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
      </button>
    </motion.div>
  );
}
