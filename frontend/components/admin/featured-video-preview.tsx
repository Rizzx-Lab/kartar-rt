'use client';

import React, { useState, useEffect } from 'react';

/**
 * Data structure representing a featured video item for preview presentation.
 */
export interface FeaturedVideoPreviewData {
  title?: string | null;
  video_url?: string | null;
  thumbnail_url?: string | null;
  duration?: number | string | null;
  file_size?: number | string | null;
  is_portrait?: boolean | null;
  expires_at?: string | null;
}

/**
 * Props for the FeaturedVideoPreview component.
 */
export interface FeaturedVideoPreviewProps {
  video: FeaturedVideoPreviewData;
  className?: string;
}

/**
 * Safely parses and coerces a duration value to a positive finite number (in seconds).
 * Returns null if the value is missing, non-finite, or <= 0.
 */
function parseDuration(val: number | string | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (!Number.isFinite(num) || num <= 0) return null;
  return num;
}

/**
 * Formats seconds into `m:ss` display string.
 */
function formatDuration(seconds: number): string {
  const totalSecs = Math.round(seconds);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Safely parses and coerces a file size value to a positive finite number of bytes.
 * Returns null if the value is missing, non-finite, or <= 0.
 */
function parseFileSizeBytes(val: number | string | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (!Number.isFinite(num) || num <= 0) return null;
  return num;
}

/**
 * Formats bytes into a human-readable size string:
 * - Below 1 MB (1,048,576 bytes): `<N> KB`
 * - 1 MB or above: `<N.N> MB` (one decimal place)
 */
function formatFileSize(bytes: number): string {
  const ONE_MB = 1024 * 1024;
  if (bytes < ONE_MB) {
    const kb = (bytes / 1024).toFixed(0);
    return `${kb} KB`;
  }
  const mb = (bytes / ONE_MB).toFixed(1);
  return `${mb} MB`;
}

/**
 * Safely formats an ISO date string into Indonesian locale date (e.g., "23 Okt 2026").
 * Returns null if invalid or missing.
 */
function formatExpiryDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Pure presentational component that renders an active featured video's
 * preview player and its metadata row (duration, file size, orientation, and expiry).
 *
 * Implements fallback states for missing or errored video streams, client-side
 * metadata duration recovery, and strict validation against NaN or broken images.
 */
export function FeaturedVideoPreview({ video, className = '' }: FeaturedVideoPreviewProps) {
  const [hasError, setHasError] = useState(false);
  const [clientDuration, setClientDuration] = useState<number | null>(null);

  // Reset local state if the video URL changes
  useEffect(() => {
    setHasError(false);
    setClientDuration(null);
  }, [video.video_url]);

  // Handle client-side metadata loading from the HTML5 video element
  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const d = e.currentTarget.duration;
    if (Number.isFinite(d) && d > 0) {
      setClientDuration(d);
    }
  };

  const handleVideoError = () => {
    setHasError(true);
  };

  // Determine effective duration: prioritize valid server value, fallback to video element
  const serverDuration = parseDuration(video.duration);
  const effectiveDuration = serverDuration ?? clientDuration;

  // Determine effective file size (bytes)
  const effectiveBytes = parseFileSizeBytes(video.file_size);

  // Format expiry date
  const formattedExpiry = formatExpiryDate(video.expires_at);

  // Orientation flag
  const isPortrait = Boolean(video.is_portrait);

  // Video container styling according to aspect ratio
  const containerAspectClass = isPortrait
    ? 'max-w-xs mx-auto aspect-[9/16] max-h-[70vh] w-full'
    : 'w-full aspect-video';

  const shouldRenderVideo = Boolean(video.video_url) && !hasError;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Video Player or Fallback Box */}
      {shouldRenderVideo ? (
        <div
          className={`rounded-lg overflow-hidden bg-black flex items-center justify-center ${containerAspectClass}`}
        >
          <video
            src={`${video.video_url}#t=0.1`}
            controls
            playsInline
            preload="metadata"
            poster={video.thumbnail_url || undefined}
            aria-label="Pratinjau video unggulan"
            onError={handleVideoError}
            onLoadedMetadata={handleLoadedMetadata}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div
          className={`rounded-lg bg-gray-100 border border-gray-200 text-gray-500 flex flex-col items-center justify-center gap-2 p-6 ${containerAspectClass}`}
          role="img"
          aria-label="Pratinjau tidak tersedia"
        >
          <svg
            className="w-10 h-10 text-gray-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-500">Pratinjau tidak tersedia</span>
        </div>
      )}

      {/* Metadata Row: renders only available items */}
      {(effectiveDuration !== null || effectiveBytes !== null || !isPortrait || formattedExpiry !== null) && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
          {/* Duration */}
          {effectiveDuration !== null && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{formatDuration(effectiveDuration)}</span>
            </span>
          )}

          {/* File Size */}
          {effectiveBytes !== null && (
            <span>{formatFileSize(effectiveBytes)}</span>
          )}

          {/* Landscape orientation badge */}
          {!isPortrait && (
            <span className="flex items-center gap-1 text-amber-600">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.83L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.17c-.77 1.667.192 2.83 1.732 2.83z"
                />
              </svg>
              <span>Landscape</span>
            </span>
          )}

          {/* Expiry Date */}
          {formattedExpiry !== null && (
            <span>Kadaluarsa: {formattedExpiry}</span>
          )}
        </div>
      )}
    </div>
  );
}
