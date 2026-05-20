'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const SCAN_STEPS = [
  'Membaca konten...',
  'Menganalisis pola bahasa...',
  'Memeriksa tanda manipulasi...',
  'Mengevaluasi tingkat risiko...',
  'Membandingkan dengan pola aman...',
  'Menyiapkan laporan...',
];

const MULTI_SCAN_STEPS = [
  'Membaca semua bukti...',
  'Menghubungkan bukti percakapan...',
  'Menganalisis hubungan antar bukti...',
  'Memeriksa pola konsistensi...',
  'Mencocokkan data lintas bukti...',
  'Mengevaluasi tingkat risiko gabungan...',
  'Menyiapkan laporan investigasi...',
];

interface ScanAnimationProps {
  isMultiEvidence?: boolean;
}

export default function ScanAnimation({ isMultiEvidence = false }: ScanAnimationProps) {
  const steps = isMultiEvidence ? MULTI_SCAN_STEPS : SCAN_STEPS;
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 900);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-6 sm:gap-8 px-4">
      {/* Animated Shield Scanner */}
      <div className="relative w-24 h-24 sm:w-32 sm:h-32">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Middle ring */}
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-primary/50"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner shield */}
        <motion.div
          className="absolute inset-3 sm:inset-4 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.div
            className="text-3xl sm:text-4xl"
            animate={{ rotateY: [0, 180, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            🛡️
          </motion.div>
        </motion.div>
        {/* Scanning sweep */}
        <motion.div
          className="absolute inset-3 sm:inset-4 rounded-full overflow-hidden"
        >
          <motion.div
            className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
        {/* Orbiting particles - reduced on mobile */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary"
            style={{ top: '50%', left: '50%' }}
            animate={{
              x: [0, Math.cos((i * Math.PI * 2) / 3) * 45, 0],
              y: [0, Math.sin((i * Math.PI * 2) / 3) * 45, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Indeterminate progress bar — pulses continuously instead of filling to 100% */}
      <div className="w-56 sm:w-64 space-y-3">
        <div className="h-1.5 rounded-full bg-muted overflow-hidden relative">
          <motion.div
            className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"
            animate={{ left: ['-33%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Status text */}
        <motion.p
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-xs sm:text-sm text-center text-muted-foreground"
        >
          {steps[currentStep]}
        </motion.p>
      </div>

      {/* AI Analysis indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <motion.div
          className="w-2 h-2 rounded-full bg-cyber-green"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        ScamShield AI sedang menganalisis
      </div>
    </div>
  );
}
