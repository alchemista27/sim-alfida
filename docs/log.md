# Log Pekerjaan SIM-Alfida

---

**tanggal:** 08 Agustus 2026 (Sesi 2)
**progress:** 
- Menyelesaikan seluruh fungsionalitas **Sprint 6** (Observasi & Seleksi).
- Membuat *Server Actions* untuk manajemen jadwal (`observation-schedule.ts`), *booking* oleh orang tua (`observation-booking.ts`), penginputan hasil uji (`observation-result.ts`), dan aksi persetujuan kelulusan (`acceptance.ts`).
- Mengimplementasikan sistem **Auto-Ranking** massal yang dipicu saat Observer menyimpan skor nilai tes pendaftar.
- Membuat rancangan cetak `@react-pdf/renderer` untuk **Surat Kelulusan** penerimaan siswa.
- Mengembangkan antarmuka (UI) manajemen jadwal & panel persetujuan hasil seleksi untuk *Admin Unit*, serta portal _dashboard_ khusus untuk guru penilai (*Observer*).
**commit message:** feat: complete sprint 6 observation scheduling, auto-ranking, and acceptance flow

**tanggal:** 08 Agustus 2026
**progress:** 
- Menyelesaikan seluruh fungsionalitas Sprint 5 (Alur Pendaftaran Bagian 2 untuk Orang Tua). 
- Mengimplementasikan unggah banyak berkas (KTP, KK, Akte, dll) yang terintegrasi dengan Cloudinary.
- Mengimplementasikan fitur pembuatan dokumen PDF _on-the-fly_ untuk Surat Pengantar Tes Medis (IMC) menggunakan `@react-pdf/renderer`.
- Menuntaskan UI dasbor verifikasi berkas untuk Tim PPDB yang mencakup *preview* (pratinjau) dokumen, serta fungsi "Loloskan" atau "Tolak" dokumen.
- Melakukan pemisahan arsitektur *Multi-Schema* pada PostgreSQL Prisma, dengan menaruh data spesifik proyek di schema `sim`, dan identitas _user_ di schema `shared`. 
- Menambahkan _Trigger_ fungsi SQL untuk menjaga sinkronisasi otomatis antara Supabase Auth (`auth.users`) dan tabel profil pengguna lokal (`shared.users`).
**commit message:** feat: complete sprint 5 PPDB flow, PDF generation, and multi-schema refactoring

---
