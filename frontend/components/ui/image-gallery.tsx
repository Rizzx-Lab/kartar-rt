'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn } from 'lucide-react';
import { Lightbox } from './lightbox';
import type { FeaturedVideo } from '@/lib/api';

interface Photo {
  id: number;
  src: string;
  alt: string;
  caption?: string | null;
  aspect_ratio?: number;
  gallery?: {
    id: number;
    title: string;
  };
  created_at?: string;
}

interface ImageGalleryProps {
  photos: Photo[];
  title?: string;
  subtitle?: string;
  autoScroll?: boolean;
  scrollSpeed?: number;
  featuredVideo?: FeaturedVideo | null;
}

export function ImageGallery({ photos, title, subtitle, autoScroll = true, scrollSpeed = 30, featuredVideo }: ImageGalleryProps) {
  // Only enable auto scroll if photos >= 3
  const shouldAutoScroll = autoScroll && photos.length >= 3;

  return (
    <section className="py-12 md:py-14">
      {/* Header */}
      {(title || subtitle) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"
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
      )}

      {/* Animated Gallery Grid - 3 columns like testimonials */}
      <AnimatedGalleryGrid photos={photos} scrollSpeed={scrollSpeed} shouldAutoScroll={shouldAutoScroll} featuredVideo={featuredVideo} />
    </section>
  );
}

