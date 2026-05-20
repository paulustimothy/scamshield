'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// Pre-seeded baseline for realistic social proof
const BASELINE_SCANS = 1247;
const TRENDING_TYPES = [
  { name: 'Penipuan QRIS', change: 34 },
  { name: 'CS Bank Palsu', change: 28 },
  { name: 'Lowongan Palsu', change: 22 },
  { name: 'Phishing Link', change: 19 },
];

function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
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
  const [totalScans, setTotalScans] = useState(BASELINE_SCANS);
  const [trendIndex, setTrendIndex] = useState(0);

  useEffect(() => {
    // Add actual user scans from localStorage
    try {
      const counters = JSON.parse(localStorage.getItem('scamshield_counters') || '{}');
      const today = new Date().toISOString().split('T')[0];
      const todayData = counters[today];
      if (todayData?.total) {
        setTotalScans(BASELINE_SCANS + todayData.total);
      }
    } catch { /* ignore */ }

    // Pick a random trending type
    setTrendIndex(Math.floor(Math.random() * TRENDING_TYPES.length));
  }, []);

  const trend = TRENDING_TYPES[trendIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-3xl mx-auto"
    >
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-500/[0.06] via-cyan-500/[0.04] to-blue-500/[0.06] border border-blue-500/15">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Total scans */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center shrink-0">
              <motion.span
                className="text-xl sm:text-2xl"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                📊
              </motion.span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pesan dianalisis hari ini</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                <AnimatedNumber value={totalScans} />
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full sm:w-px h-px sm:h-8 bg-border" />

          {/* Right: Trending */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <span className="text-lg">🔥</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Trending saat ini</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{trend.name}</span>
                <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  +{trend.change}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
