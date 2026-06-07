'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getAdminDashboard } from '@/lib/admin-api';

interface DashboardStats {
  programs_count: number;
  announcements_count: number;
  galleries_count: number;
  contacts_unread: number;
  recent_contacts: any[];
  recent_announcements: any[];
  recent_galleries: any[];
}

// Default stats for instant render
const defaultStats: DashboardStats = {
  programs_count: 0,
  announcements_count: 0,
  galleries_count: 0,
  contacts_unread: 0,
  recent_contacts: [],
  recent_announcements: [],
  recent_galleries: [],
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchDashboard = async () => {
      setError(null);
      try {
        const response = await getAdminDashboard();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Gagal memuat data dashboard');
      }
      setIsLoading(false);
    };

    // Small delay to allow page hydration
    const timer = setTimeout(fetchDashboard, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Dashboard</h1>
          <p className="text-gray-500 text-sm">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Program"
          value={stats.programs_count}
          color="bg-blue-500"
          isLoading={isLoading}
          delay={0}
        />
        <StatCard
          label="Pengumuman"
          value={stats.announcements_count}
          color="bg-gold-500"
          isLoading={isLoading}
          delay={50}
        />
        <StatCard
          label="Galeri"
          value={stats.galleries_count}
          color="bg-green-500"
          isLoading={isLoading}
          delay={100}
        />
        <StatCard
          label="Pesan Baru"
          value={stats.contacts_unread}
          color="bg-purple-500"
          isLoading={isLoading}
          delay={150}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Contacts */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-navy-800">Pesan Terbaru</h2>
              {stats.contacts_unread > 0 && (
                <span className="px-2 py-1 bg-gold-500 text-white text-xs font-medium rounded-full">
                  {stats.contacts_unread} baru
                </span>
              )}
            </div>
          </div>
          <div className="p-5">
            {stats.recent_contacts && stats.recent_contacts.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_contacts.slice(0, 5).map((contact: any, index: number) => (
                  <div
                    key={contact.id || index}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center text-gold-600 font-semibold text-sm">
                      {contact.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy-800 truncate">{contact.name}</p>
                      <p className="text-xs text-gray-500 truncate">{contact.message}</p>
                    </div>
                    {!contact.is_read && (
                      <div className="w-2 h-2 bg-gold-500 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">Belum ada pesan</p>
            )}
            <Link
              href="/admin/contacts"
              className="block mt-4 text-center text-sm text-gold-600 hover:text-gold-700 font-medium transition-colors"
            >
              Lihat semua pesan →
            </Link>
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-navy-800">Pengumuman Terbaru</h2>
          </div>
          <div className="p-5">
            {stats.recent_announcements && stats.recent_announcements.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_announcements.slice(0, 5).map((ann: any, index: number) => (
                  <div
                    key={ann.id || index}
                    className="p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-navy-800 truncate flex-1">{ann.title}</p>
                      {ann.is_pinned && (
                        <span className="text-xs">📌</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(ann.published_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">Belum ada pengumuman</p>
            )}
            <Link
              href="/admin/announcements"
              className="block mt-4 text-center text-sm text-gold-600 hover:text-gold-700 font-medium transition-colors"
            >
              Kelola pengumuman →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-navy-800">Aksi Cepat</h2>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: 'Tambah Program', href: '/admin/programs', color: 'bg-blue-500' },
              { label: 'Buat Pengumuman', href: '/admin/announcements', color: 'bg-gold-500' },
              { label: 'Upload Galeri', href: '/admin/galleries', color: 'bg-green-500' },
              { label: 'Balas Pesan', href: '/admin/contacts', color: 'bg-purple-500' },
            ].map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-navy-800 group-hover:text-gold-600 transition-colors">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  isLoading: boolean;
  delay?: number;
}

function StatCard({ label, value, color, isLoading, delay = 0 }: StatCardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${color} opacity-30 rounded-xl`} />
        </div>
        <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      </div>
      <div className="text-3xl font-bold text-navy-800 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}