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

/**
 * Homepage "Pengumuman Terbaru" section — client component.
 * Handles lightbox state and layout for pinned poster cards.
 */
export function HomeAnnouncementCards({ announcements }: HomeAnnouncementCardsProps) {
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  const preview = announcements.slice(0, 3);

  // Single pinned poster case: switch to flex so the card can be centered
  const singlePinnedPoster =
    preview.length === 1 && preview[0].is_pinned && !!preview[0].image_url;

  return (
    <>
      {singlePinnedPoster ? (
        // Flex container with justify-center — card sits in the middle
        <div className="flex justify-center">
          <div className="w-full max-w-3xl bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all group overflow-hidden">
            {/* Poster-style image — always visible, click to lightbox */}
            <div
              className="relative cursor-zoom-in"
              onClick={() =>
                setLightboxImage({
                  src: preview[0].image_url!,
                  alt: preview[0].title,
                })
              }
              title="Klik untuk memperbesar"
            >
              <img
                src={preview[0].image_url!}
                alt={preview[0].title}
                className="w-full max-h-[600px] object-contain"
              />
              {/* Hover hint overlay */}
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
                {preview[0].title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {preview[0].excerpt}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {new Date(preview[0].published_at).toLocaleDateString('id-ID', {
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
        </div>
      ) : (
        // Normal 3-column grid for all other cases
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {preview.map((ann) => {
            const showPoster = ann.is_pinned && ann.image_url;
            return (
              <div
                key={ann.id}
                className="bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all group overflow-hidden"
              >
                {/* Poster-style image for pinned announcements — always visible, click to lightbox */}
                {showPoster && (
                  <div
                    className="relative cursor-zoom-in"
                    onClick={() =>
                      setLightboxImage({
                        src: ann.image_url!,
                        alt: ann.title,
                      })
                    }
                    title="Klik untuk memperbesar"
                  >
                    <img
                      src={ann.image_url!}
                      alt={ann.title}
                      className="w-full max-h-[450px] object-contain"
                    />
                    {/* Hover hint overlay */}
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
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {ann.excerpt}
                  </p>
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
          })}
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
