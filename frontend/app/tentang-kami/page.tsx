import { Metadata } from 'next';
import Link from 'next/link';
import { getAbout } from '@/lib/api';
import { Users } from 'lucide-react';

// ISR - Revalidate every 60 seconds
export const revalidate = 60;

// SEO Metadata
export const metadata: Metadata = {
  title: 'Tentang Kami',
  description: 'Tentang Karang Taruna Armalo Eluf - Organisasi kepemudaan RT 06 RW 12 Manukan Lor.',
};

// Types
interface OrganizationMember {
  id: number;
  name: string;
  position: string;
  photo: string | null;
  order: number;
}

interface AboutData {
  members: OrganizationMember[];
  organization_name: string;
  location: string;
}

// Server Component - Data fetched at build/request time
async function getAboutData(): Promise<AboutData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/about`, {
      next: { revalidate: 60 },
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

// Image URL helper
function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/storage/${path}`;
}

export default async function AboutPage() {
  const data = await getAboutData();

  // Default members if API fails
  const members = data?.members || [];
  const keyMembers = members.slice(0, 3);
  const otherMembers = members.slice(3);

  return (
    <div className="bg-white">
      {/* Story Section */}
      <section className="pt-10 pb-16 md:pt-14 md:pb-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Image Side */}
            <div className="relative">
              <div className="aspect-square sm:aspect-4/3 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80"
                  alt="Youth Community"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Badge overlay */}
              <div className="absolute -bottom-4 -right-4 sm:bottom-6 sm:right-6 bg-white px-5 py-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gold-500 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-navy-900" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-navy-900">{members.length}+</div>
                    <div className="text-xs text-gray-500">Anggota</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Side */}
            <div>
              <span className="inline-flex items-center gap-2 text-gold-600 text-sm font-semibold mb-3 uppercase tracking-wider">
                <span className="w-8 h-px bg-gold-500" />
                Siapa Kami
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-navy-800 mb-5">
                Armalo Eluf
              </h1>
              <p className="text-gray-600 mb-4 leading-relaxed">
                "Armalo Eluf" terinspirasi dari nama-nama gang di lingkungan RT 06 RW 12, Manukan Lor. <strong className="text-navy-800">AREK MANUKAN LOR TELU EF</strong> — nama-nama yang membentuk identitas dan kebanggaan kami.
              </p>
              <p className="text-gray-600 mb-5 leading-relaxed">
                Bermula dari kepedulian pemuda terhadap lingkungan sekitar, kami sepakat membentuk wadah untuk saling berbagi ilmu, pengalaman, dan aksi nyata demi kebaikan bersama.
              </p>

              {/* Highlight quote */}
              <div className="bg-navy-50 border-l-4 border-gold-500 p-4 rounded-r-lg">
                <p className="text-navy-800 italic">
                  "Sederhana tempat kami, tapi besar semangat kami."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block text-gold-600 text-sm font-semibold mb-2 uppercase tracking-wider">
              Prinsip Kami
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-navy-800">
              Apa yang Kami Pegang
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '🤝', title: 'Gotong Royong', desc: 'Bersama kami kuat, sendiri kami terbatas' },
              { icon: '🎯', title: 'Tujuan Bersama', desc: 'Satu visi untuk lingkungan yang lebih baik' },
              { icon: '❤️', title: 'Kepedulian', desc: 'Saling menghargai dan membantu' },
              { icon: '💡', title: 'Kreativitas', desc: 'Terus berinovasi memberi manfaat' },
            ].map((value) => (
              <div key={value.title} className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                <div className="w-11 h-11 bg-navy-900 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gold-500 transition-colors">
                  <span className="text-lg group-hover:text-navy-900 transition-colors">{value.icon}</span>
                </div>
                <h3 className="font-semibold text-navy-900 mb-1">{value.title}</h3>
                <p className="text-sm text-gray-500">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organization Structure */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-gold-600 text-sm font-semibold mb-2 uppercase tracking-wider">
            Organisasi
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-navy-800 mb-3">
            Yang Menjaga Api Ini
          </h2>
          <p className="text-gray-500 max-w-md mx-auto text-sm mb-12">
            Mereka yang memimpin dengan contoh
          </p>

          {members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Data organisasi belum tersedia</p>
            </div>
          ) : (
            <>
              {/* Key Members */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                {keyMembers.map((member) => (
                  <div key={member.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all text-center">
                    <div className="relative w-24 mx-auto mb-4">
                      {member.photo ? (
                        <img
                          src={getImageUrl(member.photo)!}
                          alt={member.name}
                          className="w-24 h-24 mx-auto rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-400">{member.name[0]}</span>
                        </div>
                      )}
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gold-500 text-navy-900 text-xs font-bold px-2 py-0.5 rounded-full">
                        #{member.order}
                      </span>
                    </div>
                    <h3 className="font-bold text-navy-800 mb-1">{member.name}</h3>
                    <span className="text-gold-600 text-sm font-medium">{member.position}</span>
                  </div>
                ))}
              </div>

              {/* Other Members */}
              {otherMembers.length > 0 && (
                <div>
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="h-px w-16 bg-gray-200" />
                    <span className="text-gray-400 text-sm font-medium">Pengurus Lainnya</span>
                    <div className="h-px w-16 bg-gray-200" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-3xl mx-auto">
                    {otherMembers.map((member) => (
                      <div key={member.id} className="bg-gray-50 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                        {member.photo ? (
                          <img
                            src={getImageUrl(member.photo)!}
                            alt={member.name}
                            className="w-14 h-14 mx-auto rounded-full object-cover"                          />
                        ) : (
                          <div className="w-14 h-14 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold text-gray-400">{member.name[0]}</span>
                          </div>
                        )}
                        <h4 className="text-sm font-semibold text-navy-800 mt-2 truncate">{member.name}</h4>
                        <p className="text-xs text-gold-600 truncate">{member.position}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-navy-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
            Tertarik untuk Bergabung?
          </h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">
            Karang Taruna terbuka untuk pemuda-pemudi Manukan Lor yang ingin berkontribusi.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/kontak"
              className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold rounded-full transition-colors text-sm shadow-lg shadow-gold-500/30">
              Hubungi Kami
            </Link>
            <Link
              href="/kegiatan"
              className="px-6 py-2.5 border border-white/30 hover:border-white/60 text-white rounded-full transition-colors text-sm">
              Lihat Kegiatan
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}