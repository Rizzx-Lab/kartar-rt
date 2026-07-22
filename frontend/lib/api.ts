// Unified API Service - Next.js connects to Laravel Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
console.log('[DEBUG apiFetch] API_BASE_URL:', API_BASE_URL);

// Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// API Helper
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const fetchUrl = `${API_BASE_URL}${endpoint}`;
    console.log('[DEBUG apiFetch] fetching:', fetchUrl, 'options:', JSON.stringify({ ...options, headers: options?.headers ? '(headers present)' : undefined }));

    const response = await fetch(fetchUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`[DEBUG apiFetch] ${endpoint} -> status:${response.status} success:${result.success} hasData:${!!result.data}`);
    return result;
  } catch (error) {
    console.error(`[DEBUG apiFetch] FETCH FAILED for ${endpoint}:`, error);
    console.error(`[DEBUG apiFetch] -> returning success:false (will use defaultSettings)`);
    return {
      success: false,
      data: null as T,
    };
  }
}

// ========================
// HOME
// ========================
export async function getHomeData() {
  return apiFetch<{
    announcements: Announcement[];
    programs: Program[];
  }>('/home');
}

// ========================
// PROGRAMS
// ========================
export async function getPrograms() {
  return apiFetch<Program[]>('/programs');
}

export async function getProgram(slug: string) {
  return apiFetch<Program & { sessions: Session[] }>(`/programs/${slug}`);
}

// ========================
// ANNOUNCEMENTS
// ========================
export async function getAnnouncements(page = 1, perPage = 10) {
  return apiFetch<Announcement[]>(`/announcements?page=${page}&per_page=${perPage}`);
}

export async function getAnnouncement(slug: string) {
  return apiFetch<Announcement>(`/announcements/${slug}`);
}

// ========================
// GALLERIES
// ========================
export async function getRecentPhotos(limit = 30) {
  return apiFetch<GalleryPhoto[]>(`/galleries/recent-photos?limit=${limit}`);
}

export async function getArchives() {
  return apiFetch<Archive[]>('/galleries/archives');
}

export async function getGalleries(page = 1, perPage = 12) {
  return apiFetch<Gallery[]>(`/galleries?page=${page}&per_page=${perPage}`);
}

export async function getGallery(id: number) {
  return apiFetch<GalleryDetail>(`/galleries/${id}`);
}

// ========================
// ABOUT
// ========================
export async function getAbout() {
  return apiFetch<{
    members: OrganizationMember[];
    organization_name: string;
    about_image: string | null;
    about_description: string | null;
    about_quote: string | null;
    location: string;
  }>('/about');
}

// ========================
// CONTACT
// ========================
export async function getContactInfo() {
  return apiFetch<ContactInfo>('/contact');
}

export async function submitContact(data: {
  name: string;
  email?: string;
  phone?: string;
  message: string;
  website?: string;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    console.error('Contact submission error:', error);
    return { success: false, message: 'Gagal mengirim pesan.' };
  }
}

// ========================
// FEATURED VIDEO
// ========================
export async function getFeaturedVideo() {
  return apiFetch<FeaturedVideo | null>('/featured-video');
}

export interface FeaturedVideo {
  id: number;
  title: string;
  video_url: string | null;
  thumbnail_url: string | null;
  duration: number;
  is_portrait: boolean;
  status: 'processing' | 'active' | 'failed';
  expires_at: string;
}

// ========================
// TYPES
// ========================
export interface Program {
  id: number;
  name: string;
  slug: string;
  description: string;
  frequency: 'monthly' | 'yearly' | 'once' | 'irregular';
  cover_image: string | null;
  order: number;
}

export interface Session {
  id: number;
  title: string;
  description: string;
  held_at: string;
  location: string;
  participants_count: number;
  photos_count: number;
  status?: 'upcoming' | 'done' | 'cancelled';
}

export interface Announcement {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  is_pinned: boolean;
  published_at: string;
  created_at?: string;
  image_url?: string | null;
}

