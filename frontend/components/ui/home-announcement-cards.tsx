'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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

interface HomeAnnouncementCardsProps {
  announcements: Announcement[];
}

// Renders a pinned poster card (full-width, with lightbox)
function PosterCard({
  ann,
  onImageClick,
}: {
  ann: Announcement;
  onImageClick: (src: string, alt: string) => void;
}) {
  return (
    <div className="w-full bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all group overflow-hidden">
      {/* Poster image — always visible, click to lightbox */}
      <div
        className="relative cursor-zoom-in"
        onClick={() => ann.image_url && onImageClick(ann.image_url, ann.title)}
        title="Klik untuk memperbesar"
      >
        <img
          src={ann.image_url!}
          alt={ann.title}
          className="w-full max-h-[600px] object-contain"
        />
        {/* Hover hint */}
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-black/10 flex items-center justify-center">
          <div className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
            Klik untuk memperbesar
          </div>
        </div>
      </div>

      <div className="p-5">
        <span className="inline-flex items-center px-2 py-1 bg-amber-500/10 text-amber-600 text-xs font-medium rounded mb-3">
          📌 Disematkan
        </span>
        <h3 className="text-base font-semibold text-navy-800 mb-2 group-hover:text-amber-600 transition-colors">
          {ann.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ann.excerpt}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {new Date(ann.published_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <Link
            href="/pengumuman"
            className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
          >
            Baca selengkapnya
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Renders a regular (non-poster) card
function RegularCard({
  ann,
  onImageClick,
}: {
  ann: Announcement;
  onImageClick: (src: string, alt: string) => void;
}) {
  const hasImage = !!ann.image_url;

  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all group overflow-hidden">
      {/* Thumbnail image (non-pinned, shown only if it exists) */}
      {hasImage && (
        <div
          className="relative cursor-zoom-in"
          onClick={() => onImageClick(ann.image_url!, ann.title)}
          title="Klik untuk memperbesar"
        >
          <img
            src={ann.image_url!}
            alt={ann.title}
            className="w-full h-48 object-cover cursor-zoom-in"
          />
          {/* Hover hint */}
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-black/10 flex items-center justify-center">
            <div className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
              Klik untuk memperbesar
            </div>
          </div>
        </div>
      )}

      <div className="p-5">
        {ann.is_pinned && (
          <span className="inline-flex items-center px-2 py-1 bg-amber-500/10 text-amber-600 text-xs font-medium rounded mb-3">
            📌 Disematkan
          </span>
        )}
        <h3 className="text-base font-semibold text-navy-800 mb-2 group-hover:text-amber-600 transition-colors">
          {ann.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ann.excerpt}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {new Date(ann.published_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <Link
            href="/pengumuman"
            className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
          >
            Baca selengkapnya
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Homepage "Pengumuman Terbaru" section — client component.
 *
 * Layout rules:
 * - Pinned poster announcements (is_pinned + image_url) always render first,
 *   each as a full-width block, stacked vertically.
 * - Regular announcements render below in a 3-column grid.
 * - If there is exactly one pinned poster and NO regular items, it is centered
 *   (max-w-3xl) to avoid looking orphaned on desktop.
 * - Mixed: pinned poster(s) get their own full-width row(s) above the grid.
 */
export function HomeAnnouncementCards({ announcements }: HomeAnnouncementCardsProps) {
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  const preview = announcements.slice(0, 3);

  // Separate pinned posters from regular items
  const pinnedPosters = preview.filter((a) => a.is_pinned && !!a.image_url);
  const regularItems = preview.filter((a) => !(a.is_pinned && !!a.image_url));

  // Only 1 pinned poster and no regular items → center it
  const centerSinglePoster = pinnedPosters.length === 1 && regularItems.length === 0;

  const openLightbox = (src: string, alt: string) => {
    setLightboxImage({ src, alt });
  };

  return (
    <>
      {/* Pinned poster section — always full-width */}
      {pinnedPosters.length > 0 && (
        <div className={`${centerSinglePoster ? 'flex justify-center' : ''}`}>
          {centerSinglePoster ? (
            // Single poster centered
            <div className="w-full max-w-3xl">
              <PosterCard ann={pinnedPosters[0]} onImageClick={openLightbox} />
            </div>
          ) : (
            // Multiple pinned posters, each full-width, stacked
            <div className="space-y-6">
              {pinnedPosters.map((ann) => (
                <PosterCard key={ann.id} ann={ann} onImageClick={openLightbox} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Regular items — 3-column grid below the poster section */}
      {regularItems.length > 0 && (
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${
            pinnedPosters.length > 0 ? 'mt-6' : ''
          }`}
        >
          {regularItems.map((ann) => (
            <RegularCard key={ann.id} ann={ann} onImageClick={openLightbox} />
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </>
  );
}
