'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  archiveAnnouncement,
  reactivateAnnouncement,
} from '@/lib/admin-api';
import { X, Image as ImageIcon } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { useAuth } from '@/contexts/AuthContext';

interface Announcement {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  is_pinned: boolean;
  is_published: boolean;
  published_at: string;
  expired_at: string | null;
  status: 'active' | 'scheduled' | 'archived';
  created_at: string;
  image_url?: string | null;
  image_public_id?: string | null;
}

interface FormData {
  title: string;
  content: string;
  excerpt: string;
  is_pinned: boolean;
  published_at: string;
  expired_at: string;
}

type TabType = 'all' | 'active' | 'scheduled' | 'archived';

export default function AdminAnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    excerpt: '',
    is_pinned: false,
    published_at: new Date().toISOString().split('T')[0],
    expired_at: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  // Modals state
  const [archiveModal, setArchiveModal] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });
  const [reactivateModal, setReactivateModal] = useState<{
    isOpen: boolean;
    id: number | null;
    expiredAt: string;
    error: string | null;
  }>({
    isOpen: false,
    id: null,
    expiredAt: '',
    error: null,
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const getTomorrowLocalDateString = (): string => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    const response = await getAnnouncements();
    if (response.success && response.data) {
      setAnnouncements(response.data);
    }
    setIsLoading(false);
  };

  const openCreateModal = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      is_pinned: false,
      published_at: new Date().toISOString().split('T')[0],
      expired_at: '',
    });
    setSelectedImage(null);
    setImagePreview(null);
    setRemoveImage(false);
    setShowModal(true);
  };

  const openEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content || '',
      excerpt: announcement.excerpt || '',
      is_pinned: announcement.is_pinned,
      published_at: announcement.published_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      expired_at: announcement.expired_at?.split('T')[0] || '',
    });
    setSelectedImage(null);
    setImagePreview(null);
    setRemoveImage(false);
    setShowModal(true);
  };

  const openReactivateModal = (id: number) => {
    setReactivateModal({
      isOpen: true,
      id,
      expiredAt: '',
      error: null,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setRemoveImage(false);
    }
  };

  const handleRemoveExistingImage = () => {
    setRemoveImage(true);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = new FormData();
    form.append('title', formData.title);
    form.append('content', formData.content);
    form.append('excerpt', formData.excerpt);
    form.append('is_pinned', String(formData.is_pinned));
    form.append('published_at', formData.published_at);
    if (formData.expired_at) {
      form.append('expired_at', formData.expired_at);
    }

    if (selectedImage) {
      form.append('image', selectedImage);
    }

    if (removeImage) {
      form.append('remove_image', '1');
    }

    let response;
    if (editingAnnouncement) {
      response = await updateAnnouncement(editingAnnouncement.id, form);
    } else {
      response = await createAnnouncement(form);
    }

    if (response.success) {
      setShowModal(false);
      fetchAnnouncements();
      showToast(
        editingAnnouncement ? 'Pengumuman berhasil diperbarui.' : 'Pengumuman berhasil dibuat.',
        'success'
      );
    } else {
      showToast(response.message || 'Terjadi kesalahan', 'error');
    }
    setIsSubmitting(false);
  };

  const handleArchive = async () => {
    if (isActionSubmitting || !archiveModal.id) return;
    setIsActionSubmitting(true);
    const id = archiveModal.id;
    setArchiveModal({ isOpen: false, id: null });
    const response = await archiveAnnouncement(id);
    if (response.success) {
      showToast(response.message || 'Pengumuman berhasil diarsipkan.', 'success');
      fetchAnnouncements();
    } else {
      showToast(response.message || 'Gagal mengarsipkan pengumuman.', 'error');
    }
    setIsActionSubmitting(false);
  };

  const handleReactivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isActionSubmitting || !reactivateModal.id) return;

    setIsActionSubmitting(true);
    setReactivateModal((prev) => ({ ...prev, error: null }));

    const response = await reactivateAnnouncement(
      reactivateModal.id,
      reactivateModal.expiredAt || null
    );

    if (response.success) {
      setReactivateModal({ isOpen: false, id: null, expiredAt: '', error: null });
      showToast(response.message || 'Pengumuman berhasil diaktifkan kembali.', 'success');
      fetchAnnouncements();
    } else {
      const errMsg = response.message || 'Gagal mengaktifkan kembali pengumuman.';
      setReactivateModal((prev) => ({ ...prev, error: errMsg }));
      showToast(errMsg, 'error');
    }
    setIsActionSubmitting(false);
  };

  const handleDelete = async () => {
    if (isActionSubmitting || !deleteModal.id) return;
    setIsActionSubmitting(true);
    const id = deleteModal.id;
    setDeleteModal({ isOpen: false, id: null });
    const response = await deleteAnnouncement(id);
    if (response.success) {
      showToast(response.message || 'Pengumuman berhasil dihapus secara permanen.', 'success');
      fetchAnnouncements();
    } else {
      showToast(response.message || 'Gagal menghapus pengumuman.', 'error');
    }
    setIsActionSubmitting(false);
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'active', label: 'Aktif' },
    { key: 'scheduled', label: 'Terjadwal' },
    { key: 'archived', label: 'Arsip' },
  ];

  const counts = useMemo(() => {
    return {
      all: announcements.length,
      active: announcements.filter((a) => a.status === 'active').length,
      scheduled: announcements.filter((a) => a.status === 'scheduled').length,
      archived: announcements.filter((a) => a.status === 'archived').length,
    };
  }, [announcements]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      if (activeTab !== 'all' && a.status !== activeTab) {
        return false;
      }
      if (searchQuery.trim() && !a.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [announcements, activeTab, searchQuery]);

  const paginatedAnnouncements = filteredAnnouncements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Pengumuman</h1>
          <p className="text-gray-500 text-sm">Kelola pengumuman untuk warga</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-medium rounded-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Buat Pengumuman
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.key
                ? 'bg-navy-800 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 bg-white'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <input
          type="text"
          placeholder="Cari pengumuman..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-200 animate-pulse rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : paginatedAnnouncements.length > 0 ? (
        <>
          <div className="space-y-4">
            {paginatedAnnouncements.map((announcement) => (
              <div key={announcement.id} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    announcement.is_pinned ? 'bg-gold-500' : 'bg-gray-200'
                  }`}>
                    {announcement.image_url ? (
                      <img
                        src={announcement.image_url}
                        alt=""
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <svg className={`w-5 h-5 ${announcement.is_pinned ? 'text-navy-900' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24c0-1.104 1.118-1.94 2.117-1.855 2.478v1.268c-.063.534-.117 1.05-.154 1.54M5 12.14S17 11 17 11s-.755-.96-.755-1.861C16.245 9.568 15.763 9 15 9s-1.23.568-1.23.568S2 11 2 15s1.755 4.14 1.755 4.14" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {announcement.is_pinned && (
                        <span className="px-2 py-1 bg-gold-500/10 text-gold-600 text-xs font-medium rounded">
                          Disematkan
                        </span>
                      )}
                      {announcement.image_url && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          Ada Gambar
                        </span>
                      )}
                      {announcement.status === 'active' && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Aktif
                        </span>
                      )}
                      {announcement.status === 'scheduled' && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                          Terjadwal
                        </span>
                      )}
                      {announcement.status === 'archived' && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                          Arsip
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-navy-800">{announcement.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {announcement.excerpt || announcement.content?.substring(0, 100)}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">
                        {new Date(announcement.published_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        {announcement.status !== 'archived' ? (
                          <>
                            <button
                              onClick={() => openEditModal(announcement)}
                              disabled={isActionSubmitting}
                              className="px-3 py-1 text-sm text-gold-600 hover:bg-gold-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setArchiveModal({ isOpen: true, id: announcement.id })}
                              disabled={isActionSubmitting}
                              className="px-3 py-1 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              Arsipkan
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => openReactivateModal(announcement.id)}
                              disabled={isActionSubmitting}
                              className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              Aktifkan Kembali
                            </button>
                            {user?.role === 'super_admin' && (
                              <button
                                onClick={() => setDeleteModal({ isOpen: true, id: announcement.id })}
                                disabled={isActionSubmitting}
                                title="Hapus Permanen"
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m-7-3V5a2 2 0 012-2h3.5" />
                                </svg>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24c0-1.104 1.118-1.94 2.117-1.855 2.478v1.268c-.063.534-.117 1.05-.154 1.54M5 12.14S17 11 17 11s-.755-.96-.755-1.861C16.245 9.568 15.763 9 15 9s-1.23.568-1.23.568S2 11 2 15s1.755 4.14 1.755 4.14" />
          </svg>
          <p className="text-gray-500">
            {searchQuery.trim()
              ? `Tidak ada pengumuman yang cocok dengan "${searchQuery}".`
              : activeTab === 'active'
              ? 'Tidak ada pengumuman aktif saat ini.'
              : activeTab === 'scheduled'
              ? 'Tidak ada pengumuman terjadwal.'
              : activeTab === 'archived'
              ? 'Tidak ada pengumuman di arsip.'
              : 'Belum ada pengumuman. Buat pengumuman pertama.'}
          </p>
          {(activeTab === 'all' || activeTab === 'active') && !searchQuery.trim() && (
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-medium rounded-lg"
            >
              Buat Pengumuman
            </button>
          )}
        </div>
      )}

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy-800">
                {editingAnnouncement ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Poster</label>
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : editingAnnouncement?.image_url && !removeImage ? (
                  <div className="relative inline-block">
                    <img src={editingAnnouncement.image_url} alt="Current" className="w-full h-40 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={handleRemoveExistingImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l4.586-4.586a2 2 0 012.828 0L16 16" />
                      </svg>
                      <p className="text-sm text-gray-500">Klik untuk upload gambar (max 2MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
                {removeImage && !imagePreview && (
                  <p className="text-sm text-red-500 mt-1">Gambar akan dihapus saat disimpan</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  placeholder="Judul pengumuman..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt / Ringkasan</label>
                <input
                  type="text"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  placeholder="Ringkasan singkat (opsional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Isi Pengumuman <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 resize-none"
                  placeholder="Tulis pengumuman di sini..."
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Terbit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.published_at}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  />
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                    Hari ini → terbit langsung.<br />
                    Masa depan → otomatis Draft.
                  </p>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_pinned}
                      onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                      className="w-4 h-4 text-gold-500 border-gray-300 rounded focus:ring-gold-500"
                    />
                    <span className="text-sm text-gray-700">Sematkan</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Berakhir <span className="text-gray-400">(opsional)</span>
                </label>
                <input
                  type="date"
                  value={formData.expired_at}
                  min={formData.published_at}
                  onChange={(e) => setFormData({ ...formData, expired_at: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                />
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  Kosongkan jika tidak ada batas waktu.<br />
                  Setelah tanggal ini, pengumuman otomatis ditarik.
                </p>
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

      {/* Archive Confirmation Modal */}
      <ConfirmModal
        isOpen={archiveModal.isOpen}
        title="Arsipkan Pengumuman"
        message="Pengumuman akan ditarik dari situs publik, dipindahkan ke tab Arsip, dan dapat diaktifkan kembali sewaktu-waktu."
        confirmText="Arsipkan"
        cancelText="Batal"
        onConfirm={handleArchive}
        onCancel={() => setArchiveModal({ isOpen: false, id: null })}
      />

      {/* Reactivate Modal */}
      {reactivateModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isActionSubmitting && setReactivateModal({ isOpen: false, id: null, expiredAt: '', error: null })}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-navy-800">Aktifkan Kembali</h3>
              <button
                type="button"
                disabled={isActionSubmitting}
                onClick={() => setReactivateModal({ isOpen: false, id: null, expiredAt: '', error: null })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReactivateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Berakhir <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="date"
                  value={reactivateModal.expiredAt}
                  min={getTomorrowLocalDateString()}
                  onChange={(e) =>
                    setReactivateModal((prev) => ({ ...prev, expiredAt: e.target.value, error: null }))
                  }
                  disabled={isActionSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 text-sm disabled:opacity-50"
                />
                <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                  Kosongkan jika tanpa tanggal berakhir
                </p>
                {reactivateModal.error && (
                  <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                    {reactivateModal.error}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={isActionSubmitting}
                  onClick={() => setReactivateModal({ isOpen: false, id: null, expiredAt: '', error: null })}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isActionSubmitting}
                  className="flex-1 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isActionSubmitting ? 'Mengaktifkan...' : 'Aktifkan Kembali'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Archived Only & super_admin only) */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Hapus Permanen Pengumuman"
        message="Pengumuman akan dihapus secara permanen beserta gambarnya dari Cloudinary. Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Permanen"
        cancelText="Batal"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: null })}
        danger
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