export interface GalleryPhoto {
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

export interface Archive {
  date: string;
  formatted_date: string;
  title: string;
  description: string;
  galleries_count: number;
  photos: GalleryPhoto[];
  photos_count: number;
}

export interface Gallery {
  id: number;
  title: string;
  description: string;
  created_at: string;
  photos: GalleryPhoto[];
}

export interface GalleryDetail {
  id: number;
  title: string;
  description: string;
  created_at: string;
  photos: GalleryPhoto[];
}

export interface OrganizationMember {
  id: number;
  name: string;
  position: string;
  photo: string | null;
  order: number;
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string | null;
  maps_embed: string | null;
}

// ========================
// SETTINGS
// ========================
export interface SiteSettings {
  site_name: string;
  site_tagline: string;
  about_image: string | null;
  about_title: string | null;
  about_description: string | null;
  about_quote: string | null;
  address: string;
  phone: string;
  email: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  maps_embed: string | null;
  show_testimonials: boolean;
  testimonials_auto_scroll: boolean;
  gallery_auto_scroll: boolean;
  gallery_scroll_speed: number;
}

export async function getSettings(options?: RequestInit) {
  return apiFetch<SiteSettings>('/settings', options);
}

// Default settings for fallback
export const defaultSettings: SiteSettings = {
  site_name: 'Karang Taruna Armalo Eluf',
  site_tagline: 'Bersama Membangun Komunitas yang Lebih Baik',
  about_image: null,
  about_title: 'Armalo Eluf',
  about_description: null,
  about_quote: null,
  address: 'Jl. Manukan Lor 3F RT 06 RW 12, Surabaya',
  phone: '08xxxxxxxxxx',
  email: null,
  whatsapp: '6281234567890',
  instagram: null,
  facebook: null,
  maps_embed: null,
  show_testimonials: true,
  testimonials_auto_scroll: true,
  gallery_auto_scroll: true,
  gallery_scroll_speed: 30,
};

// ========================
// MOCK DATA (Fallback)
// ========================
export const mockPrograms: Program[] = [
  {
    id: 1,
    name: 'Kerja Bakti',
    slug: 'kerja-bakti',
    description: 'Kegiatan kerja bakti bulanan untuk membersihkan lingkungan RT 06.',
    frequency: 'monthly',
    cover_image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    order: 1,
  },
  {
    id: 2,
    name: 'Ronda Malam',
    slug: 'ronda-malam',
    description: 'Sistem ronda malam untuk menjaga keamanan lingkungan.',
    frequency: 'monthly',
    cover_image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80',
    order: 2,
  },
  {
    id: 3,
    name: 'Posyandu',
    slug: 'posyandu',
    description: 'Posyandu balita dan lansia untuk memantau kesehatan warga.',
    frequency: 'monthly',
    cover_image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    order: 3,
  },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: 'Undangan Halal Bihalal Hari Raya Idulfitri',
    slug: 'undangan-halal-bihalal',
    excerpt: 'Kami mengundang seluruh warga RT 06 RW 12 untuk hadir dalam acara halal bihalal.',
    is_pinned: true,
    published_at: '2026-06-01',
  },
  {
    id: 2,
    title: 'Jadwal Kerja Bakti Bulan Juni',
    slug: 'jadwal-kerja-bakti-juni',
    excerpt: 'Kerja bakti akan dilaksanakan pada hari Minggu, 8 Juni 2026 pukul 07.00.',
    is_pinned: false,
    published_at: '2026-05-28',
  },
  {
    id: 3,
    title: 'Pendaftaran Bantuan Sosial',
    slug: 'pendaftaran-bansos',
    excerpt: 'Pendaftaran bantuan sosial telah dibuka untuk warga yang membutuhkan.',
    is_pinned: false,
    published_at: '2026-05-20',
  },
];

export const mockMembers: OrganizationMember[] = [
  {
    id: 1,
    name: 'Ahmad Fauzi',
    position: 'Ketua',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    order: 1,
  },
  {
    id: 2,
    name: 'Siti Rahayu',
    position: 'Sekretaris',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    order: 2,
  },
  {
    id: 3,
    name: 'Budi Santoso',
    position: 'Bendahara',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    order: 3,
  },
];

// Mock Photos for Gallery
export const mockPhotos: (GalleryPhoto & { aspect_ratio?: number })[] = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80',
    alt: 'Halal Bihalal RT',
    caption: 'Suasana halal bihalal keluarga besar RT 06',
    aspect_ratio: 0.75,
    gallery: { id: 1, title: 'Halal Bihalal 2026' },
    created_at: '2026-05-15'
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    alt: 'Kerja bakti',
    caption: 'Kerja bakti bulanan',
    aspect_ratio: 1.5,
    gallery: { id: 2, title: 'Kerja Bakti' },
    created_at: '2026-05-10'
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80',
    alt: 'Posyandu',
    caption: 'Posyandu balita bulan Mei',
    aspect_ratio: 1,
    gallery: { id: 3, title: 'Posyandu' },
    created_at: '2026-05-05'
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80',
    alt: 'Ronda malam',
    caption: 'Ronda malam Minggu',
    aspect_ratio: 0.75,
    gallery: { id: 4, title: 'Ronda Malam' },
    created_at: '2026-04-28'
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    alt: 'Musyawarah',
    caption: 'Musyawarah program kerja',
    aspect_ratio: 1.5,
    gallery: { id: 5, title: 'Musyawarah' },
    created_at: '2026-04-20'
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80',
    alt: 'Seminar',
    caption: 'Seminar kewirausahaan',
    aspect_ratio: 1,
    gallery: { id: 6, title: 'Seminar' },
    created_at: '2026-04-15'
  },
  {
    id: 7,
    src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    alt: 'Gotong royong',
    caption: 'Gotong royong lingkungan',
    aspect_ratio: 0.75,
    gallery: { id: 7, title: 'Gotong Royong' },
    created_at: '2026-04-10'
  },
  {
    id: 8,
    src: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
    alt: 'Pelatihan',
    caption: 'Pelatihan KIR',
    aspect_ratio: 1.5,
    gallery: { id: 8, title: 'Pelatihan' },
    created_at: '2026-04-05'
  },
];