// Animated Gallery Grid - Similar to testimonials scrolling
function AnimatedGalleryGrid({
  photos,
  scrollSpeed = 30,
  shouldAutoScroll = true,
  featuredVideo,
}: {
  photos: Photo[];
  scrollSpeed?: number;
  shouldAutoScroll?: boolean;
  featuredVideo?: FeaturedVideo | null;
}) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Only show the pinned video column when the video is fully processed
  // (i.e., video_url is available). A processing video has no URL yet and should
  // fall through to the normal 3-column photo layout.
  const hasVideo = !!featuredVideo?.video_url;

  // When featured video is active, split photos into 2 side columns only (center is video)
  const sidePhotos = hasVideo ? photos : photos;
  const column1 = sidePhotos.filter((_, i) => i % (hasVideo ? 2 : 3) === 0);
  const column2 = sidePhotos.filter((_, i) => i % (hasVideo ? 2 : 3) === (hasVideo ? 1 : 1));
  const column3 = hasVideo ? [] : sidePhotos.filter((_, i) => i % 3 === 2);

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowLightbox(true);
  };

  const scrollDuration = Math.max(20, Math.min(scrollSpeed, 60));
  const slowClass = 'animate-scroll-gallery-up-slow';
  const normalClass = 'animate-scroll-gallery-up';
  const mediumClass = 'animate-scroll-gallery-up-medium';

  return (
    <>
      {/* ===================== DESKTOP LAYOUT (lg+) ===================== */}
      {/* Side-by-side columns: video + photo columns */}
      <div className="hidden lg:flex justify-center items-start gap-4 px-4 lg:px-8 max-w-6xl mx-auto">
        {/* Left photo column */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-72 shrink-0 overflow-hidden"
        >
          <div
            className={`flex flex-col gap-4 ${shouldAutoScroll ? normalClass : ''}`}
            style={shouldAutoScroll ? { animationDuration: `${scrollDuration}s` } : undefined}
          >
            {[...column1, ...column1].map((photo, idx) => (
              <AnimatedGalleryItem
                key={`col1-${photo.id}-${idx}`}
                photo={photo}
                onClick={() => handlePhotoClick(photo)}
              />
            ))}
          </div>
        </motion.div>

        {/* Center: video or photo column 2 */}
        {hasVideo ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-72 shrink-0 overflow-hidden"
          >
            {/* Video Container - Fixed max height */}
            <div
              className="relative bg-black/5 rounded-xl overflow-hidden"
              style={{ maxHeight: '70vh' }}
            >
              <video
                src={featuredVideo.video_url ?? undefined}
                autoPlay
                controls
                muted
                playsInline
                loop
                preload="metadata"
                className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
                title={featuredVideo.title}
              />
            </div>
            {featuredVideo.title && (
              <div className="mt-3 px-1">
                <p className="text-sm font-medium text-navy-800 truncate">{featuredVideo.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {Math.floor(featuredVideo.duration / 60)}:{String(featuredVideo.duration % 60).padStart(2, '0')} · Featured Video
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-72 shrink-0 overflow-hidden"
          >
            <div
              className={`flex flex-col gap-4 ${shouldAutoScroll ? slowClass : ''}`}
              style={shouldAutoScroll ? { animationDuration: `${scrollDuration}s` } : undefined}
            >
              {[...column2, ...column2].map((photo, idx) => (
                <AnimatedGalleryItem
                  key={`col2-${photo.id}-${idx}`}
                  photo={photo}
                  onClick={() => handlePhotoClick(photo)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Right photo column */}
        {hasVideo ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-72 shrink-0 overflow-hidden"
          >
            <div
              className={`flex flex-col gap-4 ${shouldAutoScroll ? slowClass : ''}`}
              style={shouldAutoScroll ? { animationDuration: `${scrollDuration}s` } : undefined}
            >
              {[...column1, ...column1].map((photo, idx) => (
                <AnimatedGalleryItem
                  key={`col3-${photo.id}-${idx}`}
                  photo={photo}
                  onClick={() => handlePhotoClick(photo)}
                  medium
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-72 shrink-0 overflow-hidden"
          >
            <div
              className={`flex flex-col gap-4 ${shouldAutoScroll ? mediumClass : ''}`}
              style={shouldAutoScroll ? { animationDuration: `${scrollDuration}s` } : undefined}
            >
              {[...column3, ...column3].map((photo, idx) => (
                <AnimatedGalleryItem
                  key={`col3-${photo.id}-${idx}`}
                  photo={photo}
                  onClick={() => handlePhotoClick(photo)}
                  medium
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* ===================== MOBILE LAYOUT (< lg) ===================== */}
      {/* Video pinned at top (full width), scrolling photos below it */}
      <div className="lg:hidden flex flex-col items-center gap-6 px-4">
        {/* Video — always on top, full width */}
        {hasVideo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm shrink-0 overflow-hidden rounded-xl bg-black/5"
          >
            <div className="relative w-full" style={{ aspectRatio: '9/16' }}>
              <video
                src={featuredVideo.video_url ?? undefined}
                autoPlay
                controls
                muted
                playsInline
                loop
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover rounded-xl"
                title={featuredVideo.title}
              />
            </div>
            {featuredVideo.title && (
              <div className="mt-2 px-1">
                <p className="text-sm font-medium text-navy-800 truncate">{featuredVideo.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {Math.floor(featuredVideo.duration / 60)}:{String(featuredVideo.duration % 60).padStart(2, '0')} · Featured Video
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Scrolling photo gallery — below video on mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full flex justify-center"
          style={{
            maxHeight: '500px',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)',
            maskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)',
          }}
        >
          <div
            className={`w-full max-w-sm shrink-0 overflow-hidden ${shouldAutoScroll ? normalClass : ''}`}
            style={shouldAutoScroll ? { animationDuration: `${scrollDuration}s` } : undefined}
          >
            {[...photos, ...photos].map((photo, idx) => (
              <div key={`mobile-${photo.id}-${idx}`} className="mb-4">
                <AnimatedGalleryItem
                  photo={photo}
                  onClick={() => handlePhotoClick(photo)}
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ===================== NON-VIDEO MOBILE (< lg) ===================== */}
      {/* Photo-only mobile layout: 2 columns side by side */}
      {!hasVideo && (
        <div className="lg:hidden flex justify-center gap-3 px-4">
          {/* Column 1 */}
          <div
            className={`w-1/2 shrink-0 overflow-hidden ${shouldAutoScroll ? normalClass : ''}`}
            style={shouldAutoScroll ? { animationDuration: `${scrollDuration}s` } : undefined}
          >
            {[...column1, ...column1].map((photo, idx) => (
              <div key={`m-col1-${photo.id}-${idx}`} className="mb-3">
                <AnimatedGalleryItem
                  photo={photo}
                  onClick={() => handlePhotoClick(photo)}
                />
              </div>
            ))}
          </div>
          {/* Column 2 */}
          <div
            className={`w-1/2 shrink-0 overflow-hidden ${shouldAutoScroll ? slowClass : ''}`}
            style={shouldAutoScroll ? { animationDuration: `${scrollDuration}s` } : undefined}
          >
            {[...column2, ...column2].map((photo, idx) => (
              <div key={`m-col2-${photo.id}-${idx}`} className="mb-3">
                <AnimatedGalleryItem
                  photo={photo}
                  onClick={() => handlePhotoClick(photo)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {showLightbox && selectedPhoto && (
          <Lightbox
            image={{
              src: selectedPhoto.src,
              alt: selectedPhoto.alt,
              caption: selectedPhoto.caption ?? null,
              gallery_title: selectedPhoto.gallery?.title ?? null,
            }}
            onClose={() => setShowLightbox(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Individual animated gallery item
interface AnimatedGalleryItemProps {
  photo: Photo;
  onClick: () => void;
  slow?: boolean;
  medium?: boolean;
}

function AnimatedGalleryItem({ photo, onClick, slow, medium }: AnimatedGalleryItemProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Consistent aspect ratio based on index pattern
  const aspectRatio = photo.aspect_ratio || (Math.random() > 0.5 ? 0.75 : 1);

  return (
    <motion.div
      whileHover={{ scale: 1.02, zIndex: 10 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-xl cursor-pointer group"
      style={{ aspectRatio: aspectRatio === 0.75 ? '3/4' : '1/1' }}
    >
      {/* Image with fade in */}
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        src={photo.src}
        alt={photo.alt}
        className="w-full h-full object-cover"
        onLoad={() => setIsLoading(false)}
        loading="lazy"
      />

      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Hover overlay with zoom icon */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: isHovered ? 1 : 0.8 }}
          transition={{ duration: 0.2 }}
          className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
        >
          <ZoomIn className="w-6 h-6 text-white" />
        </motion.div>
      </motion.div>

      {/* Caption at bottom */}
      {(photo.caption || photo.gallery) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isHovered ? 1 : 0.8, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3"
        >
          {photo.gallery && (
            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-white/90 text-navy-800 rounded-full mb-1">
              {photo.gallery.title}
            </span>
          )}
          {photo.caption && (
            <p className="text-xs text-white/90 line-clamp-1">
              {photo.caption}
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// Loading Skeleton
export function ImageGallerySkeleton() {
  return (
    <section className="py-12 md:py-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.1 }}
            className="h-7 w-48 bg-gray-200 rounded mx-auto mb-3"
          />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2 }}
            className="h-4 w-72 bg-gray-200 rounded mx-auto mb-4"
          />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3 }}
            className="h-0.5 w-12 bg-gray-200 rounded mx-auto"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex justify-center gap-4 flex-wrap">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gray-200 animate-pulse rounded-lg"
              style={{ width: '150px', height: '150px' }}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}