'use client';

import { motion } from 'framer-motion';
import type { URLReputationData } from '@/lib/types';
import URLDissection from './URLDissection';

interface URLTrustCardProps {
  data: URLReputationData;
  analyzedUrl?: string;
}

function getTrustColor(score: number) {
  if (score >= 70) return { text: 'text-emerald-400', bg: 'bg-emerald-500', glow: 'from-emerald-500/20 to-emerald-500/5' };
  if (score >= 40) return { text: 'text-amber-400', bg: 'bg-amber-500', glow: 'from-amber-500/20 to-amber-500/5' };
  return { text: 'text-red-400', bg: 'bg-red-500', glow: 'from-red-500/20 to-red-500/5' };
}

function getTrustLabel(score: number): string {
  if (score >= 70) return 'Terpercaya';
  if (score >= 40) return 'Perlu Diwaspadai';
  return 'Tidak Terpercaya';
}

export default function URLTrustCard({ data, analyzedUrl }: URLTrustCardProps) {
  const color = getTrustColor(data.trustScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Visual URL Dissection */}
      {analyzedUrl && (
        <URLDissection url={analyzedUrl} typosquatting={data.typosquatting} />
      )}

      {/* Trust Score */}
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color.glow} border border-border`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${color.text}`}>{data.trustScore}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color.text} ${color.bg}/15`}>
            {getTrustLabel(data.trustScore)}
          </span>
        </div>

        {/* Trust bar */}
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${color.bg}`}
            initial={{ width: '0%' }}
            animate={{ width: `${data.trustScore}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        {/* Quick badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
            data.isHTTPS ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {data.isHTTPS ? '🔒 HTTPS' : '⚠️ No HTTPS'}
          </span>

          {data.typosquatting && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              🎭 Typosquatting ({data.typosquatting.similarity}%)
            </span>
          )}

          {data.virusTotal && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
              data.virusTotal.detected === 0
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              🛡️ VT: {data.virusTotal.detected}/{data.virusTotal.total}
            </span>
          )}
        </div>
      </div>

      {/* Suspicious indicators */}
      {data.suspiciousIndicators.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-amber-400/80 uppercase tracking-wider pl-1">⚠️ Temuan Mencurigakan</p>
          {data.suspiciousIndicators.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/10"
            >
              <p className="text-xs font-semibold text-amber-400/90 mb-0.5">{item.indicator}</p>
              <p className="text-xs text-foreground/60 leading-relaxed">{item.explanation}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Safe indicators */}
      {data.safeIndicators.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-emerald-400/80 uppercase tracking-wider pl-1">✅ Indikator Aman</p>
          {data.safeIndicators.map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-500/[0.03] border border-emerald-500/10 text-xs">
              <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
              <div>
                <span className="font-medium text-emerald-400/90">{item.indicator}</span>
                <p className="text-foreground/50 mt-0.5">{item.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VirusTotal details */}
      {data.virusTotal && data.virusTotal.detected > 0 && (
        <div className="p-3 rounded-xl bg-red-500/[0.04] border border-red-500/10">
          <p className="text-xs font-semibold text-red-400/90 mb-1.5">🛡️ Hasil VirusTotal</p>
          <p className="text-xs text-foreground/60 mb-2">
            {data.virusTotal.detected} dari {data.virusTotal.total} vendor keamanan mendeteksi ancaman.
          </p>
          {data.virusTotal.vendors.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {data.virusTotal.vendors.map((vendor, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400/80">
                  {vendor}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
