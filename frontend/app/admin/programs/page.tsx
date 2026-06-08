'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPrograms, createProgram, updateProgram, deleteProgram, getProgramSessions, createSession, updateSession, deleteSession } from '@/lib/admin-api';
import { Calendar, X, Edit2, Trash2, Plus, ArrowRight } from 'lucide-react';

interface Program {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  frequency: string;
  is_active: boolean;
  order: number;
  cover_image: string | null;
  created_at: string;
}

interface Session {
  id: number;
  title: string;
  description: string | null;
  held_at: string;
  location: string | null;
  participants_count: number | null;
  status: 'upcoming' | 'done' | 'cancelled';
}

interface FormData {
  name: string;
  description: string;
  frequency: string;
  is_active: boolean;
}

interface SessionFormData {
  title: string;
  description: string;
  held_at: string;
  location: string;
  participants_count: string;
  status: 'upcoming' | 'done' | 'cancelled';
}

// Helper function for image URL
const getImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `http://localhost:8000/storage/${path}`;
};

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    frequency: 'monthly',
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Session management state
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionFormData, setSessionFormData] = useState<SessionFormData>({
    title: '',
    description: '',
    held_at: '',
    location: '',
    participants_count: '',
    status: 'upcoming',
  });
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);
  const [publishAsAnnouncement, setPublishAsAnnouncement] = useState(false);

  const hasFetched = useRef(false);

  const fetchPrograms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPrograms();
      if (response.success && response.data) {
        setPrograms(response.data);
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('Gagal memuat data program');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchPrograms();
  }, [fetchPrograms]);

  const openCreateModal = () => {
    setEditingProgram(null);
    setFormData({ name: '', description: '', frequency: 'monthly', is_active: true });
    setCoverImage(null);
    setShowModal(true);
  };

  const openEditModal = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      description: program.description || '',
      frequency: program.frequency,
      is_active: program.is_active,
    });
    setCoverImage(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = new FormData();
    form.append('name', formData.name);
    form.append('description', formData.description);
    form.append('frequency', formData.frequency);
    form.append('is_active', String(formData.is_active));
    if (coverImage) {
      form.append('cover_image', coverImage);
    }

    let response;
    if (editingProgram) {
      response = await updateProgram(editingProgram.id, form);
    } else {
      response = await createProgram(form);
    }

    if (response.success) {
      setShowModal(false);
      fetchPrograms();
    } else {
      alert(response.message || 'Terjadi kesalahan');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus program ini?')) {
      const response = await deleteProgram(id);
      if (response.success) {
        fetchPrograms();
      } else {
        alert(response.message || 'Gagal menghapus');
      }
    }
  };

  // Session management functions
  const openSessionsModal = async (program: Program) => {
    setSelectedProgram(program);
    resetSessionForm(); // Reset form to add mode
    setLoadingSessions(true);
    try {
      const response = await getProgramSessions(program.id);
      if (response.success && response.data) {
        setSessions(response.data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
    setLoadingSessions(false);
  };

  // openCreateSessionModal sekarang hanya reset form dan scroll ke form
  const openCreateSessionModal = () => {
    resetSessionForm();
    // Scroll ke form di dalam modal
    const formSection = document.querySelector('.bg-gray-50.rounded-xl.p-5');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  void openCreateSessionModal; // TODO: remove when needed

  const openEditSessionModal = (session: Session) => {
    setEditingSession(session);
    setSessionFormData({
      title: session.title,
      description: session.description || '',
      held_at: session.held_at.split('T')[0],
      location: session.location || '',
      participants_count: session.participants_count?.toString() || '',
      status: session.status,
    });
    // Scroll ke form
    const formSection = document.querySelector('.bg-gray-50.rounded-xl.p-5');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;
    setIsSubmittingSession(true);

    const data = {
      title: sessionFormData.title,
      description: sessionFormData.description || null,
      held_at: sessionFormData.held_at,
      location: sessionFormData.location || null,
      participants_count: sessionFormData.participants_count ? parseInt(sessionFormData.participants_count) : null,
      status: sessionFormData.status,
    };

    let response;
    if (editingSession) {
      response = await updateSession(selectedProgram.id, editingSession.id, data);
    } else {
      response = await createSession(selectedProgram.id, data, publishAsAnnouncement);
    }

    if (response.success) {
      // Refresh sessions
      const sessionsResponse = await getProgramSessions(selectedProgram.id);
      if (sessionsResponse.success && sessionsResponse.data) {
        setSessions(sessionsResponse.data);
      }
      // Show success message
      alert(response.message || (editingSession ? 'Sesi berhasil diupdate.' : 'Sesi berhasil disimpan.'));
      // Reset form to add new mode
      resetSessionForm();
    } else {
      alert(response.message || 'Terjadi kesalahan');
    }
    setIsSubmittingSession(false);
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!selectedProgram) return;
    if (confirm('Yakin ingin menghapus sesi ini?')) {
      const response = await deleteSession(selectedProgram.id, sessionId);
      if (response.success) {
        setSessions(sessions.filter(s => s.id !== sessionId));
        // Reset form ke mode tambah jika sesi yang dihapus sedang diedit
        if (editingSession && editingSession.id === sessionId) {
          resetSessionForm();
        }
      } else {
        alert(response.message || 'Gagal menghapus sesi');
      }
    }
  };

  const resetSessionForm = () => {
    setEditingSession(null);
    setSessionFormData({
      title: '',
      description: '',
      held_at: new Date().toISOString().split('T')[0],
      location: '',
      participants_count: '',
      status: 'upcoming',
    });
    setPublishAsAnnouncement(false);
  };

  const filteredPrograms = programs.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedPrograms = filteredPrograms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Program Kegiatan</h1>
          <p className="text-gray-500 text-sm">Kelola program dan sesi kegiatan</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-medium rounded-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Program
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <input
          type="text"
          placeholder="Cari program..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="h-36 bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-gray-200 animate-pulse rounded w-3/4" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : paginatedPrograms.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPrograms.map((program) => {
              const freqConfig = {
                monthly: { label: 'Bulanan', bgColor: 'bg-emerald-500', textColor: 'text-emerald-600' },
                yearly: { label: 'Tahunan', bgColor: 'bg-blue-500', textColor: 'text-blue-600' },
                once: { label: 'Sekali', bgColor: 'bg-purple-500', textColor: 'text-purple-600' },
                irregular: { label: 'Tidak Rutin', bgColor: 'bg-amber-500', textColor: 'text-amber-600' },
              };
              const freq = freqConfig[program.frequency as keyof typeof freqConfig] || freqConfig.irregular;
              const hasImage = getImageUrl(program.cover_image);

              return (
                <div key={program.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
                  {/* Image Area */}
                  <div className="relative h-40 overflow-hidden">
                    {hasImage ? (
                      <img
                        src={getImageUrl(program.cover_image)!}
                        alt={program.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-navy-100 to-navy-200" />
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-navy-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-semibold text-sm flex items-center gap-2">
                        Lihat Detail
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>

                    {/* Status Badges */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full text-white ${freq.bgColor}`}>
                        {freq.label}
                      </span>
                    </div>
                    {program.is_active && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">Aktif</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-navy-900 text-base mb-1 group-hover:text-gold-600 transition-colors">
                      {program.name}
                    </h3>
                    {program.description && (
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1">
                        {program.description}
                      </p>
                    )}

                    {/* Bottom meta */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => openSessionsModal(program)}
                        className="flex-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Kelola Sesi
                      </button>
                      <button
                        onClick={() => openEditModal(program)}
                        className="p-2 text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(program.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                {currentPage} dari {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">Belum ada program. Tambahkan program pertama Anda.</p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-medium rounded-lg"
          >
            Tambah Program
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy-800">
                {editingProgram ? 'Edit Program' : 'Tambah Program Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Program <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  placeholder="Contoh: Kerja Bakti"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 resize-none"
                  placeholder="Jelaskan program ini..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frekuensi</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  >
                    <option value="monthly">Bulanan</option>
                    <option value="yearly">Tahunan</option>
                    <option value="once">Sekali</option>
                    <option value="irregular">Tidak Rutin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={String(formData.is_active)}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gold-50 file:text-gold-600 file:font-medium hover:file:bg-gold-100"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session Management Modal - Integrated with Form */}
      <AnimatePresence>
        {selectedProgram && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => {
              setSelectedProgram(null);
              setShowSessionModal(false);
              resetSessionForm();
            }} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
                <div>
                  <h3 className="text-lg font-bold text-navy-800">Kelola Sesi</h3>
                  <p className="text-sm text-gray-500">{selectedProgram.name}</p>
                </div>
                <button onClick={() => {
                  setSelectedProgram(null);
                  setShowSessionModal(false);
                  resetSessionForm();
                }} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Session Form - Always Visible */}
                <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-navy-800">
                      {editingSession ? 'Edit Sesi' : 'Tambah Sesi Baru'}
                    </h4>
                    {editingSession && (
                      <button
                        onClick={resetSessionForm}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Tambah Baru
                      </button>
                    )}
                  </div>
                  <form onSubmit={handleSessionSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Judul Sesi <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={sessionFormData.title}
                          onChange={(e) => setSessionFormData({ ...sessionFormData, title: e.target.value })}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                          placeholder="Contoh: Sesi Kerja Bakti Juni 2026"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                        <input
                          type="date"
                          value={sessionFormData.held_at}
                          onChange={(e) => setSessionFormData({ ...sessionFormData, held_at: e.target.value })}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                      <textarea
                        value={sessionFormData.description}
                        onChange={(e) => setSessionFormData({ ...sessionFormData, description: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 resize-none"
                        placeholder="Deskripsi sesi (opsional)"
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                        <input
                          type="text"
                          value={sessionFormData.location}
                          onChange={(e) => setSessionFormData({ ...sessionFormData, location: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                          placeholder="Lokasi kegiatan"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Peserta</label>
                        <input
                          type="number"
                          value={sessionFormData.participants_count}
                          onChange={(e) => setSessionFormData({ ...sessionFormData, participants_count: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                          {editingSession?.status === 'done' && (
                            <span className="text-xs text-orange-500 ml-1">(Terkunci)</span>
                          )}
                        </label>
                        <select
                          value={sessionFormData.status}
                          onChange={(e) => setSessionFormData({ ...sessionFormData, status: e.target.value as any })}
                          disabled={editingSession?.status === 'done'}
                          className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 ${
                            editingSession?.status === 'done' ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value="upcoming">Akan Datang</option>
                          <option value="done">Selesai</option>
                          <option value="cancelled">Dibatalkan</option>
                        </select>
                      </div>
                    </div>

                    {/* Publish as Announcement Checkbox - Only show for new sessions */}
                    {!editingSession && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={publishAsAnnouncement}
                            onChange={(e) => setPublishAsAnnouncement(e.target.checked)}
                            className="mt-1 w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-amber-800">Terbitkan sebagai Pengumuman</span>
                            <p className="text-xs text-amber-600 mt-0.5">
                              Centang ini untuk membuat pengumuman baru secara otomatis di halaman Pengumuman.
                            </p>
                          </div>
                        </label>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={resetSessionForm}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingSession}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {isSubmittingSession ? 'Menyimpan...' : (editingSession ? 'Update Sesi' : 'Simpan Sesi')}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Sessions List */}
                <div className="border-t border-gray-200 pt-5">
                  <h4 className="font-semibold text-navy-800 mb-4">Daftar Sesi ({sessions.length})</h4>

                  {loadingSessions ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                          <div className="h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : sessions.length > 0 ? (
                    <div className="space-y-3">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className={`bg-white rounded-lg p-4 border transition-all ${
                            editingSession?.id === session.id
                              ? 'border-blue-400 shadow-md bg-blue-50/30'
                              : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 cursor-pointer" onClick={() => openEditSessionModal(session)}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                  session.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                                  session.status === 'done' ? 'bg-green-100 text-green-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {session.status === 'upcoming' ? 'Akan Datang' :
                                   session.status === 'done' ? 'Selesai' : 'Dibatalkan'}
                                </span>
                                {session.status === 'done' && (
                                  <span className="text-xs text-orange-500 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Terkunci
                                  </span>
                                )}
                              </div>
                              <h4 className="font-semibold text-navy-800">{session.title}</h4>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(session.held_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                                {session.location && (
                                  <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {session.location}
                                  </span>
                                )}
                              </div>
                              {session.participants_count && (
                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                  </svg>
                                  {session.participants_count} peserta
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 ml-4">
                              <button
                                onClick={() => openEditSessionModal(session)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Sesi"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSession(session.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus Sesi"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium text-gray-600">Belum ada sesi</p>
                      <p className="text-sm mt-1">Isi form di atas untuk menambahkan sesi.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}