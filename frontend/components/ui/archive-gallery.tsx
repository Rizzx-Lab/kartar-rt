'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useInView, motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Calendar, Image as ImageIcon } from 'lucide-react';

interface ArchivePhoto {
  id: number;
  src: string;
  alt: string;
  caption?: string | null;
}

interface ArchiveItem {
  date: string;
  formatted_date: string;
  title: string;
  description: string;
  galleries_count: number;
  photos: ArchivePhoto[];
  photos_count: number;
}

interface ArchiveGalleryProps {
  archives: ArchiveItem[];
  title?: string;
  subtitle?: string;
  filterDate?: string | null;
}

export function ArchiveGallery({ archives, title, subtitle, filterDate }: ArchiveGalleryProps) {
  // Filter archives if filterDate is provided
  const filteredArchives = filterDate
    ? archives.filter(archive => archive.date === filterDate)
    : archives;

  return (
    <section className="py-12 md:py-14 bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"
      >
        <div className="text-center">
          {title && (
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl font-bold text-navy-800"
            >
              {title}
            </motion.h2>
          )}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-gray-600 text-sm md:text-base max-w-2xl mx-auto"
            >
              {subtitle}
            </motion.p>
          )}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-12 h-0.5 bg-gradient-to-r from-gold-500 to-gold-300 mx-auto mt-4 rounded origin-center"
          />
        </div>
      </motion.div>

      {/* Archive List */}
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-100px' }}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5"
      >
        {filteredArchives.map((archive, index) => (
          <motion.div
            key={archive.date}
            variants={{
              hidden: { opacity: 0, y: 30 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
            }}
          >
            <ArchiveItem
              archive={archive}
              index={index}
              isFiltered={!!filterDate}
            />
          </motion.div>
        ))}

        {filteredArchives.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center py-12 bg-white rounded-xl"
          >
            {filterDate ? (
              <>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                </motion.div>
                <p className="text-gray-500">Tidak ada dokumentasi untuk tanggal tersebut.</p>
                <p className="text-gray-400 text-sm mt-1">Mungkin belum ada foto yang diupload untuk acara ini.</p>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                </motion.div>
                <p className="text-gray-500">Belum ada arsip galeri.</p>
              </>
            )}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

interface ArchiveItemProps {
  archive: ArchiveItem;
  index: number;
  isFiltered?: boolean;
}

function ArchiveItem({ archive, index, isFiltered }: ArchiveItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });
  const [isExpanded, setIsExpanded] = useState(isFiltered); // Auto-expand if filtered

  useEffect(() => {
    if (isFiltered) {
      setIsExpanded(true);
    }
  }, [isFiltered]);

  const delay = index * 100;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ delay: delay / 1000, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100',
        'transition-all duration-500',
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      )}
    >
      {/* Date Header - Always visible */}
      <motion.button
        whileHover={{ backgroundColor: 'rgb(249, 250, 251)' }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          'w-full px-5 py-4 flex items-center gap-4',
          'hover:bg-gray-50 transition-colors text-left'
        )}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        {/* Date Badge */}
        <motion.div
          whileHover={{ scale: 1.05, rotate: -2 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="shrink-0 w-14 h-14 bg-navy-800 rounded-lg flex flex-col items-center justify-center"
        >
          <span className="text-gold-400 text-xs font-medium uppercase">
            {new Date(archive.date).toLocaleDateString('id-ID', { month: 'short' })}
          </span>
          <span className="text-white text-lg font-bold leading-none">
            {new Date(archive.date).getDate()}
          </span>
        </motion.div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-navy-800 truncate">
            {archive.title}
          </h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {archive.formatted_date}
            </span>
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              {archive.photos_count} foto
            </span>
          </div>
        </div>

        {/* Expand/Collapse Icon */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </motion.button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-gray-100">
              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-4 text-sm text-gray-600 leading-relaxed"
              >
                {archive.description}
              </motion.p>

              {/* Photo Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2"
              >
                {archive.photos.map((photo, photoIndex) => (
                  <ArchivePhotoItem
                    key={photo.id}
                    photo={photo}
                    index={photoIndex}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface ArchivePhotoItemProps {
  photo: ArchivePhoto;
  index: number;
}

function ArchivePhotoItem({ photo, index }: ArchivePhotoItemProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div
      className={cn(
        'relative aspect-square overflow-hidden rounded-lg cursor-pointer',
        'transition-opacity duration-200'
      )}
      style={{ transitionDelay: `${index * 30}ms` }}
    >
      {/* Placeholder */}
      <div
        className={cn(
          'absolute inset-0 bg-gray-100 transition-opacity duration-200',
          isLoading ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Image */}
      <img
        src={photo.src}
        alt={photo.alt}
        className={cn(
          'w-full h-full object-cover',
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setIsLoading(false)}
        loading="lazy"
      />
    </div>
  );
}

// Loading Skeleton
export function ArchiveGallerySkeleton() {
  return (
    <section className="py-12 md:py-14 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="text-center">
          <div className="h-7 w-40 bg-gray-200 animate-pulse rounded mx-auto mb-3" />
          <div className="h-4 w-64 bg-gray-200 animate-pulse rounded mx-auto mb-4" />
          <div className="h-0.5 w-12 bg-gray-200 animate-pulse rounded mx-auto" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-200 animate-pulse rounded-lg" />
              <div className="flex-1">
                <div className="h-5 w-48 bg-gray-200 animate-pulse rounded mb-2" />
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}