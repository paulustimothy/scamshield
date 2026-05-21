'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/shared/Navbar';
import MobileHeader from '@/components/shared/MobileHeader';
import MobileNav from '@/components/shared/MobileNav';
import { useAccessibility } from '@/components/shared/AccessibilityProvider';

export default function SettingsPage() {
  const { settings, updateSettings } = useAccessibility();
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fontOptions = [
    { value: 'normal' as const, label: 'Normal', size: 'text-xs sm:text-sm' },
    { value: 'large' as const, label: 'Besar', size: 'text-sm sm:text-base' },
    { value: 'xl' as const, label: 'Sangat Besar', size: 'text-base sm:text-lg' },
  ];

  return (
    <>
      <Navbar />
      <MobileHeader />

      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6 pb-28 md:pb-6">
        <div className="max-w-lg mx-auto space-y-6 sm:space-y-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1.5 sm:mb-2">⚙️ Pengaturan</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">Sesuaikan tampilan untuk kenyamanan Anda</p>
          </motion.div>

          {/* Font Size */}
          <section className="space-y-2.5 sm:space-y-3">
            <h2 className="font-semibold text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">Ukuran Huruf</h2>
            <div className="flex gap-2">
              {fontOptions.map((opt) => (
                <button key={opt.value} onClick={() => updateSettings({ fontSize: opt.value })}
                  className={`flex-1 py-2.5 sm:py-3 rounded-xl text-center transition-all active:scale-95 ${
                    settings.fontSize === opt.value
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'bg-muted text-muted-foreground border border-transparent hover:bg-border'
                  }`}>
                  <span className={opt.size}>{opt.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* High Contrast */}
          <section className="space-y-2.5 sm:space-y-3">
            <h2 className="font-semibold text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">Kontras Tinggi</h2>
            <button onClick={() => updateSettings({ highContrast: !settings.highContrast })}
              className={`w-full p-3.5 sm:p-4 rounded-xl text-left transition-all flex items-center justify-between active:scale-[0.99] ${
                settings.highContrast ? 'bg-primary/15 border border-primary/30' : 'bg-muted border border-transparent'
              }`}>
              <div className="min-w-0">
                <p className="font-medium text-xs sm:text-sm">Mode Kontras Tinggi</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Warna lebih terang untuk keterbacaan lebih baik</p>
              </div>
              <div className={`w-11 sm:w-12 h-6 sm:h-7 rounded-full transition-colors shrink-0 ml-3 ${settings.highContrast ? 'bg-primary' : 'bg-border'}`}>
                <div className={`w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-white mt-1 transition-transform ${settings.highContrast ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
            </button>
          </section>

          {/* Simplified UI */}
          <section className="space-y-2.5 sm:space-y-3">
            <h2 className="font-semibold text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">Tampilan Sederhana</h2>
            <button onClick={() => updateSettings({ simplifiedUI: !settings.simplifiedUI })}
              className={`w-full p-3.5 sm:p-4 rounded-xl text-left transition-all flex items-center justify-between active:scale-[0.99] ${
                settings.simplifiedUI ? 'bg-primary/15 border border-primary/30' : 'bg-muted border border-transparent'
              }`}>
              <div className="min-w-0">
                <p className="font-medium text-xs sm:text-sm">Mode Sederhana</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Sembunyikan animasi dan elemen dekoratif</p>
              </div>
              <div className={`w-11 sm:w-12 h-6 sm:h-7 rounded-full transition-colors shrink-0 ml-3 ${settings.simplifiedUI ? 'bg-primary' : 'bg-border'}`}>
                <div className={`w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-white mt-1 transition-transform ${settings.simplifiedUI ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
            </button>
          </section>

          {/* Clear Data */}
          <section className="space-y-2.5 sm:space-y-3">
            <h2 className="font-semibold text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">Data</h2>
            <Button variant="outline" className="w-full border-border hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 text-xs sm:text-sm active:scale-[0.98]" onClick={() => {
              localStorage.removeItem('scamshield_history');
              showToast('✅ Riwayat scan berhasil dihapus');
            }}>
              🗑️ Hapus Riwayat Scan
            </Button>
          </section>

          {/* About */}
          <section className="space-y-3 pt-4 border-t border-border">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-foreground font-bold text-lg sm:text-xl">S</div>
              <h3 className="font-semibold text-sm sm:text-base">ScamShield AI</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Powered by Google Gemini AI</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Melindungi keluarga Indonesia dari penipuan online</p>
            </div>
          </section>
        </div>
      </main>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-sm text-emerald-400 shadow-xl backdrop-blur-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <MobileNav />
    </>
  );
}
