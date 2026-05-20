'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AccessibilitySettings } from '@/lib/types';

const defaultSettings: AccessibilitySettings = {
  fontSize: 'normal',
  highContrast: false,
  simplifiedUI: false,
};

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
});

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('scamshield_a11y');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('scamshield_a11y', JSON.stringify(settings));

    const body = document.body;
    body.classList.remove('a11y-large', 'a11y-xl', 'a11y-contrast', 'a11y-simple');
    if (settings.fontSize === 'large') body.classList.add('a11y-large');
    if (settings.fontSize === 'xl') body.classList.add('a11y-xl');
    if (settings.highContrast) body.classList.add('a11y-contrast');
    if (settings.simplifiedUI) body.classList.add('a11y-simple');
  }, [settings, mounted]);

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
