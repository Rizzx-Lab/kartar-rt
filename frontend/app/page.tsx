import { Metadata } from 'next';
import Link from 'next/link';
import { defaultSettings, mockPrograms, mockAnnouncements } from '@/lib/api';
import { ArrowRight } from 'lucide-react';

// ISR - Revalidate every 60 seconds
export const revalidate = 60;

// SEO Metadata
export const metadata: Metadata = {
  title: 'Beranda',
  description: 'Website resmi Karang Taruna Armalo Eluf RT 06 RW 12, Manukan Lor, Surabaya.',
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Direct fetch di server (lebih reliable daripada wrapper)
async function fetchFromApi<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      next: { revalidate: 60, tags: ['home'] },
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return null;
  }
}

// Server Component - Data fetched at build/request time
async function getHomeData() {
  const [programs, announcements, settings] = await Promise.all([
    fetchFromApi<any[]>('/programs'),
    fetchFromApi<any[]>('/announcements?page=1&per_page=6'),
    fetchFromApi<any>('/settings'),
  ]);

  return {
    programs: programs || mockPrograms,
    announcements: announcements || mockAnnouncements,
    settings: settings || defaultSettings,
  };
}

const getImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `https://armaloeluf.my.id/storage/${path}`;
};

// Main Server Component
export default async function HomePage() {
  const { programs, announcements, settings } = await getHomeData();

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-navy-900">
        {/* Static Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-navy-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-400/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #C9A84C 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="animate-fade-in-left">
            <span className="inline-flex items-center gap-2 bg-navy-700/50 backdrop-blur-sm border border-amber-500/30 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-amber-400 text-xs font-medium tracking-wider uppercase">Karang Taruna Aktif</span>
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Bersama Membangun{' '}
              <span className="text-amber-400">Komunitas</span>
              {' '}yang Lebih Baik
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Karang Taruna Armalo Eluf hadir untuk menyatukan pemuda, menjalankan program yang bermanfaat, dan mempererat kebersamaan warga RT.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/kegiatan" className="inline-flex items-center justify-center gap-2 bg-amber-500 text-navy-900 px-6 py-3 rounded-xl font-semibold hover:bg-amber-400 transition-all duration-300 shadow-lg shadow-amber-500/30">
                Lihat Kegiatan
              </Link>
              <Link href="/tentang-kami" className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-6 py-3 rounded-xl font-medium hover:border-amber-400 hover:text-amber-400 transition-all duration-300">
                Tentang Kami
              </Link>
            </div>
          </div>

          {/* Hero Logo Section */}
          <div className="flex justify-center animate-fade-in-scale">
            <div className="relative">
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-96 md:h-96 flex items-center justify-center">
                {/* Outer glow ambient */}
                <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-3xl animate-pulse-glow" />
                <div className="absolute inset-8 rounded-full bg-amber-400/15 blur-2xl" />

                {/* Ring animasi pulse */}
                <div className="absolute inset-0 rounded-full border border-amber-500/40 animate-pulse-glow" />
                <div className="absolute inset-4 rounded-full border border-amber-400/30 animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
                <div className="absolute inset-8 rounded-full border border-amber-300/20 animate-pulse-glow" style={{ animationDelay: '1s' }} />

                {/* Logo */}
                <div className="relative w-4/5 h-4/5 z-10">
                  <img
                    src="/images/logo.png"
                    alt="Logo Armalo Eluf"
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
              </div>

              {/* Badge Aktif Sejak 2020 */}
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-amber-500 text-navy-900 rounded-xl px-2 sm:px-3 py-1 sm:py-2 text-xs font-bold shadow-lg z-20 animate-bounce">
                Aktif Sejak 2020
              </div>

              {/* Badge RT Bersatu */}
              <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 bg-white text-navy-800 rounded-xl px-2 sm:px-3 py-1 sm:py-2 text-xs font-bold shadow-lg z-20">
                RT Bersatu
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 animate-fade-in-up hidden md:flex" style={{ animationDelay: '1.5s' }}>
          <span className="text-gray-400 text-xs">Scroll ke bawah</span>
          <div className="w-5 h-8 border-2 border-gray-500 rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-amber-400 rounded-full animate-bounce-indicator" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: 'Program Kerja', value: '2+' },
              { label: 'Anggota Aktif', value: '50+' },
              { label: 'Kegiatan Per Tahun', value: '10+' },
              { label: 'Satu Keluarga Besar', value: '1 RT' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <span className="text-3xl md:text-4xl font-bold text-navy-800">{stat.value}</span>
                <div className="w-8 h-0.5 bg-amber-500 mx-auto my-2 rounded" />
                <div className="text-gray-500 text-xs md:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 text-amber-600 text-sm font-semibold mb-3 uppercase tracking-wider">
              <span className="w-8 h-px bg-amber-500" />
              Program Kami
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-3">Program Kegiatan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-3">Berbagai kegiatan positif yang rutin kami lakukan untuk kebersamaan dan kemajuan lingkungan.</p>
            <div className="w-12 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300 mx-auto rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.slice(0, 6).map((program) => {
              const hasImage = getImageUrl(program.cover_image);
              const freqConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
                monthly: { label: 'Bulanan', bgColor: 'bg-emerald-500', textColor: 'text-emerald-600' },
                yearly: { label: 'Tahunan', bgColor: 'bg-blue-500', textColor: 'text-blue-600' },
                once: { label: 'Sekali', bgColor: 'bg-purple-500', textColor: 'text-purple-600' },
                irregular: { label: 'Tidak Rutin', bgColor: 'bg-amber-500', textColor: 'text-amber-600' },
              };
              const freq = freqConfig[program.frequency] || freqConfig.irregular;

              return (
                <Link key={program.id} href={`/kegiatan/${program.slug}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
                  {/* Image Area */}
                  <div className="relative h-40 overflow-hidden">
                    {hasImage ? (
                      <>
                        <img
                          src={getImageUrl(program.cover_image)!}
                          alt={program.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-navy-300/50 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-navy-400" />
                        </div>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-navy-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-semibold text-sm flex items-center gap-2">
                        Lihat Detail
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col -mt-2">
                    {/* Frequency Badge */}
                    <div className={`inline-flex items-center gap-1.5 ${freq.bgColor} px-3 py-1 rounded-full self-start mb-3`}>
                      <span className="text-white text-xs font-semibold">{freq.label}</span>
                    </div>

                    <h3 className="font-bold text-navy-900 text-base mb-2 group-hover:text-gold-600 transition-colors">
                      {program.name}
                    </h3>
                    {program.description && (
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1">
                        {program.description}
                      </p>
                    )}

                    {/* Bottom meta */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className={`text-xs font-medium ${freq.textColor}`}>
                        #{program.order}
                      </span>
                      <span className="text-gold-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Eksplorasi
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link href="/kegiatan" className="inline-flex items-center gap-2 px-6 py-3 bg-navy-800 hover:bg-navy-700 text-white font-medium rounded-lg transition-colors">
              Lihat semua kegiatan
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 text-amber-600 text-sm font-semibold mb-3 uppercase tracking-wider">
              <span className="w-8 h-px bg-amber-500" />
              Info Terkini
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-3">Pengumuman Terbaru</h2>
            <div className="w-12 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300 mx-auto rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.slice(0, 3).map((ann) => {
              const showPoster = ann.is_pinned && ann.image_url;
              return (
                <div
                  key={ann.id}
                  className="bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all group overflow-hidden"
                >
                  {/* Poster-style image for pinned announcements — always visible */}
                  {showPoster && (
                    <div className="relative">
                      <img
                        src={ann.image_url}
                        alt={ann.title}
                        className="w-full max-h-[300px] object-contain"
                      />
                    </div>
                  )}

                  <div className={`p-5 ${showPoster ? '' : ''}`}>
                    {ann.is_pinned && (
                      <span className="inline-flex items-center px-2 py-1 bg-amber-500/10 text-amber-600 text-xs font-medium rounded mb-3">
                        📌 Disematkan
                      </span>
                    )}
                    <h3 className="text-base font-semibold text-navy-800 mb-2 group-hover:text-amber-600 transition-colors">{ann.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ann.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {new Date(ann.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <Link href="/pengumuman" className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
                        Baca selengkapnya
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link href="/pengumuman" className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium">
              Lihat semua pengumuman
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {settings.show_testimonials && <TestimonialsSection />}

      {/* CTA Section */}
      <section className="py-12 bg-navy-900">git 
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Tertarik untuk Bergabung?
          </h2>
          <p className="text-gray-400 mb-6">
            Jangan ragu untuk menghubungi kami. Kami selalu terbuka untuk kolaborasi dan partisipasi warga.
          </p>
          <div className="flex flex-row gap-4 justify-center">
            <Link href="/kontak" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold rounded-full transition-colors shadow-lg shadow-gold-500/30">
              Hubungi Kami
            </Link>
            <Link href="/kegiatan" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-white/30 hover:border-white/60 text-white rounded-full transition-colors">
              Lihat Kegiatan
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function TestimonialsSection() {
  const column1Data = [
    { name: 'Ibu Sari', role: 'Warga RT 06', initial: 'S', bgColor: 'bg-navy-800', textColor: 'text-amber-400', text: 'Program Kumpul Bocah sangat membantu anak-anak kami untuk bersosialisasi dan belajar bersama.' },
    { name: 'Pak Budi', role: 'Ketua RT 06', initial: 'B', bgColor: 'bg-amber-500', textColor: 'text-navy-900', text: 'Perayaan 17 Agustus tahun ini luar biasa! Karang Taruna Armalo Eluf berhasil menghadirkan suasana yang meriah.' },
    { name: 'Ibu Rini', role: 'Warga RT 06', initial: 'R', bgColor: 'bg-navy-700', textColor: 'text-amber-400', text: 'Senang sekali ada organisasi pemuda yang aktif di RT kita.' },
  ];

  const column2Data = [
    { name: 'Pak Ahmad', role: 'Warga RT 06', initial: 'A', bgColor: 'bg-navy-800', textColor: 'text-amber-400', text: 'Karang Taruna Armalo Eluf sangat aktif dalam membantu warga.' },
    { name: 'Ibu Dewi', role: 'Ibu PKK RT 06', initial: 'D', bgColor: 'bg-amber-500', textColor: 'text-navy-900', text: 'Kolaborasi antara karang taruna dan ibu PKK sangat baik.' },
    { name: 'Pak Hendra', role: 'Sesepuh RT 06', initial: 'H', bgColor: 'bg-navy-700', textColor: 'text-amber-400', text: 'Melihat pemuda RT ini aktif dan semangat membuat saya sangat bangga.' },
  ];

  const column3Data = [
    { name: 'Ibu Fitri', role: 'Warga RT 06', initial: 'F', bgColor: 'bg-amber-500', textColor: 'text-navy-900', text: 'Program-program yang dijalankan karang taruna sangat bermanfaat.' },
    { name: 'Pak Rizal', role: 'Warga RT 06', initial: 'R', bgColor: 'bg-navy-800', textColor: 'text-amber-400', text: 'Organisasi yang solid dengan program kerja yang jelas.' },
    { name: 'Ibu Yanti', role: 'Warga RT 06', initial: 'Y', bgColor: 'bg-navy-700', textColor: 'text-amber-400', text: 'Lingkungan RT kita menjadi lebih hidup dengan adanya karang taruna.' },
  ];

  return (
    <section className="bg-gray-50 py-16 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="inline-block border border-navy-200 text-navy-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wider uppercase">
            Testimoni
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-3">Apa Kata Warga</h2>
          <div className="w-12 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300 mx-auto rounded" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-5 px-4 md:px-6" style={{ maxHeight: '680px', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)', maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}>

          {/* All screens: Auto scroll columns */}
          <div className="flex justify-center gap-5">
          <TestimonialColumn data={column1Data} />
          <div className="hidden lg:flex gap-5">
            <div className="shrink-0 w-72 overflow-hidden">
              <div className="animate-scroll-up-slow flex flex-col gap-5">
                {[...column2Data, ...column2Data].map((item, idx) => <TestimonialCard key={`col2-${idx}`} {...item} />)}
              </div>
            </div>
            <div className="hidden xl:flex gap-5">
              <div className="shrink-0 w-72 overflow-hidden">
                <div className="animate-scroll-up-medium flex flex-col gap-5">
                  {[...column3Data, ...column3Data].map((item, idx) => <TestimonialCard key={`col3-${idx}`} {...item} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Review CTA */}
      <div className="max-w-6xl mx-auto px-6 mt-14">
        <div className="bg-navy-900 rounded-2xl p-8">
          <div className="flex flex-col items-center text-center md:flex-row md:text-left justify-between gap-6">
            <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-lg">Beri Ulasan di Google</p>
                <p className="text-gray-300 text-sm mt-1">Pengalaman kamu sangat berarti bagi perkembangan Karang Taruna Armalo Eluf</p>
                <div className="flex items-center gap-1 mt-2">
                  {[1,2,3,4,5].map((i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                  <span className="text-gray-400 text-xs ml-1">Jadilah yang pertama memberi ulasan</span>
                </div>
              </div>
            </div>
            <a
              href="https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto flex-shrink-0 bg-amber-500 text-navy-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Tulis Ulasan
            </a>
          </div>
        </div>
      </div>

    </section>
  );
}

function TestimonialColumn({ data }: { data: Array<{
  name: string;
  role: string;
  initial: string;
  bgColor: string;
  textColor: string;
  text: string;
}> }) {
  return (
    <div className="flex-shrink-0 w-72 overflow-hidden">
      <div className="animate-scroll-up flex flex-col gap-5">
        {[...data, ...data].map((item, idx) => <TestimonialCard key={`col1-${idx}`} {...item} />)}
      </div>
    </div>
  );
}

function TestimonialCard({ name, role, initial, bgColor, textColor, text }: {
  name: string;
  role: string;
  initial: string;
  bgColor: string;
  textColor: string;
  text: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm w-72">
      <div className="flex gap-0.5 mb-3">
        {[1,2,3,4,5].map((i) => (
          <svg key={i} className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        ))}
      </div>
      <svg className="w-6 h-6 text-amber-200 mb-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
      </svg>
      <p className="text-gray-600 text-sm leading-relaxed mb-5">{text}</p>
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <div className={`w-9 h-9 rounded-full ${bgColor} flex items-center justify-center ${textColor} font-bold text-xs`}>{initial}</div>
        <div>
          <p className="font-semibold text-navy-800 text-sm">{name}</p>
          <p className="text-gray-400 text-xs">{role}</p>
        </div>
      </div>
    </div>
  );
}