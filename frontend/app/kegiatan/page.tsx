import { Metadata } from 'next';
import Link from 'next/link';
import { getPrograms, mockPrograms } from '@/lib/api';
import { ProgramList } from '@/components/ui/program-list';
import { ArrowRight } from 'lucide-react';

// ISR - Revalidate every 60 seconds
export const revalidate = 60;

// SEO Metadata
export const metadata: Metadata = {
  title: 'Kegiatan',
  description: 'Program kegiatan Karang Taruna Armalo Eluf untuk kebersamaan dan kebaikan bersama.',
};

// Server Component - Data fetched at build/request time
async function getProgramsData() {
  try {
    const response = await getPrograms();
    return response.success && response.data ? response.data : mockPrograms;
  } catch {
    return mockPrograms;
  }
}

export default async function ProgramsPage() {
  const programs = await getProgramsData();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-navy-900 pt-24 pb-14 md:pt-28 md:pb-20 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-navy-500/30 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-gold-500 text-sm font-semibold mb-4 uppercase tracking-wider">
              <span className="w-8 h-px bg-gold-500" />
              Agenda Kami
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Program Kegiatan
            </h1>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed">
              Rangkaian kegiatan positif untuk kebersamaan dan kebaikan bersama warga Manukan Lor.
            </p>
          </div>
        </div>
      </section>

      {/* Program List with Filter - Client Component */}
      <ProgramList programs={programs} />

      {/* CTA */}
      <section className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 mb-5">
            Ingin tahu lebih lanjut atau berpartisipasi?
          </p>
          <Link
            href="/kontak"
            className="inline-flex items-center gap-2 px-8 py-3 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-full transition-colors"
          >
            Hubungi Kami
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}