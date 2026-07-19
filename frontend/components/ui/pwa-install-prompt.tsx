'use client';

import { useState, useEffect, useCallback } from 'react';
import { Smartphone, X, Download } from 'lucide-react';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const checkIsInstalled = useCallback((): boolean => {
    // 1. Check native display mode (works for Chrome/Edge on Android and desktop)
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(display-mode: standalone)').matches
    ) {
      return true;
    }

    // 2. Check iOS Safari standalone mode
    if (
      typeof window !== 'undefined' &&
      (window.navigator as any).standalone === true
    ) {
      return true;
    }

    return false;
  }, []);

  useEffect(() => {
    // Detect iOS Safari (beforeinstallprompt never fires on iOS)
    const ua = navigator.userAgent;
    setIsIOS(/iPhone|iPad|iPod/.test(ua));

    // Check if already installed immediately
    if (checkIsInstalled()) {
      setIsInstalled(true);
      setIsLoading(false);
      return;
    }

    // Check session storage for prior dismissal this session
    const dismissed = sessionStorage.getItem('pwa-install-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }

    setIsLoading(false);

    // Listen for native display-mode changes (e.g. user installs via browser menu)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
      }
    };
    mediaQuery.addEventListener('change', handleDisplayChange);

    // Listen for beforeinstallprompt event from browser (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('[PWA] beforeinstallprompt fired — deferred prompt captured.');
      setDeferredPrompt(e);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      mediaQuery.removeEventListener('change', handleDisplayChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [checkIsInstalled]);

  const handleInstall = async () => {
    console.log('[PWA] Install action triggered.', {
      hasDeferredPrompt: !!deferredPrompt,
      isIOS,
    });

    if (isIOS) {
      // iOS: show manual instructions (beforeinstallprompt never fires on iOS)
      alert(
        'Untuk menambahkan ke Layar Beranda di iOS:\n\n1. Ketuk ikon Share (kotak dengan panah ke atas)\n2. Gulir ke bawah dan ketuk "Tambah ke Layar Beranda"\n3. Ketuk "Tambah" di kanan atas'
      );
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
    } else {
      // Fallback for environments where beforeinstallprompt was already consumed
      alert(
        'Untuk install PWA:\n\n📱 Android: Ketuk tombol ⋮ (titik tiga) → "Pasang aplikasi" atau "Tambahkan ke Layar Beranda"\n\n💻 Desktop (Chrome/Edge): Ctrl+Shift+I → Application → Install'
      );
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Store dismissal in sessionStorage so it doesn't reappear on navigation
    // within the same browser session. It will reappear after the browser restarts.
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't render anything while loading (avoids flash)
  if (isLoading) {
    return null;
  }

  // Don't show if the app is already installed
  if (isInstalled) {
    return null;
  }

  // On iOS, show a static info button instead of a dismissible banner,
  // since beforeinstallprompt never fires on iOS anyway
  if (isIOS) {
    return (
      <button
        onClick={handleInstall}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-navy-900 font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
        title="Lihat cara install di iOS"
      >
        <Smartphone className="w-4 h-4" />
        <span className="hidden lg:inline">Install di iOS</span>
      </button>
    );
  }

  // Only show the dismissible banner if:
  // - beforeinstallprompt has fired (deferredPrompt available)
  // - user hasn't dismissed it this session
  if (deferredPrompt && !isDismissed) {
    return (
      <>
        {/* Dismissible banner */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-navy-900 border-t border-amber-500/30 shadow-2xl shadow-navy-900/50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
                <Download className="w-4 h-4 text-navy-900" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold leading-tight truncate">
                  Pasang Aplikasi Armalo Eluf
                </p>
                <p className="text-gray-400 text-xs leading-tight">
                  Tambah ke layar utama untuk akses cepat dan pengalaman app-like
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleInstall}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-navy-900 text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
              >
                Pasang
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Existing small button in toolbar — keep for users who dismissed the banner */}
        <button
          onClick={handleInstall}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-navy-900 font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
          title="Install aplikasi ke perangkat"
        >
          <Smartphone className="w-4 h-4" />
          <span className="hidden lg:inline">Install App</span>
        </button>
      </>
    );
  }

  // Banner was dismissed but beforeinstallprompt is still active — show just the button
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
