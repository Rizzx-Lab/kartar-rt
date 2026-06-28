'use client';

import { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';
import { getPwaStatus, markPwaInstalled } from '@/lib/admin-api';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already installed via browser display mode
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      setIsLoading(false);
      return;
    }

    // Fetch PWA status from backend API
    const checkPwaStatus = async () => {
      try {
        const installed = await getPwaStatus();
        if (installed) {
          setIsInstalled(true);
        }
      } catch (error) {
        console.error('Failed to fetch PWA status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPwaStatus();

    // Listen for beforeinstallprompt event from browser
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('✅ beforeinstallprompt fired! PWA can be installed.');
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    console.log('Install clicked, deferredPrompt:', deferredPrompt ? 'AVAILABLE ✅' : 'NULL ❌');

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        // User accepted the install prompt
        setDeferredPrompt(null);

        // Mark as installed in backend
        try {
          await markPwaInstalled();
        } catch (error) {
          console.error('Failed to mark PWA as installed in backend:', error);
        }

        setIsInstalled(true);
      }
    } else {
      // Fallback: show manual install guide
      alert(
        'Untuk install PWA:\n\n📱 Android: Klik tombol ⋮ → "Pasang aplikasi"\n\n💻 Desktop: Ctrl+Shift+I → Application → Install\n\n📱 iOS: Share → Tambah ke Layar Beranda'
      );
    }
  };

  // Don't show anything while loading (no flash)
  if (isLoading) {
    return null;
  }

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  return (
    <button
      onClick={handleInstall}
      className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-navy-900 font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
      title="Install aplikasi ke perangkat"
    >
      <Smartphone className="w-4 h-4" />
      <span className="hidden lg:inline">Install App</span>
    </button>
  );
}
