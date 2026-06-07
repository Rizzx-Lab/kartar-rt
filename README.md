# Kartar-RT (ARMALO ELUF)

Website CMS untuk manajemen komunitas Rukun Tetangga (RT) dengan **Next.js Frontend** dan **Laravel API Backend**.

## 🎯 Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS FRONTEND (localhost:3000)              │
│   Public Pages: /, /galeri, /kegiatan, /pengumuman, dll    │
│   Admin Panel: /admin/dashboard, /admin/programs, dll       │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              LARAVEL BACKEND (localhost:8000)               │
│   REST API: /api/v1/*                                       │
│   Database, Authentication, File Storage                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **Backend** | Laravel 12, PHP 8.2 |
| **Database** | MySQL |
| **Icons** | Lucide React |
| **UI Components** | Radix UI |

---

## 📂 Struktur Folder Project

```
kartar-rt-new/
├── app/
│   ├── Http/Controllers/Api/
│   │   └── PublicApiController.php    # API Controller
│   ├── Models/                        # Eloquent Models
│   └── Providers/                    # Service Providers
│
├── frontend/                          # Next.js Frontend
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Home
│   │   ├── galeri/page.tsx           # Gallery
│   │   ├── kegiatan/page.tsx         # Programs
│   │   ├── pengumuman/page.tsx       # Announcements
│   │   ├── tentang-kami/page.tsx     # About
│   │   ├── kontak/page.tsx           # Contact
│   │   └── admin/                    # Admin Panel
│   │       ├── layout.tsx
│   │       ├── dashboard/page.tsx
│   │       ├── programs/page.tsx
│   │       ├── announcements/page.tsx
│   │       ├── galleries/page.tsx
│   │       ├── contacts/page.tsx
│   │       ├── settings/page.tsx
│   │       └── users/page.tsx
│   │
│   ├── components/
│   │   ├── layout/                   # Navbar, Footer
│   │   │   ├── navbar.tsx
│   │   │   └── footer.tsx
│   │   └── ui/                       # UI Components
│   │       ├── aspect-ratio.tsx
│   │       ├── image-gallery.tsx
│   │       └── archive-gallery.tsx
│   │
│   └── lib/
│       ├── api.ts                    # API Service
│       └── utils.ts                  # Utilities
│
├── routes/
│   ├── api.php                       # API Routes
│   └── web.php                       # Simple health check
│
└── database/
    └── migrations/                   # Database Migrations
```

---

## 🗄️ Database Schema

| Tabel | Deskripsi |
|-------|-----------|
| `users` | User admin sistem |
| `programs` | Program kegiatan RT |
| `program_sessions` | Sesi/jadwal program |
| `announcements` | Pengumuman untuk warga |
| `galleries` | Album galeri foto |
| `gallery_photos` | Foto dalam galeri |
| `contacts` | Data kontak pengunjung |
| `site_settings` | Pengaturan website |
| `organization_members` | Anggota organisasi RT |

---

## 🌐 Routing

### Halaman Publik (Next.js - port 3000)

| URL | Page | Deskripsi |
|-----|------|-----------|
| `/` | Home | Homepage |
| `/galeri` | Gallery | Masonry + Archive |
| `/kegiatan` | Programs | Daftar program |
| `/pengumuman` | Announcements | Daftar pengumuman |
| `/tentang-kami` | About | Tentang kami |
| `/kontak` | Contact | Form kontak |

### Admin Panel (Next.js - port 3000)

| URL | Deskripsi |
|-----|-----------|
| `/admin/dashboard` | Dashboard |
| `/admin/programs` | Kelola program |
| `/admin/announcements` | Kelola pengumuman |
| `/admin/galleries` | Kelola galeri |
| `/admin/contacts` | Kelola kontak |
| `/admin/settings` | Pengaturan |
| `/admin/users` | Kelola users |

### API Endpoints (Laravel - port 8000)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/v1/home` | Data homepage |
| GET | `/api/v1/programs` | List program |
| GET | `/api/v1/programs/{slug}` | Detail program |
| GET | `/api/v1/announcements` | List pengumuman |
| GET | `/api/v1/galleries/recent-photos` | Foto terbaru |
| GET | `/api/v1/galleries/archives` | Arsip galeri |
| GET | `/api/v1/about` | Data organisasi |
| POST | `/api/v1/contact` | Submit kontak |

---

## 🎨 Design System

### Color Palette

```
Navy (Primary)
├── navy-50:  #EEF2FF
├── navy-100: #E0E7FF
├── navy-500: #3B4FA8
├── navy-800: #1B2B6B  ← Navbar, Footer
└── navy-900: #111D4A

Gold (Accent)
├── gold-300: #E8CC7A
├── gold-400: #D4B05A
├── gold-500: #C9A84C  ← Buttons, Accents
└── gold-600: #B8903A
```

---

## 🚀 Cara Menjalankan

### Prasyarat
- PHP ^8.2
- Composer
- Node.js & npm
- MySQL Server

### 1. Backend (Laravel)

```bash
cd kartar-rt-new

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Buat database MySQL
# CREATE DATABASE kartar_rt;

# Run migration
php artisan migrate

# Jalankan server
php artisan serve --port=8000
```

### 2. Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Jalankan server
npm run dev
# → http://localhost:3000
```

### Akses

| Halaman | URL |
|---------|-----|
| Website | http://localhost:3000 |
| Admin Panel | http://localhost:3000/admin |
| API | http://localhost:8000/api/v1 |

---

## 📝 License

MIT License - Kartar-RT Development Team