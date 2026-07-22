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
      // cache: 'no-store' bypasses Next.js fetch-level caching so this always
      // reads the live value — needed because settings changes (auto-scroll toggle,
      // scroll speed) must take effect immediately, not after ISR revalidation.
      getSettings({ cache: 'no-store' }),
    ]);

    // TODO DEBUG: log raw settings response to verify gallery_auto_scroll value
    console.log('[DEBUG getGalleryData] settingsRes:', JSON.stringify({
      success: settingsRes.success,
      hasData: !!settingsRes.data,
      gallery_auto_scroll: settingsRes.data?.gallery_auto_scroll,
      gallery_scroll_speed: settingsRes.data?.gallery_scroll_speed,
      allKeys: settingsRes.data ? Object.keys(settingsRes.data) : 'NO_DATA',
    }));
    console.log('[DEBUG getGalleryData] photosRes.success:', photosRes.success, 'count:', photosRes.data?.length);

    return {
      recentPhotos: photosRes.success && photosRes.data ? photosRes.data : mockPhotos,
      archives: archivesRes.success && archivesRes.data ? archivesRes.data : mockArchives,
      settings: settingsRes.success && settingsRes.data ? settingsRes.data : defaultSettings,
    };
  } catch (e) {
    // Fallback to mock data if API fails
    console.log('[DEBUG getGalleryData] API call failed, using defaults:', e);
    return {
      recentPhotos: mockPhotos,
      archives: mockArchives,
      settings: defaultSettings,
    };
  }
}

export default async function GalleryPage() {
  const { recentPhotos, archives, settings } = await getGalleryData();

  // TODO DEBUG: visible in page source — remove after debugging
  // SSR DEBUG: gallery_auto_scroll={String(settings.gallery_auto_scroll)}
  //           recentPhotos.length={recentPhotos.length}
  //           shouldAutoScroll={String(settings.gallery_auto_scroll && recentPhotos.length >= 3)}

  // Auto scroll logic: only if photos >= 3 and setting is enabled
  const shouldAutoScroll = settings.gallery_auto_scroll && recentPhotos.length >= 3;

  // TODO DEBUG: log computed values
  console.log('[DEBUG GalleryPage] shouldAutoScroll:', shouldAutoScroll, {
    gallery_auto_scroll: settings.gallery_auto_scroll,
    recentPhotos_count: recentPhotos.length,
    scrollSpeed: settings.gallery_scroll_speed,
  });

  return (
    <GalleryTabs
      recentPhotos={recentPhotos}
      archives={archives}
      autoScroll={shouldAutoScroll}
      scrollSpeed={settings.gallery_scroll_speed}
    />
  );
}
