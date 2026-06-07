'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getProgram, Program, Session } from '@/lib/api';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Image,
  CheckCircle,
  XCircle,
  CalendarClock,
} from 'lucide-react';

interface ProgramWithSessions extends Program {
  sessions: Session[];
}

const getImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `http://localhost:8000/storage/${path}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getFrequencyLabel = (frequency: string) => {
  switch (frequency) {
    case 'monthly': return 'Bulanan';
    case 'yearly': return 'Tahunan';
    case 'once': return 'Sekali';
    case 'irregular': return 'Tidak Rutin';
    default: return frequency;
  }
};

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [program, setProgram] = useState<ProgramWithSessions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'done' | 'cancelled'>('upcoming');

  // Get date param from URL (when redirected from program detail)
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const redirectDate = searchParams?.get('date');

  useEffect(() => {
    const fetchProgram = async () => {
      setIsLoading(true);
      try {
        const response = await getProgram(slug);
        if (response.success && response.data) {
          setProgram(response.data);
        }
      } catch (error) {
        console.error('Error fetching program:', error);
      }
      setIsLoading(false);
    };

    if (slug) {
      fetchProgram();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Loading State */}
        <div className="bg-navy-800 py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="h-8 w-32 bg-white/10 animate-pulse rounded mb-4" />
            <div className="h-12 w-64 bg-white/10 animate-pulse rounded" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="h-4 w-1/4 bg-gray-200 animate-pulse rounded mb-3" />
                <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded mb-2" />
                <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Program Tidak Ditemukan</h1>
          <Link href="/kegiatan" className="text-amber-600 hover:text-amber-700">
            Kembali ke Daftar Program
          </Link>
        </div>
      </div>
    );
  }

  const upcomingSessions = program.sessions.filter(s => s.status === 'upcoming');
  const doneSessions = program.sessions.filter(s => s.status === 'done');
  const cancelledSessions = program.sessions.filter(s => s.status === 'cancelled');

  const currentSessions = activeTab === 'upcoming' ? upcomingSessions
    : activeTab === 'done' ? doneSessions
    : cancelledSessions;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Logo */}
      <section className="relative bg-navy-900 overflow-hidden">
        {/* Animated Background */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-10 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-navy-500/30 rounded-full blur-3xl"
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/kegiatan"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors"
            >
              <motion.span
                whileHover={{ x: -5 }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Kembali ke Daftar</span>
              </motion.span>
            </Link>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Logo/Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.05 }}
              className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-xl flex items-center justify-center"
            >
              {getImageUrl(program.cover_image) ? (
                <img
                  src={getImageUrl(program.cover_image)!}
                  alt={program.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <motion.span
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-5xl md:text-6xl font-bold text-navy-900"
                >
                  {program.name.charAt(0)}
                </motion.span>
              )}
            </motion.div>

            {/* Program Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center md:text-left"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-4 ${
                  program.frequency === 'monthly'
                    ? 'bg-green-500/20 text-green-400'
                    : program.frequency === 'yearly'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-gray-500/20 text-gray-300'
                }`}
              >
                {getFrequencyLabel(program.frequency)}
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
              >
                {program.name}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-gray-300 text-lg leading-relaxed max-w-2xl"
              >
                {program.description}
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sessions Section */}
      <section className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <motion.div
              whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-xl p-4 shadow-sm text-center cursor-pointer transition-all"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CalendarClock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              </motion.div>
              <div className="text-2xl font-bold text-gray-900">{upcomingSessions.length}</div>
              <div className="text-sm text-gray-500">Akan Datang</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-xl p-4 shadow-sm text-center cursor-pointer transition-all"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              </motion.div>
              <div className="text-2xl font-bold text-gray-900">{doneSessions.length}</div>
              <div className="text-sm text-gray-500">Selesai</div>
            </motion.div>
            <motion.div
              whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              className="bg-white rounded-xl p-4 shadow-sm text-center cursor-pointer transition-all"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
              </motion.div>
              <div className="text-2xl font-bold text-gray-900">{cancelledSessions.length}</div>
              <div className="text-sm text-gray-500">Dibatalkan</div>
            </motion.div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden mb-6"
          >
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'upcoming'
                    ? 'text-amber-600 border-b-2 border-amber-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-center gap-2"
                >
                  <CalendarClock className="w-4 h-4" />
                  Akan Datang ({upcomingSessions.length})
                </motion.div>
              </button>
              <button
                onClick={() => setActiveTab('done')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'done'
                    ? 'text-amber-600 border-b-2 border-amber-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Selesai ({doneSessions.length})
                </motion.div>
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'cancelled'
                    ? 'text-amber-600 border-b-2 border-amber-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Dibatalkan ({cancelledSessions.length})
                </motion.div>
              </button>
            </div>
          </motion.div>

          {/* Sessions List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            {currentSessions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl p-8 shadow-sm text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    activeTab === 'upcoming' ? 'bg-blue-100'
                    : activeTab === 'done' ? 'bg-green-100'
                    : 'bg-red-100'
                  }`}
                >
                  {activeTab === 'upcoming' ? (
                    <CalendarClock className="w-8 h-8 text-blue-400" />
                  ) : activeTab === 'done' ? (
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-400" />
                  )}
                </motion.div>
                <p className="text-gray-500">
                  {activeTab === 'upcoming'
                    ? 'Belum ada sesi yang akan datang'
                    : activeTab === 'done'
                    ? 'Belum ada sesi yang selesai'
                    : 'Tidak ada sesi yang dibatalkan'
                  }
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentSessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, boxShadow: '0 15px 35px rgba(0,0,0,0.1)' }}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all mb-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Date Badge */}
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: -2 }}
                        className={`shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center ${
                          session.status === 'upcoming' ? 'bg-blue-600 text-white'
                          : session.status === 'done' ? 'bg-green-600 text-white'
                          : 'bg-red-600 text-white'
                        }`}
                      >
                        <div className="text-2xl font-bold">
                          {new Date(session.held_at).getDate()}
                        </div>
                        <div className="text-xs uppercase">
                          {new Date(session.held_at).toLocaleDateString('id-ID', { month: 'short' })}
                        </div>
                      </motion.div>

                      {/* Session Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {session.title}
                        </h3>

                        {session.description && (
                          <p className="text-gray-600 text-sm mb-4">
                            {session.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-1.5"
                          >
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(session.held_at)}</span>
                          </motion.div>

                          {session.location && (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="flex items-center gap-1.5"
                            >
                              <MapPin className="w-4 h-4" />
                              <span>{session.location}</span>
                            </motion.div>
                          )}

                          {session.participants_count && (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="flex items-center gap-1.5"
                            >
                              <Users className="w-4 h-4" />
                              <span>{session.participants_count} Peserta</span>
                            </motion.div>
                          )}

                          {session.photos_count > 0 && (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="flex items-center gap-1.5"
                            >
                              <Image className="w-4 h-4" />
                              <span>{session.photos_count} Foto</span>
                            </motion.div>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="mt-4">
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
                              session.status === 'upcoming'
                                ? 'bg-blue-100 text-blue-700'
                                : session.status === 'done'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {session.status === 'upcoming' && <CalendarClock className="w-3 h-3" />}
                            {session.status === 'done' && <CheckCircle className="w-3 h-3" />}
                            {session.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                            {session.status === 'upcoming' ? 'Akan Datang'
                             : session.status === 'done' ? 'Selesai'
                             : 'Dibatalkan'}
                          </motion.span>
                          {session.status === 'done' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const dateStr = new Date(session.held_at).toISOString().split('T')[0];
                                router.push(`/galeri?date=${dateStr}`);
                              }}
                              className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                            >
                              <Image className="w-3 h-3" />
                              Lihat Dokumentasi
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Full Date Info */}
          {currentSessions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.01 }}
              className="mt-6 bg-amber-50 rounded-xl p-4 border border-amber-200"
            >
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Calendar className="w-5 h-5 text-amber-600 mt-0.5" />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    {activeTab === 'upcoming' ? 'Sesi Berikutnya'
                     : activeTab === 'done' ? 'Sesi Terakhir'
                     : 'Sesi Dibatalkan'}
                  </p>
                  <p className="text-sm text-amber-700">
                    {formatDate(currentSessions[0].held_at)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}