'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/shared/Navbar';
import MobileNav from '@/components/shared/MobileNav';
import RiskGauge from '@/components/scanner/RiskGauge';
import SuspiciousHighlight from '@/components/scanner/SuspiciousHighlight';
import ExplainSimple from '@/components/scanner/ExplainSimple';
import WhyPeopleFallForThis from '@/components/scanner/WhyPeopleFallForThis';
import URLTrustCard from '@/components/scanner/URLTrustCard';
import TranscriptViewer from '@/components/scanner/TranscriptViewer';
import EvidenceSummary from '@/components/scanner/EvidenceSummary';
import CollapsibleSection from '@/components/scanner/CollapsibleSection';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import type { ScamAnalysisResult, ScanContext } from '@/lib/types';

interface ScanData {
  result: ScamAnalysisResult;
  originalContent: string;
  type: string;
  timestamp: number;
  evidenceCounts?: { text: number; url: number; image: number; audio: number };
  evidenceCount?: number;
  isFallback?: boolean;
  analyzedUrl?: string;
}

export default function ResultPage() {
  const router = useRouter();
  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('scamshield_scan_result');
    if (stored) {
      setScanData(JSON.parse(stored));
    }
  }, []);

  const handleShareReport = async () => {
    if (!scanData) return;

    const { result } = scanData;
    const shareText = `🛡️ ScamShield AI — Hasil Analisis\n\nTingkat Risiko: ${result.scamProbability}% (${result.riskLevel})\nKategori: ${result.scamTypes.join(', ')}\n\n${result.simpleExplanation}\n\nScan pesan mencurigakan di ScamShield.`;

    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        setIsSharing(true);
        await navigator.share({
          title: 'ScamShield — Hasil Analisis',
          text: shareText,
        });
      } catch (err) {
        // User cancelled or share failed — try clipboard fallback
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard?.writeText(shareText);
        }
      } finally {
        setIsSharing(false);
      }
      return;
    }

    // Fallback: copy to clipboard
    try {
      setIsSharing(true);
      await navigator.clipboard.writeText(shareText);
      // Brief visual feedback
      setTimeout(() => setIsSharing(false), 1500);
    } catch {
      setIsSharing(false);
    }
  };

  const handleAskAI = () => {
    if (!scanData) { router.push('/chat'); return; }

    const context: ScanContext = {
      originalContent: scanData.originalContent,
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
    router.push('/chat?from=scan');
  };

  if (!scanData) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 pb-20 md:pb-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-muted/50 border border-border flex items-center justify-center">
              <span className="text-3xl">🔍</span>
            </div>
            <div>
              <p className="font-medium text-foreground/80 mb-1">Belum ada hasil analisis</p>
              <p className="text-sm text-muted-foreground">Scan pesan atau screenshot terlebih dahulu</p>
            </div>
            <Button onClick={() => router.push('/scanner')} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0">
              🔍 Mulai Scan
            </Button>
          </div>
        </main>
        <MobileNav />
      </>
    );
  }

  const { result, originalContent } = scanData;
  const hasAudio = (scanData.evidenceCounts ? scanData.evidenceCounts.audio > 0 : scanData.type === 'audio') && !!result.transcript;

  const headerText = {
    aman: 'Analisis selesai — pesan ini kemungkinan aman',
    mencurigakan: 'Analisis selesai — ditemukan beberapa hal yang perlu diwaspadai',
    berbahaya: 'Analisis selesai — pesan ini memiliki pola yang sering ditemukan pada penipuan',
  }[result.riskLevel];

  return (
    <>
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 pb-36 md:pb-12">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5">
          
          {/* Share button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleShareReport} 
              disabled={isSharing}
              variant="outline" 
              size="sm"
              className="text-xs bg-muted border-border hover:bg-border"
            >
              {isSharing ? '✅ Tersalin!' : '📤 Bagikan Laporan'}
            </Button>
          </div>

          <ErrorBoundary>
            <div className="space-y-4 sm:space-y-5">
              
              {/* ==========================================
                  ABOVE THE FOLD — Always visible
                  ========================================== */}

              {/* Fallback disclaimer */}
              {scanData.isFallback && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-400 text-center">
                  ⚠️ Sistem AI sedang tidak tersedia. Hasil ini menggunakan pemeriksaan otomatis dasar — coba lagi nanti untuk analisis AI yang lengkap.
                </motion.div>
              )}

              {/* Audio disclaimer */}
              {hasAudio && !scanData.isFallback && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs sm:text-sm text-blue-400 text-center">
                  🎙️ Kualitas analisis audio sangat bergantung pada kejelasan rekaman.
                </motion.div>
              )}

              {/* Header + Evidence Summary */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">Hasil Analisis ScamShield AI</p>
                <p className={`text-sm font-medium ${
                  result.riskLevel === 'aman' ? 'text-emerald-400/80' : result.riskLevel === 'mencurigakan' ? 'text-amber-400/80' : 'text-red-400/80'
                }`}>{headerText}</p>
                {/* Inline evidence summary */}
                {scanData.evidenceCounts && (scanData.evidenceCount ?? 0) > 0 && (
                  <div className="pt-1">
                    <EvidenceSummary counts={scanData.evidenceCounts} />
                  </div>
                )}
              </motion.div>

              {/* Risk Gauge + Scam Type badges */}
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
                className="flex flex-col items-center gap-3">
                <RiskGauge value={result.scamProbability} riskLevel={result.riskLevel} size={160} />
                {/* Scam type badges */}
                {result.scamTypes.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {result.scamTypes.map((type, i) => (
                      <Badge key={i} variant="secondary" className={`text-[10px] sm:text-xs ${
                        result.riskLevel === 'aman' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : result.riskLevel === 'mencurigakan' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>{type}</Badge>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Suspicious Phrase Highlights — above the fold */}
              {originalContent !== '[Screenshot]' && originalContent !== '[Audio Recording]' && result.suspiciousPhrases?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔍</span>
                      <h3 className="font-semibold text-sm sm:text-base">Frasa yang Perlu Diperhatikan</h3>
                      <span className="text-xs text-muted-foreground">({result.suspiciousPhrases.length} terdeteksi)</span>
                    </div>
                    <SuspiciousHighlight originalText={originalContent} phrases={result.suspiciousPhrases} />
                  </div>
                </motion.div>
              )}

              {/* ==========================================
                  PSYCHOLOGY SECTION — Elevated to #2
                  Only for suspicious/dangerous
                  ========================================== */}
              {result.riskLevel !== 'aman' && result.whyPeopleFallForThis && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <WhyPeopleFallForThis data={result.whyPeopleFallForThis} />
                </motion.div>
              )}

              {/* AI Explanation — Always visible */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <ExplainSimple explanation={result.explanation} simpleExplanation={result.simpleExplanation} />
              </motion.div>

              {/* ==========================================
                  COLLAPSIBLE SECTIONS — Progressive disclosure
                  ========================================== */}

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="space-y-2.5">

                {/* URL Trust Card */}
                {result.urlReputation && (
                  <CollapsibleSection
                    icon="🌐"
                    title="Reputasi URL"
                    summary={`Trust Score: ${result.urlReputation.trustScore}/100`}
                    defaultOpen
                  >
                    <URLTrustCard data={result.urlReputation} analyzedUrl={scanData.analyzedUrl} />
                  </CollapsibleSection>
                )}

                {/* Recommended Actions */}
                {result.recommendedActions.length > 0 && (
                  <CollapsibleSection
                    icon="✅"
                    title="Yang Disarankan"
                    summary={`${result.recommendedActions.length} langkah`}
                    defaultOpen={result.riskLevel === 'berbahaya'}
                  >
                    <div className="space-y-2">
                      {result.recommendedActions.map((action, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-sm">
                          <span className="text-emerald-400 text-xs mt-0.5 font-bold shrink-0">{i + 1}</span>
                          <span className="text-foreground/80 break-words">{action}</span>
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}

                {/* Red Flags */}
                {result.redFlags.length > 0 && (
                  <CollapsibleSection
                    icon="🚩"
                    title={result.riskLevel === 'aman' ? 'Catatan' : 'Hal yang Perlu Diwaspadai'}
                    summary={`${result.redFlags.length} temuan`}
                  >
                    <ul className="space-y-2">
                      {result.redFlags.map((flag, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                          <span className={`mt-0.5 shrink-0 ${result.riskLevel === 'aman' ? 'text-amber-400/60' : 'text-amber-400'}`}>•</span>
                          <span className="break-words">{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleSection>
                )}

                {/* Audio Transcript */}
                {result.transcript && (scanData.evidenceCounts ? scanData.evidenceCounts.audio > 0 : scanData.type === 'audio') && (
                  <CollapsibleSection
                    icon="🎙️"
                    title="Transkripsi Audio"
                    summary="Ketuk untuk melihat transkripsi"
                  >
                    <TranscriptViewer transcript={result.transcript} />
                  </CollapsibleSection>
                )}

                {/* Extracted text for images */}
                {result.extractedText && (scanData.evidenceCounts ? scanData.evidenceCounts.image > 0 : scanData.type === 'image') && (
                  <CollapsibleSection
                    icon="📄"
                    title="Teks dari Screenshot"
                    summary="Ketuk untuk melihat teks yang diekstrak"
                  >
                    <div className="text-sm text-foreground/70 whitespace-pre-wrap break-words">
                      {result.extractedText}
                    </div>
                  </CollapsibleSection>
                )}

                
              </motion.div>

              {/* Disclaimer footnote */}
              <div className="text-center pt-2">
                <p className="text-[10px] text-muted-foreground/60">
                  Hasil bersifat edukatif, bukan keputusan hukum
                </p>
              </div>
            </div>
          </ErrorBoundary>

          {/* Action Buttons */}
          <div className="w-full max-w-2xl mx-auto pt-6">
            <div className="space-y-3 md:space-y-4">
              {result.riskLevel === 'berbahaya' && (
                <Button onClick={() => router.push('/emergency')}
                  className="w-full h-11 sm:h-12 md:h-14 text-sm md:text-base font-semibold bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white border-0 shadow-lg shadow-red-500/20 rounded-xl md:rounded-2xl">
                  🚨 Langkah Perlindungan
                </Button>
              )}
              <div className="flex gap-3 md:gap-4">
                <Button onClick={() => { sessionStorage.removeItem('scamshield_scan_result'); router.push('/scanner'); }}
                  variant="outline" className="flex-1 h-10 sm:h-11 md:h-13 text-xs sm:text-sm md:text-base font-semibold border-border hover:bg-muted rounded-xl md:rounded-2xl">
                  🔍 Scan Baru
                </Button>
                <Button onClick={handleAskAI}
                  className="flex-1 h-10 sm:h-11 md:h-13 text-xs sm:text-sm md:text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0 rounded-xl md:rounded-2xl">
                  💬 Tanya AI
                </Button>
              </div>
            </div>
          </div>

        </div>
      </main>

      <MobileNav />
    </>
  );
}
