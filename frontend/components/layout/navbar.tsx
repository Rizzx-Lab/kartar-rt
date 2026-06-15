'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Users, Calendar, Megaphone, Image, Phone, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { name: 'Beranda', url: '/', icon: Home },
  { name: 'Tentang', url: '/tentang-kami', icon: Users },
  { name: 'Kegiatan', url: '/kegiatan', icon: Calendar },
  { name: 'Pengumuman', url: '/pengumuman', icon: Megaphone },
  { name: 'Galeri', url: '/galeri', icon: Image },
  { name: 'Kontak', url: '/kontak', icon: Phone },
];

export function Navbar() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(navItems[0].name);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const currentItem = navItems.find(item =>
      item.url === pathname ||
      (item.url !== '/' && pathname.startsWith(item.url))
    );
    if (currentItem) {
      setActiveTab(currentItem.name);
    } else if (pathname.startsWith('/kegiatan/')) {
      setActiveTab('Kegiatan');
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Desktop Floating Navbar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-4 left-0 right-0 z-50 hidden md:flex justify-center px-4 transition-all duration-300",
          isScrolled && "top-2"
        )}
      >
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: isScrolled ? 0.95 : 1 }}
          className="flex items-center gap-1 bg-navy-800/90 backdrop-blur-xl border border-white/10 py-2 px-3 rounded-2xl shadow-xl shadow-navy-900/50"
        >
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center gap-2 px-2 py-1.5 mr-1 group">
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(201,168,76,0.3)',
                    '0 0 20px rgba(201,168,76,0.5)',
                    '0 0 10px rgba(201,168,76,0.3)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-7 h-7 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0"
              >
                <span className="text-navy-900 font-bold text-xs">AE</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-white font-bold text-sm leading-tight whitespace-nowrap"
              >
                Karang Taruna
              </motion.div>
            </Link>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.3 }}
            className="w-px h-6 bg-white/10 mx-1 flex-shrink-0"
          />

          {/* Nav Items */}
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Link
                  href={item.url}
                  onClick={() => setActiveTab(item.name)}
                  className={cn(
                    "relative cursor-pointer text-xs font-medium px-2.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap",
                    "text-white/80 hover:text-gold-400",
                    isActive && "text-gold-400"
                  )}
                >
                  <motion.div
                    animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                    className="flex-shrink-0"
                  >
                    <Icon size={14} strokeWidth={2.5} />
                  </motion.div>
                  {item.name}

                  {isActive && (
                    <motion.div
                      layoutId="lamp"
                      className="absolute inset-0 w-full bg-white/10 rounded-xl -z-10"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Mobile Bottom Navbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed bottom-6 left-4 right-4 z-50 md:hidden flex justify-center"
      >
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-4 bg-navy-800/95 backdrop-blur-xl border border-white/10 py-1 px-2 rounded-full shadow-xl shadow-navy-900/50 max-w-[calc(100vw-2rem)]"
        >
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Link
                  href={item.url}
                  onClick={() => setActiveTab(item.name)}
                  className={cn(
                    "relative cursor-pointer p-3 rounded-full transition-all",
                    isActive ? "text-gold-400" : "text-white/70 hover:text-white"
                  )}
                >
                  <motion.div
                    animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>

                  {isActive && (
                    <motion.div
                      layoutId="mobile-lamp"
                      className="absolute inset-0 w-full bg-white/10 rounded-full -z-10"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Mobile padding for bottom navbar */}
      <div className="h-20 md:hidden" />
    </>
  );
}