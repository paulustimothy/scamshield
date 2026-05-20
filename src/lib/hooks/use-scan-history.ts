'use client';

import { useLocalStorage } from './use-local-storage';
import type { ScanHistoryEntry } from '@/lib/types';

const MAX_HISTORY = 20;

export function useScanHistory() {
  const [history, setHistory] = useLocalStorage<ScanHistoryEntry[]>('scamshield_history', []);

  const addScan = (entry: ScanHistoryEntry) => {
    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, MAX_HISTORY);
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return { history, addScan, clearHistory };
}
