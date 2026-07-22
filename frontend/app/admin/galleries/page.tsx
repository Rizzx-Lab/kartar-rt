'use client';

import { useState, useEffect } from 'react';
import { getGalleries, createGallery, updateGallery, deleteGallery, getGalleryPhotos, addGalleryPhotos, deleteGalleryPhoto, uploadFeaturedVideo, deleteFeaturedVideo } from '@/lib/admin-api';
import { ConfirmModal } from '@/components/ui/confirm-modal';

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
  video_url: string | null;
  thumbnail_url: string | null;
  duration: number;
  file_size: number;
  is_portrait: boolean;
  status: 'processing' | 'active' | 'failed';
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
  // Tracks a video that was just uploaded and is awaiting Cloudinary
  // transformation (status === 'processing'). Polled until it becomes 'active'.
  const [processingVideo, setProcessingVideo] = useState<FeaturedVideo | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isLandscape, setIsLandscape] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [deletingVideo, setDeletingVideo] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; type: 'gallery' | 'video' | 'photo'; id: number | null; title: string }>({
    isOpen: false,
    type: 'gallery',
    id: null,
    title: '',
  });

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

  // Create / revoke the preview blob URL whenever the selected file changes.
  // This useEffect owns the URL lifecycle — the <video> element must NOT call
  // URL.revokeObjectURL() itself, as that would kill the live blob URL on
  // every render (the onLoadedMetadata handler captures a stale videoPreview
  // value via closure and revokes the URL before the browser finishes loading it).
  useEffect(() => {
    if (!selectedVideo) {
      setVideoPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedVideo);
    setVideoPreview(objectUrl);

    // Revoke the blob URL when the file changes or the component unmounts.
    // This prevents blob URL leaks and ensures a fresh URL is created each time
    // a different file is selected.
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedVideo]);
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
        const v: FeaturedVideo = data.data;
        // If there's a processing video in-flight, keep tracking it.
        // The polling useEffect below will update it.
        setProcessingVideo(prev =>
          prev && prev.id === v.id && v.status === 'active' ? null : prev
        );
        setFeaturedVideo(v.status === 'active' ? v : null);
      } else {
        setFeaturedVideo(null);
        setProcessingVideo(null);
      }
    } catch {
      setFeaturedVideo(null);
    }
    setLoadingFeatured(false);
  };

  // Poll the public API every 10 seconds while a video is processing.
  // When status transitions to 'active', update featuredVideo and clear processingVideo.
  // If status becomes 'failed', show an error and clear processingVideo.
  useEffect(() => {
    if (!processingVideo) return;

    const interval = setInterval(async () => {
      const token = localStorage.getItem('admin_token');
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/featured-video`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        const data = await res.json();
        if (!data.success || !data.data) {
          clearInterval(interval);
          setProcessingVideo(null);
          setUploadError('Video gagal diproses oleh Cloudinary. Silakan upload ulang.');
          return;
        }

        const v: FeaturedVideo = data.data;

        if (v.status === 'active') {
          clearInterval(interval);
          setFeaturedVideo(v);
          setProcessingVideo(null);
        } else if (v.status === 'failed') {
          clearInterval(interval);
          setProcessingVideo(null);
          setUploadError('Video gagal diproses (durasi melebihi 3 menit atau error Cloudinary). Silakan upload ulang.');
        }
      } catch {
        // Network error — keep polling.
      }
    }, 10_000);

    return () => clearInterval(interval);
  }, [processingVideo]);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsLandscape(false);

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

    // Store the File object — the actual blob URL is created in a useEffect
    // (see below) so that it is created once per file, not on every render.
    setSelectedVideo(file);

    // Detect landscape vs portrait using a throwaway hidden <video> element.
    // This creates its own short-lived blob URL which is revoked immediately
    // after the metadata (width/height) is read — it does NOT touch the
    // preview blob URL stored in state.
    const detector = document.createElement('video');
    detector.preload = 'metadata';
    detector.onloadedmetadata = () => {
      setIsLandscape(detector.videoWidth > detector.videoHeight);
      detector.src = ''; // not strictly necessary but explicit
    };
    detector.src = URL.createObjectURL(file);
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
      const newVideo: FeaturedVideo = response.data;
      setProcessingVideo(newVideo);
      setFeaturedVideo(null); // hide any previously active video during processing
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
    setDeletingVideo(true);
    const response = await deleteFeaturedVideo();
    if (response.success) {
      setFeaturedVideo(null);
      setProcessingVideo(null);
    } else {
      alert(response.message || 'Gagal menghapus video.');
    }
    setDeletingVideo(false);
    setDeleteModal({ isOpen: false, type: 'video', id: null, title: '' });
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
    const response = await deleteGallery(id);
    if (response.success) {
      fetchGalleries();
      if (viewingGallery?.id === id) {
        closeViewModal();
      }
      setDeleteModal({ isOpen: false, type: 'gallery', id: null, title: '' });
    } else {
      alert(response.message || 'Gagal menghapus');
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
    const response = await deleteGalleryPhoto(photoId);
    if (response.success) {
      setGalleryPhotos(prev => prev.filter(p => p.id !== photoId));
      fetchGalleries();
      setDeleteModal({ isOpen: false, type: 'photo', id: null, title: '' });
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
          {processingVideo && (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              ● Processing
            </span>
          )}
        </div>

        {/* Active / Processing / Empty state */}
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
                onClick={() => setDeleteModal({ isOpen: true, type: 'video', id: featuredVideo.id, title: featuredVideo.title })}
                disabled={deletingVideo}
                className="shrink-0 px-3 py-1.5 text-sm text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {deletingVideo ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        ) : processingVideo ? (
          /* Processing state — video is transcoding on Cloudinary */
          <div className="space-y-3">
            <div className="flex gap-4 items-start">
              <div className="w-40 h-24 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-navy-800 truncate">{processingVideo.title}</h3>
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sedang diproses — video akan muncul otomatis
                </p>
              </div>
              <button
                onClick={() => setDeleteModal({ isOpen: true, type: 'video', id: processingVideo.id, title: processingVideo.title })}
                disabled={deletingVideo}
                className="shrink-0 px-3 py-1.5 text-sm text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {deletingVideo ? 'Menghapus...' : 'Batalkan'}
              </button>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1">
              <div className="bg-amber-400 h-1 rounded-full w-1/2 animate-pulse" />
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
                disabled={uploadingVideo || !!processingVideo}
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
                  disabled={uploadingVideo || !!processingVideo}
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
              disabled={uploadingVideo || !!processingVideo || !selectedVideo || !videoTitle.trim()}
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
                  setProcessingVideo(null);
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
                    onClick={() => setDeleteModal({ isOpen: true, type: 'gallery', id: gallery.id, title: gallery.title })}
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
                        onClick={() => setDeleteModal({ isOpen: true, type: 'photo', id: photo.id, title: '' })}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title={
          deleteModal.type === 'gallery' ? 'Hapus Galeri' :
          deleteModal.type === 'video' ? 'Hapus Video' :
          'Hapus Foto'
        }
        message={
          deleteModal.type === 'gallery' ? `Yakin ingin menghapus "${deleteModal.title}" beserta semua fotonya? Aksi ini tidak dapat dibatalkan.` :
          deleteModal.type === 'video' ? `Yakin ingin menghapus video "${deleteModal.title}"? Aksi ini tidak dapat dibatalkan.` :
          'Yakin ingin menghapus foto ini? Aksi ini tidak dapat dibatalkan.'
        }
        confirmText="Hapus"
        onConfirm={() => {
          if (deleteModal.type === 'video') {
            handleDeleteVideo();
          } else if (deleteModal.id) {
            handleDelete(deleteModal.id);
          }
        }}
        onCancel={() => setDeleteModal({ isOpen: false, type: 'gallery', id: null, title: '' })}
        danger
      />
    </div>
  );
}