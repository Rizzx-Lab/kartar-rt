# PWA Install Prompt Redesign

## Konteks

Aplikasi web Armalo Eluf memiliki fitur PWA (Progressive Web App) yang memungkinkan admin panel diinstal ke home screen perangkat user. Sistem ini sudah memiliki:

- **Backend mechanism**: Reset status PWA install per user oleh super admin
- **Frontend component**: `PWAInstallPrompt` di `/components/ui/pwa-install-prompt.tsx`
- **Scope**: Hanya `/admin` yang bisa diinstal sebagai PWA

### Existing Flow (Sebelum Redesign)

1. User login via browser → Banner fixed bottom muncul di bottom screen
2. Banner punya info langkah install + tombol dismiss + tombol install
3. Ada juga info box kuning di header admin dengan tombol install kecil
4. User bisa dismiss banner → tidak muncul sampai session baru
5. Super admin bisa reset status user → user bisa lihat banner lagi

### Issue

1. **Kompleks & tidak konsisten**: Ada 2 tempat untuk install (banner bottom + info box kuning)
2. **Banner bottom mengganggu UX**: Menutupi content
3. **Dismiss logic membingungkan**: User bisa dismiss tapi kotak kuning tetap muncul
4. **Tidak sync dengan backend**: Status install tidak tercatat di database

---

## Goals

1. **Simplifikasi UI**: Hanya satu tempat untuk install (info box kuning di header)
2. **Konsisten**: Kotak kuning selalu tampil di browser (selama bukan standalone)
3. **Minimalis**: Kotak kuning hanya berisi tombol "Install App"
4. **Standalone detection**: Kotak kuning tidak muncul saat user sudah di PWA mode
5. **Backend sync**: Tetap terhubung dengan reset mechanism oleh super admin

---

## To-Do

### Phase 1: Dokumentasi
- [x] Buat file dokumentasi ini

### Phase 2: Redesain Component
- [x] Hapus banner fixed bottom
- [x] Hapus info box iOS dengan langkah-langkah install
- [x] Hapus tombol install kecil di toolbar
- [x] Hapus dismiss logic & sessionStorage
- [x] Hapus alert instructions
- [x] Buat kotak kuning dengan tombol install saja
- [x] Logic: tampil di browser, sembunyi di standalone

### Phase 3: Verifikasi
- [x] Import di admin layout (admin-layout-client.tsx:290) - OK
- [x] Reset button di /admin/users - OK
- [ ] Test di browser (Chrome DevTools)
- [ ] Test standalone mode detection

---

## Referensi File

### Backend (Tidak Berubah)
- `/backend/app/Http/Controllers/Api/PwaController.php` - resetPwa function
- `/backend/routes/api.php` - route resetPwa

### Frontend
- `/frontend/components/ui/pwa-install-prompt.tsx` - **DALAM PERUBAHAN**
- `/frontend/app/admin/layout.tsx` - import PWAInstallPrompt (tetap)
- `/frontend/app/admin/users/page.tsx` - reset button (tetap)
- `/frontend/lib/admin-api.ts` - API functions (tetap)

### Config
- `/frontend/next.config.js` - PWA configuration
- `/frontend/public/manifest.json` - PWA manifest
- `/frontend/public/admin/manifest.json` - Admin PWA manifest
