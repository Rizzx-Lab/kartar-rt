import { Metadata } from 'next';
import { getRecentPhotos, getArchives, getSettings, mockPhotos, mockArchives, defaultSettings } from '@/lib/api';
import GalleryTabs from '@/components/ui/gallery-tabs';

// ISR - Revalidate every 60 seconds
export const revalidate = 60;

// SEO Metadata
export const metadata: Metadata = {
  title: 'Galeri',
  description: 'Dokumentasi foto seluruh kegiatan Karang Taruna Armalo Eluf RT 06 RW 12.',
};

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

// Server Component - Data fetched at build/request time
async function getGalleryData() {
  try {
    const [photosRes, archivesRes, settingsRes] = await Promise.all([
      getRecentPhotos(30),
      getArchives(),
      getSettings()
    ]);

    return {
      recentPhotos: photosRes.success && photosRes.data ? photosRes.data : mockPhotos,
      archives: archivesRes.success && archivesRes.data ? archivesRes.data : mockArchives,
      settings: settingsRes.success && settingsRes.data ? settingsRes.data : defaultSettings,
    };
  } catch {
    // Fallback to mock data if API fails
    return {
      recentPhotos: mockPhotos,
      archives: mockArchives,
      settings: defaultSettings,
    };
  }
}

export default async function GalleryPage() {
  const { recentPhotos, archives, settings } = await getGalleryData();

  // Auto scroll logic: only if photos >= 3 and setting is enabled
  const shouldAutoScroll = settings.gallery_auto_scroll && recentPhotos.length >= 3;

  return (
    <GalleryTabs
      recentPhotos={recentPhotos}
      archives={archives}
      autoScroll={shouldAutoScroll}
      scrollSpeed={settings.gallery_scroll_speed}
    />
  );
}