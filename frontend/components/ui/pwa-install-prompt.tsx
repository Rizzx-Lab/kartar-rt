'use client';

import { useState, useEffect, useCallback } from 'react';
import { Smartphone, Download } from 'lucide-react';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkIsStandalone = useCallback((): boolean => {
    // Check native display mode (Chrome/Edge on Android and desktop)
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(display-mode: standalone)').matches
    ) {
      return true;
    }

    // Check iOS Safari standalone mode
    if (
      typeof window !== 'undefined' &&
      (window.navigator as any).standalone === true
    ) {
      return true;
    }

    return false;
  }, []);

  useEffect(() => {
    setIsLoading(true);

    // Check if already in standalone mode immediately
    if (checkIsStandalone()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(false);

    // Listen for beforeinstallprompt event from browser (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [checkIsStandalone]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Trigger browser install prompt
    await (deferredPrompt as any).prompt();

    const { outcome } = await (deferredPrompt as any).userChoice;

    if (outcome === 'accepted') {
      // User accepted install
      console.log('PWA install accepted');
    }

    // Clear the prompt
    setDeferredPrompt(null);
  };

  // Don't render anything while loading (avoids flash)
  if (isLoading) {
    return null;
  }

  // Don't show if already in standalone mode
  if (checkIsStandalone()) {
    return null;
  }

  // Yellow info box with Install button
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
      <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
        <Download className="w-4 h-4 text-navy-900" />
      </div>

      <button
        onClick={handleInstall}
        className="flex items-center gap-2 text-sm font-semibold text-amber-800 hover:text-amber-900 transition-colors"
        title="Pasang aplikasi Armalo Eluf Admin ke perangkat"
      >
        <Smartphone className="w-4 h-4" />
        <span>Install App</span>
      </button>
    </div>
  );
}
