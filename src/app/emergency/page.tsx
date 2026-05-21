'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { ScamAnalysisResult, ScanContext } from '@/lib/types';

export default function EmergencyPage() {
  const router = useRouter();
  const [result, setResult] = useState<ScamAnalysisResult | null>(null);
  const [originalContent, setOriginalContent] = useState<string>('');
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('scamshield_scan_result');
      if (stored) {
        const parsed = JSON.parse(stored);
        setResult(parsed.result);
        setOriginalContent(parsed.originalContent || '');
      }
    } catch { /* ignore */ }
  }, []);

  const markDone = (a: string) => setCompletedActions(prev => new Set([...prev, a]));

  const handleAskAI = () => {
    // Pass context to chat
    try {
      const stored = sessionStorage.getItem('scamshield_scan_result');
      if (stored) {
        const scanData = JSON.parse(stored);
        const context: ScanContext = {
          originalContent: scanData.originalContent || '',
          riskLevel: scanData.result.riskLevel,
          scamProbability: scanData.result.scamProbability,
          scamTypes: scanData.result.scamTypes,
          suspiciousPhrases: scanData.result.suspiciousPhrases,
          explanation: scanData.result.explanation,
          simpleExplanation: scanData.result.simpleExplanation,
          recommendedActions: scanData.result.recommendedActions,
          redFlags: scanData.result.redFlags,
          safeIndicators: scanData.result.safeIndicators || [],
        };
        sessionStorage.setItem('scamshield_chat_context', JSON.stringify(context));
      }
    } catch { /* ignore */ }
    router.push('/chat?from=scan');
  };

  const shareWA = () => {
    const preview = originalContent && originalContent !== '[Screenshot]' && originalContent !== '[Audio Recording]'
      ? `Teks Asli:\n"${originalContent}"\n\n`
      : '';
    const msg = encodeURIComponent(`⚠️ *Peringatan Keamanan ScamShield* ⚠️\n\nPesan berikut terdeteksi mencurigakan/phishing:\n\n${preview}*Hasil Analisis:*\nTingkat Risiko: ${result?.scamProbability || 'Tinggi'}%\nKategori: ${(result?.scamTypes || []).join(', ')}\n\n*Penjelasan Singkat:*\n${result?.simpleExplanation || 'Hati-hati dengan pesan ini.'}\n\nJANGAN klik link atau berikan kode OTP. Selalu waspada! 🛡️`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
    markDone('share');
  };

  const actions = [
    { id: 'block', icon: '🚫', title: 'Blokir Pengirim', desc: 'Blokir nomor/akun pengirim pesan ini', fn: () => markDone('block') },
    { id: 'report', icon: '📢', title: 'Laporkan', desc: 'Lapor ke Patrolisiber', fn: () => { window.open('https://patrolisiber.id/submit-report/', '_blank'); markDone('report'); } },
    { id: 'share', icon: '📤', title: 'Bagikan Peringatan', desc: 'Peringatkan keluarga via WhatsApp', fn: shareWA },
    { id: 'chat', icon: '💬', title: 'Tanya AI Assistant', desc: 'Dapatkan bantuan dari ScamShield AI', fn: handleAskAI },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-6 sm:py-8">
      <div className="max-w-lg w-full space-y-6 sm:space-y-8">
        {/* Back button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors active:scale-95"
          >
            <span>←</span>
            <span>Kembali</span>
          </button>
        </motion.div>

        <motion.div className="text-center space-y-3 sm:space-y-4" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-4xl sm:text-5xl">⚠️</div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-400">Langkah Perlindungan</h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Pesan ini memiliki pola yang perlu diwaspadai. Berikut langkah yang bisa Anda ambil:
          </p>
          {result && (
            <span className={`text-sm font-semibold ${
              result.scamProbability > 70 ? 'text-red-400' : 'text-amber-400'
            }`}>
              Tingkat risiko: {result.scamProbability}%
            </span>
          )}
        </motion.div>
        <div className="space-y-2.5 sm:space-y-3">
          {actions.map((action, i) => (
            <motion.div key={action.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
              <Button onClick={action.fn} variant="ghost"
                className={`w-full h-14 sm:h-16 text-sm sm:text-base justify-start gap-3 sm:gap-4 rounded-2xl active:scale-[0.98] ${completedActions.has(action.id) ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-muted/50 border border-border text-foreground hover:bg-muted'}`}>
                <span className="text-xl sm:text-2xl shrink-0">{completedActions.has(action.id) ? '✅' : action.icon}</span>
                <div className="text-left min-w-0">
                  <div className="font-semibold text-sm sm:text-base">{action.title}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{action.desc}</div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Navigation buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex gap-3 pt-2"
        >
          <Button
            onClick={() => router.push('/scanner/result')}
            variant="outline"
            className="flex-1 h-11 text-xs sm:text-sm border-border hover:bg-muted rounded-xl"
          >
            ← Kembali ke Hasil
          </Button>
          <Button
            onClick={() => { sessionStorage.removeItem('scamshield_scan_result'); router.push('/scanner'); }}
            variant="outline"
            className="flex-1 h-11 text-xs sm:text-sm border-border hover:bg-muted rounded-xl"
          >
            🔍 Scan Baru
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
