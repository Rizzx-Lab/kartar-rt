'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { PWAInstallPrompt } from '@/components/ui/pwa-install-prompt';
import {
  LayoutDashboard,
  Calendar,
  Megaphone,
  Image,
  Mail,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ExternalLink,
  Home,
  Bell,
  TrendingUp,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getNotifications } from '@/lib/admin-api';

// Navigation Items - filtered by role
const allNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/programs', label: 'Program', icon: Calendar },
  { href: '/admin/organization', label: 'Struktur Organisasi', icon: Briefcase },
  { href: '/admin/announcements', label: 'Pengumuman', icon: Megaphone },
  { href: '/admin/galleries', label: 'Galeri', icon: Image },
  { href: '/admin/contacts', label: 'Kontak', icon: Mail },
  { href: '/admin/users', label: 'Pengguna', icon: Users, superAdminOnly: true },
  { href: '/admin/settings', label: 'Pengaturan', icon: Settings, superAdminOnly: true },
];

// Collapsible Section Component
const CollapsibleSection = ({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2.5 px-4 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
      >
        <span className="font-medium text-sm">{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-500"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-4 pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Filter nav items based on user role (superAdmin sees all, admin sees only non-superAdmin items)
  const navItems = allNavItems.filter(item => {
    if (item.superAdminOnly) {
      return user?.role === 'superadmin' || user?.role === 'super_admin';
    }
    return true;
  });

  // Fetch real notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getNotifications();
        if (response.success && response.data) {
          setNotifications(response.data.slice(0, 5)); // Get latest 5
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  // Swipe gesture handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Swipe dari kiri layar (0-30px) saat sidebar tertutup → buka
    if (isRightSwipe && touchStart < 30 && !isMobileOpen) {
      setIsMobileOpen(true);
    }

    // Swipe kiri saat sidebar terbuka → tutup
    if (isLeftSwipe && isMobileOpen) {
      setIsMobileOpen(false);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-dropdown') && showNotifications) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications]);

  // If on login page, don't show admin layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Memuat...</p>
        </motion.div>
      </div>
    );
  }

  // If not authenticated, don't render admin content
  if (!isAuthenticated) {
    return null;
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <>
      {/* PWA Meta Tags */}
      <link rel="manifest" href="/admin/manifest.json" />
      <meta name="theme-color" content="#C9A84C" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <link rel="apple-touch-icon" href="/icons/icon-192.png" />

      <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Mobile Sidebar */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-72 bg-gray-900 text-white z-50 flex flex-col overflow-hidden"
            >
              <SidebarContent
                user={user}
                pathname={pathname}
                navItems={navItems}
                onClose={() => setIsMobileOpen(false)}
                onLogout={() => setShowLogoutConfirm(true)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-30 overflow-hidden">
        <SidebarContent
          user={user}
          pathname={pathname}
          navItems={navItems}
          onLogout={() => setShowLogoutConfirm(true)}
        />
      </aside>

      {/* Main Content - dengan swipe gesture */}
      <div
        className="flex-1 md:ml-64 flex flex-col min-h-screen"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Top Bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
          {/* Swipe Hint Indicator */}
          {!isMobileOpen && (
            <div className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gray-200 rounded-r-full animate-pulse opacity-50" />
          )}

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-amber-600 transition-colors">Beranda</Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-700">Admin</span>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Install PWA Button */}
            <PWAInstallPrompt />

            {/* Notification Bell */}
            <div className="relative notification-dropdown">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                }}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-navy-800">
                      <h3 className="font-bold text-white">Notifikasi</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs text-gray-300">{unreadCount} baru</span>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={cn(
                              'p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer',
                              !notification.is_read && 'bg-blue-50/30'
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                {!notification.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm">{notification.title || notification.name}</p>
                                <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{notification.message || notification.content}</p>
                                <p className="text-gray-400 text-xs mt-1">
                                  {new Date(notification.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">Belum ada notifikasi</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-100">
                      <Link
                        href="/admin/contacts"
                        onClick={() => setShowNotifications(false)}
                        className="block w-full py-2 text-sm text-center text-amber-600 hover:text-amber-700 font-medium hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        Lihat semua notifikasi
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Page Content */}
        <main
          className="flex-1 p-4 md:p-6 overflow-auto"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowLogoutConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
            >
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Konfirmasi Keluar
              </h3>
              <p className="text-gray-600 text-sm text-center mb-6">
                Apakah Anda yakin ingin keluar dari panel admin?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
                >
                  Keluar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </>
  );
}

// Sidebar Content Component
function SidebarContent({
  user,
  pathname,
  onClose,
  onLogout,
  navItems,
}: {
  user: any;
  pathname: string;
  onClose?: () => void;
  onLogout: () => void;
  navItems: typeof allNavItems;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <Link href="/admin/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-700 transition-colors">
            <span className="text-white font-bold text-base">AE</span>
          </div>
          <div>
            <div className="text-white font-semibold text-base leading-tight">Admin Panel</div>
            <div className="text-gray-500 text-xs">Karang Taruna Armalo Eluf</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {/* Main Menu Label */}
        <div className="px-4 mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Menu</span>
        </div>

        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                    isActive
                      ? 'bg-white text-gray-900'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-gray-700' : '')} />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Quick Links */}
        <div className="px-4 mt-6 mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lainnya</span>
        </div>

        <ul className="space-y-0.5 px-2">
          <li>
            <Link
              href="/"
              target="_blank"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span className="text-sm">Kunjungi Website</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer - User Info & Logout */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50 mb-2">
          <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-semibold text-xs">{user?.name?.[0]?.toUpperCase() || 'A'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name || 'Admin'}</p>
            <p className="text-gray-500 text-xs truncate">{user?.email || 'admin@armaloeluf.id'}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
}