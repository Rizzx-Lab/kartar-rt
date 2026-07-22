# Fix Session Display - Detail Kegiatan

## Konteks

Halaman detail kegiatan (`/kegiatan/[slug]`) memiliki fitur sesi/langkah kegiatan. Ada beberapa masalah yang perlu diperbaiki:

### Masalah 1: "Sesi Berikutnya" Menampilkan Data Salah
- **Current behavior**: Menampilkan session pertama dari array (biasanya yang paling lama/pertama dibuat)
- **Expected behavior**: Menampilkan sesi dengan tanggal terdekat dari sekarang (dari sesi yang berstatus "Akan Datang")

### Masalah 2: Status Sesi Tidak Auto-Calculated
- **Current behavior**: Status bergantung sepenuhnya dari database
- **Expected behavior**: Auto-calculate berdasarkan tanggal sekarang
  - `now < held_at` → "Akan Datang" (upcoming)
  - `now > held_at` → "Selesai" (done)
  - Status "cancelled" dari DB tetap dipertahankan (priority)

### Masalah 3: Daftar Sesi Terlalu Panjang
- **Current behavior**: Semua sesi ditampilkan dalam list panjang
- **Expected behavior**: Tampilan compact, bisa di-expand jika user mau lihat semua

---

## Goals

1. **Sesi Berikutnya** - tampilkan sesi upcoming dengan tanggal terdekat
2. **Auto Status** - hitung status berdasarkan tanggal sekarang
3. **Compact View** - tampilan tidak terlalu panjang, ada limit/collapse

---

## To-Do

### Phase 1: Dokumentasi
- [x] Buat file dokumentasi ini

### Phase 2: Fix Logic
- [x] Fix sorting "Sesi Berikutnya" - cari sesi upcoming dengan `held_at` terdekat
- [x] Auto-calculate status sesi berdasarkan tanggal sekarang
- [x] Buat tampilan sessions list menjadi collapsible (limit 5 item)

### Phase 3: Verifikasi
- [x] Import dan usage komponen - OK
- [ ] Test sorting Sesi Berikutnya
- [ ] Test auto status calculation
- [ ] Test collapsible sessions list

---

## Referensi File

### Frontend
- `/frontend/app/kegiatan/[slug]/page.tsx` - **DALAM PERUBAHAN**
- `/frontend/lib/api.ts` - Session interface

### Backend (Tidak Berubah)
- `/backend/app/Http/Controllers/Api/ProgramController.php` - session data dari API
