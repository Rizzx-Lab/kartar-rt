'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Pin, Calendar } from 'lucide-react';
import { Lightbox } from './lightbox';

interface Announcement {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  is_pinned: boolean;
  published_at: string;
  image_url?: string | null;
}

interface AnnouncementCardProps {
  announcement: Announcement;
  variant: 'pinned' | 'regular';
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return {
    day: date.toLocaleDateString('id-ID', { day: 'numeric' }),
    month: date.toLocaleDateString('id-ID', { month: 'long' }),
  };
};

const formatFullDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export function AnnouncementCard({ announcement, variant }: AnnouncementCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const date = formatDate(announcement.published_at);
  const isPinned = variant === 'pinned';
  const hasImage = !!announcement.image_url;

  // For pinned announcements with an image: show image immediately (poster-style)
  // The image is the primary content and should be visible right away
  const showImageImmediately = isPinned && hasImage;

  // Open lightbox on image click
  const openLightbox = () => {
    if (announcement.image_url) {
      setLightboxImage({ src: announcement.image_url, alt: announcement.title });
    }
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Remove `layout` prop here — it triggers framer-motion layout recalculations
            that break the root AnimatePresence's exit animation choreography via mode="wait",
            causing the PageTransition motion.div to get stuck at initial state (opacity: 0)
            when navigating away from this page. Since this motion.div has no layoutId sibling,
            layout tracking is unnecessary. */}
        <div
          className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
            isPinned ? 'bg-white border-l-4 border-gold-500' : 'bg-white'
          } ${showImageImmediately ? 'md:max-w-3xl md:mx-auto' : ''}`}
        >
          {/* Poster-style image for pinned announcements — always visible, click to lightbox */}
          {showImageImmediately && (
            <div
              className="relative cursor-zoom-in"
              onClick={openLightbox}
              title="Klik untuk memperbesar"
            >
              <img
                src={announcement.image_url!}
                alt={announcement.title}
                className="w-full max-h-[600px] object-contain rounded-t-xl"
              />
              {/* Subtle zoom hint overlay on hover */}
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-black/10 flex items-center justify-center rounded-t-xl">
                <div className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                  Klik untuk memperbesar
                </div>
              </div>
            </div>
          )}

          {/* Clickable Header */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full p-5 text-left ${showImageImmediately ? 'pt-4' : ''}`}
          >
            <div className="flex items-center gap-4">
              {/* Date Badge */}
              <div className={`rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                isPinned ? 'w-14 h-14 bg-gold-500/10' : 'w-12 h-12 bg-navy-100'
              }`}>
                <span className={`font-bold leading-none ${isPinned ? 'text-2xl text-gold-600' : 'text-lg text-navy-800'}`}>
                  {date.day}
                </span>
                <span className={`text-xs font-medium ${isPinned ? 'text-gold-600' : 'text-navy-600 uppercase'}`}>
                  {date.month}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {isPinned && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gold-500/10 text-gold-600 text-xs font-semibold rounded-full">
                      <Pin className="w-3 h-3" />
                      Disematkan
                    </span>
                  </div>
                )}
                <h3 className={`font-semibold text-navy-900 line-clamp-1 mb-1 ${isPinned ? 'text-lg' : ''}`}>
                  {announcement.title}
                </h3>
                {announcement.excerpt && (
                  <p className="text-gray-500 text-sm line-clamp-1">
                    {announcement.excerpt}
                  </p>
                )}
              </div>

              {/* Expand Icon */}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isExpanded ? 'bg-gold-500' : 'bg-gray-100'
                }`}
              >
                <ChevronDown className={`w-4 h-4 ${isExpanded ? 'text-navy-900' : 'text-gray-400'}`} />
              </motion.div>
            </div>
          </button>

          {/* Expanded Content (text and additional info — image is already shown above for pinned) */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                <Calendar className="w-3 h-3" />
                {formatFullDate(announcement.published_at)}
              </p>

              {/* Image — only for non-pinned announcements (pinned shows image above), click to lightbox */}
              {!showImageImmediately && hasImage && (
                <div className="mb-4">
                  <img
                    src={announcement.image_url!}
                    alt={announcement.title}
                    className="w-full h-48 object-cover rounded-lg cursor-zoom-in"
                    onClick={openLightbox}
                    title="Klik untuk memperbesar"
                  />
                </div>
              )}

              {announcement.content ? (
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  <p className="whitespace-pre-wrap">{announcement.content}</p>
                </div>
              ) : announcement.excerpt ? (
                // List-mode API responses (homepage, /pengumuman list) don't include content —
                // fall back to excerpt so session-generated announcements still show content.
                // excerpt is already populated with the session description (or manual excerpt).
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                  <p className="whitespace-pre-wrap">{announcement.excerpt}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic text-sm">Tidak ada detail pengumuman.</p>
              )}
            </div>
          </motion.div>

          {/* Image indicator when collapsed — only for regular (non-pinned) announcements with images */}
          {!showImageImmediately && hasImage && !isExpanded && (
            <div className="px-5 pb-3 -mt-2">
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Ada poster
              </span>
            </div>
          )}
        </div>
      </motion.article>

      {/* Lightbox */}
      <Lightbox
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </>
  );
}
