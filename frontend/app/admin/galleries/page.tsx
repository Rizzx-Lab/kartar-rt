'use client';

import { useState, useEffect } from 'react';
import { getGalleries, createGallery, updateGallery, deleteGallery, getGalleryPhotos, addGalleryPhotos, deleteGalleryPhoto, uploadFeaturedVideo, deleteFeaturedVideo } from '@/lib/admin-api';

interface AdminGalleryPhoto {
  id: number;
  file_path: string;
  caption: string | null;
}

interface AdminGallery {
  id: number;
  title: string;
  description: string | null;
  is_published: boolean;
  created_at: string;
  photos: AdminGalleryPhoto[];
}

interface GalleryFormData {
  title: string;
  description: string;
  is_published: boolean;
}

interface FeaturedVideo {
  id: number;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  duration: number;
  file_size: number;
  is_portrait: boolean;
  expires_at: string;
  created_at: string;
  uploader: { id: number; name: string } | null;
}

// Helper function for image URL
const getImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `http://localhost:8000/storage/${path}`;
};

export default function AdminGalleriesPage() {
  const [galleries, setGalleries] = useState<AdminGallery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingGallery, setEditingGallery] = useState<AdminGallery | null>(null);
  const [viewingGallery, setViewingGallery] = useState<AdminGallery | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<AdminGalleryPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [formData, setFormData] = useState<GalleryFormData>({
    title: '',
    description: '',
    is_published: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const itemsPerPage = 6;

  // Featured video state
  const [featuredVideo, setFeaturedVideo] = useState<FeaturedVideo | null>(null);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [videoTitle, setVideoTitle] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isLandscape, setIsLandscape] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [deletingVideo, setDeletingVideo] = useState(false);

  // Load galleries on mount
  useEffect(() => {
    fetchGalleries();
    fetchFeaturedVideo();
  }, []);

  // Auto scroll & scroll lock when modals open
  useEffect(() => {
    if (showModal || showViewModal) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Unlock body scroll
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal, showViewModal]);

  // Reset scroll when viewing gallery changes
  useEffect(() => {
    if (showViewModal) {
      const modalContent = document.getElementById('gallery-modal-content');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    }
  }, [showViewModal, viewingGallery?.id]);

  const fetchGalleries = async () => {
    setIsLoading(true);
    const response = await getGalleries();
    if (response.success && response.data) {
      setGalleries(response.data);
    }
    setIsLoading(false);
  };

  const fetchGalleryPhotos = async (galleryId: number) => {
    setLoadingPhotos(true);
    const response = await getGalleryPhotos(galleryId);
    if (response.success && response.data) {
      setGalleryPhotos(response.data);
    }
    setLoadingPhotos(false);
  };

  const fetchFeaturedVideo = async () => {
    setLoadingFeatured(true);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/featured-video`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const data = await res.json();
      if (data.success && data.data) {
        setFeaturedVideo(data.data);
      } else {
        setFeaturedVideo(null);
      }
    } catch {
      setFeaturedVideo(null);
    }
    setLoadingFeatured(false);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Client-side validation: file type
    const allowedTypes = ['video/mp4', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Format video tidak didukung. Gunakan MP4 atau MOV.');
      return;
    }

    // Client-side validation: file size (50 MB)
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('Ukuran video terlalu besar. Maksimal 50 MB.');
      return;
    }

    setSelectedVideo(file);
    setVideoPreview(URL.createObjectURL(file));

    // Detect landscape vs portrait by reading video metadata
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      setIsLandscape(video.videoWidth > video.videoHeight);
      URL.revokeObjectURL(video.src);
    };
    video.src = URL.createObjectURL(file);
  };

  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVideo || !videoTitle.trim()) {
      setUploadError('Judul dan video harus diisi.');
      return;
    }

    setUploadingVideo(true);
    setUploadError(null);

    const form = new FormData();
    form.append('title', videoTitle.trim());
    form.append('video', selectedVideo);

    const response = await uploadFeaturedVideo(form);

    if (response.success) {
      setFeaturedVideo(response.data);
      setVideoTitle('');
      setSelectedVideo(null);
      setVideoPreview(null);
      setIsLandscape(false);
    } else {
      setUploadError(response.message || 'Gagal mengupload video.');
    }
    setUploadingVideo(false);
  };

  const handleDeleteVideo = async () => {
    if (!confirm('Hapus video featured ini? Tindakan ini tidak dapat dibatalkan.')) return;

    setDeletingVideo(true);
    const response = await deleteFeaturedVideo();
    if (response.success) {
      setFeaturedVideo(null);
    } else {
      alert(response.message || 'Gagal menghapus video.');
    }
    setDeletingVideo(false);
  };

  const openCreateModal = () => {
    setEditingGallery(null);
    setFormData({ title: '', description: '', is_published: true });
    setShowModal(true);
  };

  const openEditModal = (gallery: AdminGallery) => {
    setEditingGallery(gallery);
    setFormData({
      title: gallery.title,
      description: gallery.description || '',
      is_published: gallery.is_published,
    });
    setShowModal(true);
  };

  const openViewModal = async (gallery: AdminGallery) => {
    setViewingGallery(gallery);
    setShowViewModal(true);
    await fetchGalleryPhotos(gallery.id);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingGallery(null);
    setGalleryPhotos([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = new FormData();
    form.append('title', formData.title);
    form.append('description', formData.description);
    form.append('is_published', formData.is_published ? '1' : '0');

    let response;
    if (editingGallery) {
      response = await updateGallery(editingGallery.id, form);
    } else {
      response = await createGallery(form);
    }

    setIsSubmitting(false);
    if (response.success) {
      setShowModal(false);
      fetchGalleries();
    } else {
      alert(response.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus galeri beserta foto?')) {
      const response = await deleteGallery(id);
      if (response.success) {
        fetchGalleries();
        if (viewingGallery?.id === id) {
          closeViewModal();
        }
      } else {
        alert(response.message || 'Gagal menghapus');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleUploadPhotos = async () => {
    if (!viewingGallery || selectedFiles.length === 0) return;

    setUploadingPhotos(true);
    const form = new FormData();
    selectedFiles.forEach(file => {
      form.append('photos[]', file);
    });

    const response = await addGalleryPhotos(viewingGallery.id, form);
    if (response.success) {
      setSelectedFiles([]);
      await fetchGalleryPhotos(viewingGallery.id);
      fetchGalleries();
    } else {
      alert(response.message || 'Gagal upload foto');
    }
    setUploadingPhotos(false);
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (confirm('Hapus foto ini?')) {
      const response = await deleteGalleryPhoto(photoId);
      if (response.success) {
        setGalleryPhotos(prev => prev.filter(p => p.id !== photoId));
        fetchGalleries();
      }
    }
  };

  const filtered = galleries.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Galeri Foto</h1>
          <p className="text-gray-500 text-sm">Kelola dokumentasi foto kegiatan</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-medium rounded-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Galeri
        </button>
      </div>

      {/* Featured Video Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.901L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-navy-800">Video Featured</h2>
              <p className="text-xs text-gray-500">Tayang otomatis selama 7 hari</p>
            </div>
          </div>
          {featuredVideo && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              ● Aktif
            </span>
          )}
        </div>

        {/* Active video display */}
        {loadingFeatured ? (
          <div className="flex gap-4">
            <div className="w-40 h-24 bg-gray-200 animate-pulse rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
              <div className="h-3 bg-gray-200 animate-pulse rounded w-1/3" />
            </div>
          </div>
        ) : featuredVideo ? (
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              {featuredVideo.thumbnail_url && (
                <img
                  src={featuredVideo.thumbnail_url}
                  alt={featuredVideo.title}
                  className="w-40 h-24 object-cover rounded-lg shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-navy-800 truncate">{featuredVideo.title}</h3>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {Math.floor(featuredVideo.duration / 60)}:{String(featuredVideo.duration % 60).padStart(2, '0')}
                  </span>
                  <span>{(featuredVideo.file_size / 1024 / 1024).toFixed(1)} MB</span>
                  {!featuredVideo.is_portrait && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.83L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.17c-.77 1.667.192 2.83 1.732 2.83z" />
                      </svg>
                      Landscape
                    </span>
                  )}
                  <span>
                    Kadaluarsa: {new Date(featuredVideo.expires_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
              <button
                onClick={handleDeleteVideo}
                disabled={deletingVideo}
                className="shrink-0 px-3 py-1.5 text-sm text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {deletingVideo ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Belum ada video featured aktif.</p>
        )}

        {/* Upload Form */}
        <form onSubmit={handleUploadVideo} className="mt-5 pt-5 border-t border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul Video <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                required
                placeholder="Contoh: Momen Seru Kegiatan Baksos"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                disabled={uploadingVideo}
              />
            </div>

            {/* File picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Video <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="video/mp4,video/quicktime"
                  onChange={handleVideoSelect}
                  className="hidden"
                  id="video-upload-input"
                  disabled={uploadingVideo}
                />
                <label
                  htmlFor="video-upload-input"
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer text-sm transition-colors disabled:opacity-50"
                >
                  {selectedVideo ? 'Ganti Video' : 'Pilih Video'}
                </label>
                {selectedVideo && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-600 truncate max-w-44">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="truncate">{selectedVideo.name}</span>
                    <span className="text-gray-400 shrink-0">
                      ({(selectedVideo.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Landscape warning */}
          {selectedVideo && isLandscape && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.83L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.17c-.77 1.667.192 2.83 1.732 2.83z" />
              </svg>
              <span>
                Video ini horizontal (landscape). Tampilan terbaik adalah video vertikal (portrait). Video landscape tetap dapat diupload.
              </span>
            </div>
          )}

          {/* Video preview */}
          {videoPreview && (
            <div className="relative w-full max-w-xs rounded-lg overflow-hidden bg-black">
              <video
                src={videoPreview}
                controls
                className="w-full max-h-48"
                muted
                onLoadedMetadata={() => URL.revokeObjectURL(videoPreview)}
              />
            </div>
          )}

          {/* Error message */}
          {uploadError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {uploadError}
            </div>
          )}

          {/* Upload button */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={uploadingVideo || !selectedVideo || !videoTitle.trim()}
              className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {uploadingVideo ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                  </svg>
                  Mengupload...
                </span>
              ) : 'Upload Video'}
            </button>
            {(selectedVideo || videoTitle) && !uploadingVideo && (
              <button
                type="button"
                onClick={() => {
                  setSelectedVideo(null);
                  setVideoPreview(null);
                  setVideoTitle('');
                  setUploadError(null);
                  setIsLandscape(false);
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Batal
              </button>
            )}
            <span className="text-xs text-gray-400">MP4 / MOV · Maks 50 MB · 3 menit</span>
          </div>
        </form>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <input
          type="text"
          placeholder="Cari galeri..."
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
      ) : paginated.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map((gallery) => (
            <div key={gallery.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
              {/* Cover Photo */}
              <div className="relative h-36 bg-gray-100">
                {gallery.photos && gallery.photos.length > 0 ? (
                  <img
                    src={getImageUrl(gallery.photos[0].file_path) || ''}
                    alt={gallery.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l4.586-4.586a2 2 0 012.828 0M8 12h.01M12 16l4.586-4.586a2 2 0 012.828 0M16 12h.01M8 8h.01M12 12l.01-.01M6.01 11.01L18 6.01" />
                    </svg>
                  </div>
                )}
                <span className="absolute top-3 right-3 bg-white/90 px-2 py-1 text-xs text-gray-700 rounded">
                  {(gallery as any).photos_count || 0} foto
                </span>
                {gallery.is_published && (
                  <span className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 text-xs rounded">
                    Published
                  </span>
                )}
              </div>
              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-navy-800">{gallery.title}</h3>
                <p className="text-xs text-gray-500 mb-3">
                  {new Date(gallery.created_at).toLocaleDateString('id-ID')}
                </p>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openViewModal(gallery)}
                    className="flex-1 px-3 py-2 text-sm text-navy-700 hover:bg-gray-100 rounded-lg text-center"
                  >
                    Lihat
                  </button>
                  <button
                    onClick={() => openEditModal(gallery)}
                    className="flex-1 px-3 py-2 text-sm text-gold-600 hover:bg-gold-50 rounded-lg text-center"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(gallery.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m7-3V5a2 2 0 00-2-2h3.5a2 2 0 012-2h3.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m2-2l4.586-4.586a2 2 0 012.828 0M8 12h.01M12 16l4.586-4.586a2 2 0 012.828 0M16 12h.01M8 8h.01M12 12l.01-.01M6.01 11.01L18 6.01" />
          </svg>
          <p className="text-gray-500">Belum ada galeri. Upload foto pertama.</p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-medium rounded-lg"
          >
            Tambah Galeri
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-white rounded-lg shadow-sm disabled:opacity-50"
          >
            ←
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-white rounded-lg shadow-sm disabled:opacity-50"
          >
            →
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy-800">
                {editingGallery ? 'Edit Galeri' : 'Tambah Galeri Baru'}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500"
                  placeholder="Contoh: Halal Bihalal 2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 resize-none"
                  placeholder="Deskripsi galeri..."
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 accent-gold-500"
                />
                <span className="text-sm text-gray-700">Published</span>
              </label>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 font-medium rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeViewModal} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy-800">{viewingGallery.title}</h3>
              <button onClick={closeViewModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]" id="gallery-modal-content">
              {viewingGallery.description && (
                <p className="text-gray-600 mb-4">{viewingGallery.description}</p>
              )}
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Upload Foto Baru</h4>
                <div className="flex gap-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer text-sm"
                  >
                    Pilih Foto
                  </label>
                  {selectedFiles.length > 0 && (
                    <button
                      onClick={handleUploadPhotos}
                      disabled={uploadingPhotos}
                      className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 rounded-lg text-sm disabled:opacity-50"
                    >
                      {uploadingPhotos ? 'Mengupload...' : `Upload ${selectedFiles.length} foto`}
                    </button>
                  )}
                </div>
              </div>
              {loadingPhotos ? (
                <div className="grid grid-cols-4 gap-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded" />
                  ))}
                </div>
              ) : galleryPhotos.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {galleryPhotos.map((photo) => (
                    <div key={photo.id} className="relative group aspect-square">
                      <img
                        src={getImageUrl(photo.file_path) || ''}
                        alt={photo.caption || 'Photo'}
                        className="w-full h-full object-cover rounded"
                      />
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Belum ada foto. Upload foto pertama.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}