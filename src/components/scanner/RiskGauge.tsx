'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface RiskGaugeProps {
  value: number;
  riskLevel: 'aman' | 'mencurigakan' | 'berbahaya';
  size?: number;
}

export default function RiskGauge({ value, riskLevel, size = 160 }: RiskGaugeProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayValue(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayValue / 100) * circumference;

  const getColor = () => {
    if (displayValue <= 35) return { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.2)' };
    if (displayValue <= 65) return { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.2)' };
    if (displayValue <= 80) return { stroke: '#f97316', glow: 'rgba(249, 115, 22, 0.2)' };
    return { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.25)' };
  };

  const color = getColor();

  const riskLabels = {
    aman: { text: 'Kemungkinan Aman', emoji: '✅' },
    mencurigakan: { text: 'Perlu Diwaspadai', emoji: '⚠️' },
    berbahaya: { text: 'Kemungkinan Berbahaya', emoji: '🔴' },
  };

  const label = riskLabels[riskLevel];

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Subtle glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              `0 0 15px ${color.glow}`,
              `0 0 25px ${color.glow}`,
              `0 0 15px ${color.glow}`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="7"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: color.stroke }}>
            {displayValue}
          </span>
          <span className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">/ 100</span>
        </div>
      </div>

      {/* Risk label - calmer wording */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${
          riskLevel === 'aman' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
          riskLevel === 'mencurigakan' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
          'bg-red-500/15 text-red-400 border border-red-500/30'
        }`}
      >
        {label.emoji} {label.text}
      </motion.div>
    </div>
  );
}
