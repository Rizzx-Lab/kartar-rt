import { Metadata } from 'next';
import { getAnnouncements, mockAnnouncements } from '@/lib/api';
import { AnnouncementCard } from '@/components/ui/announcement-card';
import { Megaphone, Pin } from 'lucide-react';

// ISR - Revalidate every 60 seconds
export const revalidate = 60;

// SEO Metadata
export const metadata: Metadata = {
  title: 'Pengumuman',
  description: 'Informasi dan berita terbaru dari Karang Taruna Armalo Eluf.',
};

// Server Component - Data fetched at build/request time
async function getAnnouncementsData() {
  try {
    const response = await getAnnouncements(1, 20);
    return response.success && response.data ? response.data : mockAnnouncements;
  } catch {
    return mockAnnouncements;
  }
}

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncementsData();

  // Separate pinned and regular announcements
  const pinnedAnnouncements = announcements.filter((a) => a.is_pinned);
  const regularAnnouncements = announcements.filter((a) => !a.is_pinned);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-navy-900 pt-24 pb-14 md:pt-28 md:pb-20 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute top-10 left-20 w-72 h-72 bg-gold-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-20 w-96 h-96 bg-navy-500/30 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-gold-500 text-sm font-semibold mb-4 uppercase tracking-wider">
              <span className="w-8 h-px bg-gold-500" />
              Info Terkini
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Pengumuman
            </h1>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed">
              Informasi dan berita terbaru dari Karang Taruna Armalo Eluf untuk warga Manukan Lor.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Pinned Announcements */}
          {pinnedAnnouncements.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center animate-pulse">
                  <Pin className="w-4 h-4 text-navy-900" />
                </div>
                <h2 className="text-lg font-bold text-navy-900">Disematkan</h2>
              </div>
              <div className="space-y-4">
                {pinnedAnnouncements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    variant="pinned"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Announcements */}
          {regularAnnouncements.length > 0 && (
            <div>
              {pinnedAnnouncements.length > 0 && (
                <div className="flex items-center gap-3 mb-4 mt-8">
                  <div className="w-8 h-8 bg-navy-100 rounded-lg flex items-center justify-center">
                    <Megaphone className="w-4 h-4 text-navy-800" />
                  </div>
                  <h2 className="text-lg font-bold text-navy-900">Pengumuman Lainnya</h2>
                </div>
              )}
              <div className="space-y-3">
                {regularAnnouncements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    variant="regular"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {announcements.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Megaphone className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum Ada Pengumuman</h3>
              <p className="text-gray-500 text-sm">Pengumuman baru akan muncul di sini.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}