// Mock Archives for Gallery
export const mockArchives: Archive[] = [
  {
    date: '2026-05-15',
    formatted_date: '15 Mei 2026',
    title: 'Halal Bihalal Hari Raya Idulfitri',
    description: 'Acara halal bihalal yang diselenggarakan untuk mempererat tali silaturahmi antarwarga RT 06 RW 12. Hadir seluruh warga mulai dari anak-anak hingga lansia.',
    galleries_count: 1,
    photos_count: 24,
    photos: [
      { id: 1, src: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&q=80', alt: 'Foto 1', caption: 'Pembukaan acara', created_at: '2026-05-15' },
      { id: 2, src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80', alt: 'Foto 2', caption: 'Salaman', created_at: '2026-05-15' },
      { id: 3, src: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&q=80', alt: 'Foto 3', caption: 'Doa bersama', created_at: '2026-05-15' },
      { id: 4, src: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&q=80', alt: 'Foto 4', caption: 'Kumpul keluarga', created_at: '2026-05-15' },
      { id: 5, src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80', alt: 'Foto 5', caption: 'Foto bersama', created_at: '2026-05-15' },
      { id: 6, src: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&q=80', alt: 'Foto 6', caption: 'Penyerahan parcel', created_at: '2026-05-15' },
    ]
  },
  {
    date: '2026-05-01',
    formatted_date: '01 Mei 2026',
    title: 'Posyandu Balita Bulan Mei',
    description: 'Kegiatan posyandu balita rutin bulanan yang meliputi penimbangan berat badan, pengukuran tinggi badan, dan pemeriksaan kesehatan balita di wilayah RT 06.',
    galleries_count: 1,
    photos_count: 15,
    photos: [
      { id: 7, src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80', alt: 'Foto 1', caption: 'Penimbangan', created_at: '2026-05-01' },
      { id: 8, src: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&q=80', alt: 'Foto 2', caption: 'Pemeriksaan', created_at: '2026-05-01' },
      { id: 9, src: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80', alt: 'Foto 3', caption: 'Imunisasi', created_at: '2026-05-01' },
      { id: 10, src: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&q=80', alt: 'Foto 4', caption: 'Konsultasi', created_at: '2026-05-01' },
    ]
  },
  {
    date: '2026-04-28',
    formatted_date: '28 April 2026',
    title: 'Ronda Malam Minggu Pertama',
    description: 'Pelaksanaan ronda malam di hari Minggu pertama bulan April untuk menjaga keamanan dan ketertiban lingkungan RT 06 RW 12.',
    galleries_count: 1,
    photos_count: 8,
    photos: [
      { id: 11, src: 'https://images.unsplash.com/photo-1517427294546-5aa12163d01b?w=400&q=80', alt: 'Foto 1', caption: 'Persiapan', created_at: '2026-04-28' },
      { id: 12, src: 'https://images.unsplash.com/photo-1517427294546-5aa12163d01b?w=400&q=80', alt: 'Foto 2', caption: 'Pelaksanaan', created_at: '2026-04-28' },
    ]
  },
  {
    date: '2026-04-20',
    formatted_date: '20 April 2026',
    title: 'Musyawarah Program Kerja Semester',
    description: 'Rapat musyawarah untuk menentukan program kerja Karang Taruna Armalo Eluf semester ini yang akan dilaksanakan.',
    galleries_count: 1,
    photos_count: 12,
    photos: [
      { id: 13, src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80', alt: 'Foto 1', caption: 'Pembukaan', created_at: '2026-04-20' },
      { id: 14, src: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&q=80', alt: 'Foto 2', caption: 'Diskusi', created_at: '2026-04-20' },
    ]
  },
];