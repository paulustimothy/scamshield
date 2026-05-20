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
  const [actionsTaken, setActionsTaken] = useState<Set<string>>(new Set());

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

  const markAction = (a: string) => setActionsTaken(prev => new Set([...prev, a]));
  const allDone = actionsTaken.size >= 2;

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
          confidenceScore: scanData.result.confidenceScore,
          scamTypes: scanData.result.scamTypes,
          suspiciousPhrases: scanData.result.suspiciousPhrases,
          heatMeter: scanData.result.heatMeter,
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
    markAction('share');
  };

  const actions = [
    { id: 'block', icon: '🚫', title: 'Blokir Pengirim', desc: 'Blokir nomor/akun pengirim pesan ini', fn: () => markAction('block') },
    { id: 'report', icon: '📢', title: 'Laporkan', desc: 'Lapor ke Patrolisiber', fn: () => { window.open('https://patrolisiber.id/submit-report/', '_blank'); markAction('report'); } },
    { id: 'share', icon: '📤', title: 'Bagikan Peringatan', desc: 'Peringatkan keluarga via WhatsApp', fn: shareWA },
    { id: 'chat', icon: '💬', title: 'Tanya AI Assistant', desc: 'Dapatkan bantuan dari ScamShield AI', fn: handleAskAI },
  ];

  if (allDone) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5 sm:space-y-6 max-w-sm mx-auto">
          <motion.div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center text-4xl sm:text-5xl"
            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>✅</motion.div>
          <h1 className="text-xl sm:text-2xl font-bold text-emerald-400">Langkah Perlindungan Diambil</h1>
          <p className="text-sm text-muted-foreground">Anda telah mengambil langkah yang tepat. Tetap waspada dan jangan ragu untuk bertanya jika ada pesan mencurigakan lainnya.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 sm:pt-4">
            <Button onClick={() => router.push('/scanner')} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-foreground border-0 active:scale-[0.98]">🔍 Scan Baru</Button>
            <Button onClick={() => router.push('/')} variant="outline" className="border-border active:scale-[0.98]">🏠 Beranda</Button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-6 sm:py-8">
      <div className="max-w-lg w-full space-y-6 sm:space-y-8">
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
              <Button onClick={action.fn} disabled={actionsTaken.has(action.id)} variant="ghost"
                className={`w-full h-14 sm:h-16 text-sm sm:text-base justify-start gap-3 sm:gap-4 rounded-2xl active:scale-[0.98] ${actionsTaken.has(action.id) ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-muted/50 border border-border text-foreground hover:bg-white/[0.08]'}`}>
                <span className="text-xl sm:text-2xl shrink-0">{actionsTaken.has(action.id) ? '✅' : action.icon}</span>
                <div className="text-left min-w-0">
                  <div className="font-semibold text-sm sm:text-base">{action.title}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground truncate">{action.desc}</div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
