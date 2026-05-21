'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || value === 0) return;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration, isInView]);

  return <span ref={ref}>{display.toLocaleString('id-ID')}</span>;
}

export default function TrendCounter() {
  const [totalScans, setTotalScans] = useState(0);

  useEffect(() => {
    try {
      const counters = JSON.parse(localStorage.getItem('scamshield_counters') || '{}');
      let total = 0;
      for (const day of Object.values(counters)) {
        total += (day as { total: number }).total || 0;
      }
      setTotalScans(total);
    } catch { /* ignore */ }
  }, []);

  // If no scans yet, show an encouragement message
  if (totalScans === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto"
      >
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/[0.06] via-cyan-500/[0.04] to-blue-500/[0.06] border border-blue-500/15 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="text-lg">🛡️</span>
            <span>Mulai scan pesan pertama Anda untuk melindungi keluarga dari penipuan</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-3xl mx-auto"
    >
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/[0.06] via-cyan-500/[0.04] to-blue-500/[0.06] border border-blue-500/15">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center shrink-0">
            <span className="text-lg">📊</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pesan telah dianalisis di perangkat ini</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              <AnimatedNumber value={totalScans} />
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
