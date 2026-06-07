'use client';

import { useState } from 'react';
import { ImageGallery } from './image-gallery';
import { ArchiveGallery } from './archive-gallery';
import { Calendar, Image as ImageIcon } from 'lucide-react';

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

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 bg-navy-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Galeri Kegiatan
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto">
            Dokumentasi foto seluruh kegiatan Karang Taruna Armalo Eluf
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-white">
        {/* Section Tabs */}
        <section className="sticky top-18 z-40 bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 py-3">
              <button
                onClick={() => setActiveSection('recent')}
                className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
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
                className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
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
        </section>

        {/* Content based on active tab */}
        {activeSection === 'recent' ? (
          <ImageGallery
            photos={recentPhotos}
            title="Foto Terbaru"
            subtitle="Kumpulan foto terbaru dari berbagai kegiatan"
            autoScroll={autoScroll}
            scrollSpeed={scrollSpeed}
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