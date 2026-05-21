'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SAMPLE_SCAM_MESSAGES } from '@/lib/constants';
import type { ScamAnalysisResult } from '@/lib/types';

// Hardcoded demo results — labeled transparently as examples, not live scans
const DEMO_RESULTS: ScamAnalysisResult[] = [
  {
    riskLevel: 'berbahaya',
    scamProbability: 95,
    confidenceScore: 90,
    scamTypes: ['Undian Palsu', 'Phishing URL', 'Pencurian OTP'],
    suspiciousPhrases: [
      { text: 'http://shopee-winner.xyz/claim', reason: 'URL mencurigakan dan tidak resmi', severity: 'high' },
      { text: 'Kirim kode OTP', reason: 'Permintaan data sensitif yang tidak wajar', severity: 'high' }
    ],
    explanation: 'Pesan ini adalah penipuan klasik berkedok undian berhadiah. Pengirim menjanjikan uang dalam jumlah besar dan mendesak Anda (urgensi) untuk mengklik link palsu serta memberikan OTP.',
    simpleExplanation: 'Ini penipuan! Jangan klik linknya dan JANGAN PERNAH berikan kode OTP kepada siapa pun.',
    recommendedActions: ['Abaikan pesan ini', 'Blokir nomor pengirim', 'Jangan klik link yang diberikan'],
    redFlags: ['Janji hadiah besar', 'Link tidak resmi', 'Permintaan OTP'],
    safeIndicators: [],
  },
  {
    riskLevel: 'berbahaya',
    scamProbability: 88,
    confidenceScore: 85,
    scamTypes: ['Lowongan Kerja Palsu', 'Penipuan Transfer'],
    suspiciousPhrases: [
      { text: 'gaji Rp 500.000-2.000.000/hari', reason: 'Janji penghasilan tidak realistis', severity: 'high' },
      { text: 'Modal awal hanya Rp 100.000', reason: 'Permintaan uang di muka untuk pekerjaan', severity: 'high' }
    ],
    explanation: 'Pesan ini merupakan modus penipuan lowongan kerja. Penipu menjanjikan pekerjaan mudah dengan gaji sangat tinggi, namun meminta korban untuk mentransfer "modal awal".',
    simpleExplanation: 'Ini penipuan lowongan kerja. Pekerjaan asli tidak pernah meminta Anda mentransfer uang (modal) terlebih dahulu.',
    recommendedActions: ['Jangan mentransfer uang', 'Abaikan pesan dan blokir nomor', 'Cari lowongan kerja di portal resmi'],
    redFlags: ['Gaji tidak masuk akal', 'Minta transfer modal awal', 'Menggunakan rekening pribadi'],
    safeIndicators: [],
  },
  {
    riskLevel: 'berbahaya',
    scamProbability: 92,
    confidenceScore: 90,
    scamTypes: ['Impersonasi Bank', 'Pencurian Data Sensitif'],
    suspiciousPhrases: [
      { text: 'DIBLOKIR dalam 1 jam', reason: 'Manipulasi rasa takut dan urgensi ekstrim', severity: 'high' },
      { text: 'PIN ATM, dan kode OTP', reason: 'Permintaan informasi sangat rahasia', severity: 'high' }
    ],
    explanation: 'Pesan ini adalah upaya pencurian data (phishing). Pengirim menyamar sebagai pihak bank dan menggunakan ancaman pemblokiran akun untuk memanipulasi korban agar menyerahkan data rahasia seperti PIN dan OTP.',
    simpleExplanation: 'Penipu menyamar sebagai Bank BCA untuk mencuri data Anda. Bank TIDAK PERNAH meminta PIN atau OTP via WhatsApp atau pesan biasa.',
    recommendedActions: ['Jangan balas pesan ini', 'Jangan berikan data apapun', 'Blokir pengirim', 'Hubungi HaloBCA resmi jika ragu'],
    redFlags: ['Ancaman pemblokiran segera', 'Permintaan PIN dan OTP', 'Menggunakan saluran tidak resmi'],
    safeIndicators: [],
  }
];

export default function InteractiveDemo() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScamAnalysisResult | null>(null);

  const handleSelect = (idx: number) => {
    setSelectedIdx(idx);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setResult(null);

    // Simulated delay for demo effect
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setResult(DEMO_RESULTS[selectedIdx]);
    setIsAnalyzing(false);
  };

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <div className="flex flex-wrap gap-2 p-3 sm:p-4 border-b border-border bg-muted/50">
        {SAMPLE_SCAM_MESSAGES.map((msg, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-full transition-all whitespace-nowrap active:scale-95 ${
              selectedIdx === i
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-muted text-muted-foreground hover:bg-border hover:text-foreground'
            }`}
          >
            {msg.label}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 to-cyan-500/5 blur-xl rounded-[3rem] opacity-50" />
          <motion.div
            key={selectedIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-muted/50 border border-border rounded-2xl p-4 sm:p-6"
          >
            <div className="flex items-center gap-3 mb-4 opacity-50">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">👤</div>
              <div>
                <div className="h-2 w-24 bg-muted-foreground/20 rounded-full mb-2" />
                <div className="h-2 w-16 bg-muted-foreground/10 rounded-full" />
              </div>
            </div>
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed font-medium">
              &quot;{SAMPLE_SCAM_MESSAGES[selectedIdx].content}&quot;
            </p>
          </motion.div>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            size="lg"
            className="rounded-full px-8 h-12 sm:h-14 text-sm sm:text-base font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/40 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: 'linear', duration: 1 }}>
                  ⏳
                </motion.div>
                Menganalisis contoh...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="text-xl">🛡️</span> Lihat Hasil Analisis
              </span>
            )}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-500/20 flex items-center justify-center text-xl sm:text-2xl animate-pulse">
                      🚨
                    </div>
                    <div>
                      <h4 className="text-red-400 font-bold text-base sm:text-lg">Berbahaya</h4>
                      <p className="text-xs sm:text-sm text-red-400/80">Skor Penipuan: {result.scamProbability}%</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.scamTypes.map((type, i) => (
                      <span key={i} className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-red-500/20 text-red-300 text-xs sm:text-sm border border-red-500/20">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <span className="text-foreground font-medium">Penjelasan AI:</span> {result.explanation}
                </div>

                {/* Transparent label */}
                <p className="text-[10px] text-muted-foreground/60 text-center">
                  * Ini adalah contoh hasil analisis. Gunakan fitur Scanner untuk menganalisis pesan Anda sendiri.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
