'use client';

import { useState, useEffect } from 'react';
import { ImageGallery } from './image-gallery';
import { ArchiveGallery } from './archive-gallery';
import { Calendar, Image as ImageIcon } from 'lucide-react';
import { getFeaturedVideo, FeaturedVideo } from '@/lib/api';

interface GalleryPhoto {
  id: number;
  src: string;
  alt: string;
  caption: string | null;
  gallery?: {
    id: number;
    title: string;
  };
  created_at: string;
}

interface Archive {
  date: string;
  formatted_date: string;
  title: string;
  description: string;
  galleries_count: number;
  photos: GalleryPhoto[];
  photos_count: number;
}

interface GalleryTabsProps {
  recentPhotos: GalleryPhoto[];
  archives: Archive[];
  autoScroll?: boolean;
  scrollSpeed?: number;
}

export default function GalleryTabs({ recentPhotos, archives, autoScroll = true, scrollSpeed = 30 }: GalleryTabsProps) {
  const [activeSection, setActiveSection] = useState<'recent' | 'archives'>('recent');
  const [featuredVideo, setFeaturedVideo] = useState<FeaturedVideo | null>(null);

  useEffect(() => {
    getFeaturedVideo().then((res) => {
      if (res.success && res.data) {
        setFeaturedVideo(res.data);
      }
    });
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-navy-900 pt-24 pb-14 md:pt-28 md:pb-20 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-navy-500/30 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-gold-500 text-sm font-semibold mb-4 uppercase tracking-wider">
              <span className="w-8 h-px bg-gold-500" />
              Dokumentasi
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Galeri Kegiatan
            </h1>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed">
              Dokumentasi foto seluruh kegiatan Karang Taruna Armalo Eluf
            </p>
          </div>
        </div>
      </section>

      {/* Main Content - Sticky Context Wrapper */}
      <div className="bg-white">
        {/* Sticky Tabs - inline style untuk fix */}
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 py-3 -mx-4 px-4 sm:mx-0 sm:px-0">
              <button
                onClick={() => setActiveSection('recent')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                  activeSection === 'recent'
                    ? 'bg-navy-800 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Foto Terbaru
              </button>
              <button
                onClick={() => setActiveSection('archives')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                  activeSection === 'archives'
                    ? 'bg-navy-800 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Arsip Album
              </button>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeSection === 'recent' ? (
          <ImageGallery
            photos={recentPhotos}
            title="Foto Terbaru"
            subtitle="Kumpulan foto terbaru dari berbagai kegiatan"
            autoScroll={autoScroll}
            scrollSpeed={scrollSpeed}
            featuredVideo={featuredVideo}
          />
        ) : (
          <ArchiveGallery
            archives={archives}
            title="Arsip Album"
            subtitle="Dokumentasi kegiatan berdasarkan tanggal"
            filterDate={null}
          />
        )}

        {/* Navigation Section */}
        <section className="py-10 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-3 px-5 py-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <span className="text-gray-500 text-sm">Lihat juga:</span>
              <button
                onClick={() => setActiveSection(activeSection === 'recent' ? 'archives' : 'recent')}
                className="text-gold-600 hover:text-gold-700 text-sm font-medium transition-colors"
              >
                {activeSection === 'recent' ? 'Arsip Album' : 'Foto Terbaru'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}