'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/shared/Navbar';
import MobileNav from '@/components/shared/MobileNav';
import ScanAnimation from '@/components/scanner/ScanAnimation';
import VoiceUpload from '@/components/scanner/VoiceUpload';
import EvidenceCard from '@/components/scanner/EvidenceCard';
import type { EvidenceItem, EvidenceType } from '@/components/scanner/EvidenceCard';

type TabType = 'text' | 'url' | 'image' | 'audio';

const MAX_IMAGES = 5;
const MAX_AUDIO = 1;
const MAX_TEXT = 1;

export default function ScannerPage() {
  const router = useRouter();

  // Evidence stack
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);

  // Input state (for the "add evidence" form)
  const [activeTab, setActiveTab] = useState<TabType>('text');
  const [textContent, setTextContent] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(false);
  const [showInputArea, setShowInputArea] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastScanRef = useRef<number>(0);

  // Count evidence by type
  const textCount = evidenceList.filter(e => e.type === 'text').length;
  const urlCount = evidenceList.filter(e => e.type === 'url').length;
  const imageCount = evidenceList.filter(e => e.type === 'image').length;
  const audioCount = evidenceList.filter(e => e.type === 'audio').length;

  // Tab definitions with dynamic availability
  const allTabs = [
    { id: 'text' as TabType, icon: '📝', label: 'Teks' },
    { id: 'url' as TabType, icon: '🔗', label: 'URL' },
    { id: 'image' as TabType, icon: '📸', label: 'Gambar' },
    { id: 'audio' as TabType, icon: '🎙️', label: 'Audio' },
  ];

  const isTabDisabled = (tabId: TabType): boolean => {
    if (tabId === 'text' && textCount >= MAX_TEXT) return true;
    if (tabId === 'image' && imageCount >= MAX_IMAGES) return true;
    if (tabId === 'audio' && audioCount >= MAX_AUDIO) return true;
    return false;
  };

  const getTabLimit = (tabId: TabType): string | null => {
    if (tabId === 'text' && textCount >= MAX_TEXT) return 'Maks 1';
    if (tabId === 'image' && imageCount >= MAX_IMAGES) return `Maks ${MAX_IMAGES}`;
    if (tabId === 'audio' && audioCount >= MAX_AUDIO) return 'Maks 1';
    return null;
  };

  // ==================
  // Add evidence
  // ==================
  const addEvidence = (type: EvidenceType, label: string, file?: File, preview?: string, text?: string) => {
    const item: EvidenceItem = {
      id: crypto.randomUUID(),
      type,
      label,
      file,
      preview,
      text,
    };
    setEvidenceList(prev => [...prev, item]);
    // Reset the input for this type
    if (type === 'text') setTextContent('');
    if (type === 'url') setUrlContent('');
    if (type === 'image') { setImageFile(null); setImagePreview(null); }
    if (type === 'audio') setAudioFile(null);
    setShowInputArea(false);
    setError('');
  };

  const removeEvidence = (id: string) => {
    setEvidenceList(prev => prev.filter(e => e.id !== id));
  };

  const canAddCurrentInput = (): boolean => {
    if (activeTab === 'text') return textContent.trim().length > 10;
    if (activeTab === 'url') return urlContent.trim().length > 5;
    if (activeTab === 'image') return imageFile !== null;
    if (activeTab === 'audio') return audioFile !== null;
    return false;
  };

  const handleAddEvidence = () => {
    if (activeTab === 'text' && textContent.trim().length > 10) {
      addEvidence('text', textContent.trim().slice(0, 80) + (textContent.length > 80 ? '...' : ''), undefined, undefined, textContent);
    } else if (activeTab === 'url' && urlContent.trim().length > 5) {
      addEvidence('url', urlContent.trim(), undefined, undefined, urlContent);
    } else if (activeTab === 'image' && imageFile) {
      addEvidence('image', imageFile.name, imageFile, imagePreview || undefined);
      setImageFile(null);
      setImagePreview(null);
    } else if (activeTab === 'audio' && audioFile) {
      addEvidence('audio', audioFile.name, audioFile);
      setAudioFile(null);
    }
  };

  // ==================
  // Image handling
  // ==================
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ==================
  // Scan
  // ==================
  const canScan = (): boolean => {
    if (cooldown) return false;
    // Can scan if there's evidence in the list, OR if the current input is valid (single-evidence flow)
    return evidenceList.length > 0 || canAddCurrentInput();
  };

  const startCooldown = useCallback(() => {
    setCooldown(true);
    setTimeout(() => setCooldown(false), 3000);
  }, []);

  const handleScan = async () => {
    const now = Date.now();
    if (now - lastScanRef.current < 3000) {
      setError('Mohon tunggu beberapa detik sebelum scan lagi.');
      return;
    }
    lastScanRef.current = now;

    // If there's current input that hasn't been added yet, auto-add it
    let finalEvidence = [...evidenceList];
    if (canAddCurrentInput()) {
      if (activeTab === 'text' && textContent.trim().length > 10) {
        finalEvidence.push({ id: crypto.randomUUID(), type: 'text', label: textContent.trim().slice(0, 80), text: textContent });
      } else if (activeTab === 'url' && urlContent.trim().length > 5) {
        finalEvidence.push({ id: crypto.randomUUID(), type: 'url', label: urlContent.trim(), text: urlContent });
      } else if (activeTab === 'image' && imageFile) {
        finalEvidence.push({ id: crypto.randomUUID(), type: 'image', label: imageFile.name, file: imageFile, preview: imagePreview || undefined });
      } else if (activeTab === 'audio' && audioFile) {
        finalEvidence.push({ id: crypto.randomUUID(), type: 'audio', label: audioFile.name, file: audioFile });
      }
    }

    if (finalEvidence.length === 0) {
      setError('Tambahkan minimal satu bukti untuk dianalisis.');
      return;
    }

    setIsScanning(true);
    setError('');
    startCooldown();

    try {
      const formData = new FormData();

      // Append all evidence
      for (const ev of finalEvidence) {
        if (ev.type === 'text' && ev.text) {
          formData.set('text', ev.text);
        } else if (ev.type === 'url' && ev.text) {
          formData.append('urls', ev.text);
        } else if (ev.type === 'image' && ev.file) {
          formData.append('images', ev.file);
        } else if (ev.type === 'audio' && ev.file) {
          formData.set('audio', ev.file);
        }
      }

      const response = await fetch('/api/analyze-multi', { method: 'POST', body: formData });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Gagal menganalisis');
      }

      const result = await response.json();

      // Build a descriptive originalContent string
      const contentParts: string[] = [];
      for (const ev of finalEvidence) {
        if (ev.type === 'text') contentParts.push(ev.text || ev.label);
        else if (ev.type === 'url') contentParts.push(ev.text || ev.label);
        else if (ev.type === 'image') contentParts.push('[Screenshot]');
        else if (ev.type === 'audio') contentParts.push('[Audio Recording]');
      }
      const originalContent = contentParts.join(' | ');

      // Build evidence counts for result page
      const evidenceCounts = {
        text: finalEvidence.filter(e => e.type === 'text').length,
        url: finalEvidence.filter(e => e.type === 'url').length,
        image: finalEvidence.filter(e => e.type === 'image').length,
        audio: finalEvidence.filter(e => e.type === 'audio').length,
      };

      sessionStorage.setItem('scamshield_scan_result', JSON.stringify({
        result,
        originalContent,
        type: finalEvidence.length === 1 ? finalEvidence[0].type : 'multi',
        timestamp: Date.now(),
        evidenceCounts,
        evidenceCount: finalEvidence.length,
      }));

      try {
        const history = JSON.parse(localStorage.getItem('scamshield_history') || '[]');
        history.unshift({
          id: crypto.randomUUID(),
          type: finalEvidence.length === 1 ? finalEvidence[0].type : 'multi',
          contentPreview: originalContent.slice(0, 100),
          result,
          timestamp: Date.now(),
        });
        localStorage.setItem('scamshield_history', JSON.stringify(history.slice(0, 20)));

        // Increment global scan counter for trend dashboard
        const today = new Date().toISOString().split('T')[0];
        const counters = JSON.parse(localStorage.getItem('scamshield_counters') || '{}');
        if (!counters[today]) counters[today] = { total: 0, types: {} };
        counters[today].total += 1;
        if (result.scamTypes) {
          for (const t of result.scamTypes.slice(0, 2)) {
            counters[today].types[t] = (counters[today].types[t] || 0) + 1;
          }
        }
        localStorage.setItem('scamshield_counters', JSON.stringify(counters));
      } catch { /* ignore */ }

      router.push('/scanner/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setIsScanning(false);
    }
  };

  // ==================
  // Render
  // ==================
  if (isScanning) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 pb-20 md:pb-6">
          <ScanAnimation isMultiEvidence={evidenceList.length > 1} />
        </main>
        <MobileNav />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <header className="md:hidden sticky top-0 z-40 glass-strong border-b border-border">
        <div className="px-4 py-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-foreground font-bold text-sm shrink-0">S</div>
          <span className="font-semibold text-base tracking-tight">ScamShield</span>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 pb-28 md:pb-6">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1.5">🔍 AI Scanner</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">Paste pesan, link, upload screenshot, atau rekaman suara untuk dianalisis AI</p>
          </motion.div>

          {/* Evidence Stack */}
          <AnimatePresence>
            {evidenceList.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 sm:mb-6 space-y-2"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">🗂️</span>
                  <h2 className="text-sm font-semibold text-foreground/80">Bukti yang Akan Dianalisis</h2>
                  <span className="text-xs text-muted-foreground">({evidenceList.length})</span>
                </div>
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {evidenceList.map(item => (
                      <EvidenceCard key={item.id} item={item} onRemove={removeEvidence} />
                    ))}
                  </AnimatePresence>
                </div>

                {/* + Add more evidence button */}
                {!showInputArea && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setShowInputArea(true)}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/30 hover:bg-card text-sm text-muted-foreground hover:text-foreground/80 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <span className="text-lg">+</span>
                    Tambahkan Bukti Lain
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area (tabs + form) */}
          <AnimatePresence>
            {showInputArea && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-5 sm:mb-6">
                  {allTabs.map((tab) => {
                    const disabled = isTabDisabled(tab.id);
                    const limit = getTabLimit(tab.id);
                    return (
                      <button
                        key={tab.id}
                        onClick={() => { if (!disabled) { setActiveTab(tab.id); setError(''); } }}
                        disabled={disabled}
                        className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all active:scale-95 ${
                          disabled
                            ? 'bg-card text-muted-foreground/40 border border-transparent cursor-not-allowed'
                            : activeTab === tab.id
                              ? 'bg-primary/15 text-primary border border-primary/30'
                              : 'bg-muted text-muted-foreground border border-transparent hover:bg-border'
                        }`}
                      >
                        <span>{tab.icon}</span>{tab.label}
                        {limit && (
                          <span className="text-[9px] text-amber-400/70 ml-1">({limit})</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                    {activeTab === 'text' && !isTabDisabled('text') && (
                      <div className="space-y-2.5">
                        <Textarea placeholder="Paste pesan WhatsApp, SMS, email, atau chat mencurigakan di sini..." value={textContent} onChange={(e) => setTextContent(e.target.value)}
                          className="min-h-[160px] sm:min-h-[200px] bg-card border-border text-sm sm:text-base resize-none focus:border-primary/50" />
                        <p className="text-[10px] sm:text-xs text-muted-foreground text-right">{textContent.length} / 5000 karakter</p>
                      </div>
                    )}
                    {activeTab === 'url' && (
                      <div className="space-y-2.5">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔗</span>
                          <Input placeholder="https://contoh-link-mencurigakan.com" value={urlContent} onChange={(e) => setUrlContent(e.target.value)}
                            className="pl-10 h-12 bg-card border-border text-sm sm:text-base focus:border-primary/50" />
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Paste link yang ingin Anda periksa keamanannya</p>
                      </div>
                    )}
                    {activeTab === 'image' && !isTabDisabled('image') && (
                      <div className="space-y-3">
                        <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-border rounded-2xl p-6 sm:p-8 text-center cursor-pointer hover:border-primary/30 hover:bg-card transition-all active:scale-[0.99]">
                          {imagePreview ? (
                            <div className="space-y-3">
                              <img src={imagePreview} alt="Preview" className="max-h-40 sm:max-h-48 mx-auto rounded-lg" />
                              <p className="text-xs text-muted-foreground">Klik untuk ganti gambar</p>
                            </div>
                          ) : (<><div className="text-3xl sm:text-4xl mb-3">📸</div><p className="text-xs sm:text-sm text-foreground/80 mb-1">Klik atau drag screenshot ke sini</p><p className="text-[10px] sm:text-xs text-muted-foreground">PNG, JPG, WEBP (maks 10MB) • {imageCount}/{MAX_IMAGES} gambar</p></>)}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </div>
                    )}
                    {activeTab === 'audio' && !isTabDisabled('audio') && (
                      <VoiceUpload audioFile={audioFile} onFileChange={setAudioFile} />
                    )}

                    {/* Show disabled message */}
                    {isTabDisabled(activeTab) && (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">
                          Batas maksimal untuk {activeTab === 'text' ? 'teks' : activeTab === 'image' ? 'gambar' : 'audio'} telah tercapai.
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Add to list + cancel buttons (when list already has items) */}
                {evidenceList.length > 0 && (
                  <div className="mt-4 flex gap-3">
                    <Button
                      onClick={handleAddEvidence}
                      disabled={!canAddCurrentInput()}
                      variant="outline"
                      className="flex-1 h-11 text-sm border-border hover:bg-muted disabled:opacity-40"
                    >
                      ✅ Tambahkan ke Daftar Bukti
                    </Button>
                    <Button
                      onClick={() => setShowInputArea(false)}
                      variant="outline"
                      className="h-11 text-sm border-border hover:bg-muted text-muted-foreground"
                    >
                      Batal
                    </Button>
                  </div>
                )}

                {/* Two-action area when list is EMPTY: Add & Continue OR Scan Now */}
                {evidenceList.length === 0 && (
                  <div className="mt-5 sm:mt-6 space-y-3">
                    {/* Primary: Scan immediately */}
                    <Button onClick={handleScan} disabled={!canScan() || isScanning}
                      className="w-full h-12 sm:h-14 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-foreground border-0 shadow-xl shadow-blue-500/25 disabled:opacity-40 disabled:shadow-none active:scale-[0.98] transition-all">
                      {cooldown ? (
                        <span className="flex items-center gap-2">
                          <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                          Sedang memproses...
                        </span>
                      ) : '🛡️ Analisis dengan AI'}
                    </Button>

                    {/* Secondary: Add to list for multi-evidence */}
                    <button
                      onClick={handleAddEvidence}
                      disabled={!canAddCurrentInput()}
                      className="w-full py-2.5 text-xs sm:text-sm text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span className="text-base">+</span> Punya bukti lain? Tambahkan ke investigasi
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-400">
              💡 {error}
            </motion.div>
          )}

          {/* Scan Button (shown when list has items) */}
          {evidenceList.length > 0 && (
            <div className="mt-5 sm:mt-6">
              <Button onClick={handleScan} disabled={!canScan() || isScanning}
                className="w-full h-12 sm:h-14 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-foreground border-0 shadow-xl shadow-blue-500/25 disabled:opacity-40 disabled:shadow-none active:scale-[0.98] transition-all">
                {cooldown ? (
                  <span className="flex items-center gap-2">
                    <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                    Sedang memproses...
                  </span>
                ) : evidenceList.length > 1 ? (
                  `🛡️ Analisis ${evidenceList.length} Bukti dengan AI`
                ) : (
                  '🛡️ Analisis dengan AI'
                )}
              </Button>
            </div>
          )}

          {/* Evidence count info */}
          {evidenceList.length > 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
              <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs text-primary/70">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                </svg>
                AI akan menganalisis semua bukti secara bersamaan dan mencari pola yang terhubung
              </div>
            </motion.div>
          )}

          <p className="text-[10px] sm:text-xs text-center text-muted-foreground mt-3 sm:mt-4">Hasil scan akan tersimpan di perangkat Anda</p>
        </div>
      </main>
      <MobileNav />
    </>
  );
}
