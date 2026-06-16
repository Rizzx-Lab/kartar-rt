'use client';

import { useState, useEffect } from 'react';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/lib/admin-api';

interface Announcement {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  is_pinned: boolean;
  is_published: boolean;
  published_at: string;
  created_at: string;
}

interface FormData {
  title: string;
  content: string;
  excerpt: string;
  is_pinned: boolean;
  is_published: boolean;
  published_at: string;
}

async function triggerRevalidate() {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: '/pengumuman', tag: 'announcements' }),
    });
  } catch (revalidateError) {
    console.log('Revalidation failed, page will update in next ISR cycle');
  }
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    excerpt: '',
    is_pinned: false,
    is_published: true,
    published_at: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
      is_published: true,
      published_at: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const openEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content || '',
      excerpt: announcement.excerpt || '',
      is_pinned: announcement.is_pinned,
      is_published: announcement.is_published,
      published_at: announcement.published_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = {
      ...formData,
      published_at: formData.published_at,
    };

    let response;
    if (editingAnnouncement) {
      response = await updateAnnouncement(editingAnnouncement.id, data);
    } else {
      response = await createAnnouncement(data);
    }

    if (response.success) {
      setShowModal(false);
      fetchAnnouncements();
      await triggerRevalidate();
    } else {
      alert(response.message || 'Terjadi kesalahan');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus pengumuman ini?')) {
      const response = await deleteAnnouncement(id);
      if (response.success) {
        fetchAnnouncements();
        await triggerRevalidate();
      } else {
        alert(response.message || 'Gagal menghapus');
      }
    }
  };

  const filteredAnnouncements = announcements.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                    <svg className={`w-5 h-5 ${announcement.is_pinned ? 'text-navy-900' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24c0-1.104 1.118-1.94 2.117-1.855 2.478v1.268c-.063.534-.117 1.05-.154 1.54M5 12.14S17 11 17 11s-.755-.96-.755-1.861C16.245 9.568 15.763 9 15 9s-1.23.568-1.23.568S2 11 2 15s1.755 4.14 1.755 4.14" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {announcement.is_pinned && (
                        <span className="px-2 py-1 bg-gold-500/10 text-gold-600 text-xs font-medium rounded">
                          Disematkan
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
                        <button
                          onClick={() => openEditModal(announcement)}
                          className="px-3 py-1 text-sm text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(announcement.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m-7-3V5a2 2 0 012-2h3.5" />
                          </svg>
                        </button>
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
          <p className="text-gray-500">Belum ada pengumuman. Buat pengumuman pertama.</p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-medium rounded-lg"
          >
            Buat Pengumuman
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy-800">
                {editingAnnouncement ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formData.published_at}
                    onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={String(formData.is_published)}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  >
                    <option value="true">Published</option>
                    <option value="false">Draft</option>
                  </select>
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
    </div>
  );
}