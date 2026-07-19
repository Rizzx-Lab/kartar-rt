'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';

interface LightboxImage {
  src: string;
  alt: string;
  caption?: string | null;
  gallery_title?: string | null;
}

interface LightboxProps {
  image: LightboxImage | null;
  onClose: () => void;
}

/**
 * Shared lightbox component.
 * - Dim overlay, image centered with object-contain + max viewport fit
 * - Close on background click, X button, or Escape key
 * - Reused by ImageGallery, AnnouncementCard, and homepage preview cards
 */
export function Lightbox({ image, onClose }: LightboxProps) {
  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
          onClick={onClose}
        >
          {/* Close Button */}
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white z-10"
            aria-label="Tutup"
          >
            <X className="w-6 h-6" />
          </motion.button>

          {/* Zoom hint */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="absolute top-4 left-4 flex items-center gap-2 text-white/50 text-xs"
          >
            <ZoomIn className="w-4 h-4" />
            Klik untuk memperbesar / ESC untuk menutup
          </motion.div>

          {/* Image */}
          <motion.img
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            src={image.src}
            alt={image.alt}
            className="max-w-[95vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Caption */}
          {(image.caption || image.gallery_title) && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6"
            >
              {image.caption && (
                <p className="text-white text-center text-lg">{image.caption}</p>
              )}
              {image.gallery_title && (
                <p className="text-white/70 text-center text-sm mt-1">{image.gallery_title}</p>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
