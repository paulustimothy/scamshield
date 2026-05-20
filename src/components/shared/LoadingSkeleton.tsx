'use client';

import { motion } from 'framer-motion';

export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-muted ${className}`} />
  );
}

export function ScannerSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <LoadingSkeleton className="h-10 w-48" />
      <LoadingSkeleton className="h-40 w-full" />
      <LoadingSkeleton className="h-12 w-full" />
    </div>
  );
}

export function ResultSkeleton() {
  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div className="flex justify-center">
        <LoadingSkeleton className="h-40 w-40 rounded-full" />
      </div>
      <LoadingSkeleton className="h-8 w-64 mx-auto" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <LoadingSkeleton key={i} className="h-8 w-full" />
        ))}
      </div>
      <LoadingSkeleton className="h-32 w-full" />
    </div>
  );
}

export function SpinnerLoader({ text = 'Memuat...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <motion.div
        className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
