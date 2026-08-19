# Panduan Deployment ke Production (Vercel + Supabase)

Dokumen ini berisi langkah-langkah rilis proyek **SIM-Alfida** ke lingkungan produksi.

## 1. Persiapan Database (Supabase)
1. Buat _project_ baru di [Supabase Dashboard](https://supabase.com).
2. Salin *Database URL* (Mode Transaction Pooler) dan masukkan ke `.env` lokal Anda sebagai `DATABASE_URL`.
3. Salin juga *Direct URL* (Session Mode) untuk keperluan migrasi, masukkan sebagai `DIRECT_URL`.
4. Lakukan pendorongan skema (*schema push*) awal:
   ```bash
   pnpm prisma migrate deploy
   ```
5. *(Opsional)* Lakukan pendorongan data master awal melalui berkas *seed* jika ada (`pnpm prisma db seed`).

## 2. Persiapan Storage (Cloudinary)
Sistem absensi, berkas cuti, dan logo yayasan memerlukan penampungan CDN independen.
1. Salin `CLOUDINARY_URL` dari dasbor Cloudinary Anda.
2. Siapkan _folder_ khusus (contoh: `sim_alfida_prod`) agar tidak tercampur dengan _environment_ _staging_.

## 3. Konfigurasi Vercel
1. Hubungkan repositori GitHub ini ke [Vercel](https://vercel.com).
2. Pada pengaturan _Project Settings_ -> _Environment Variables_, masukkan:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `CLOUDINARY_URL`
3. Pastikan *Build Command* diset ke `pnpm build` atau `next build`.
4. Jalankan siklus *Deployment*.

## 4. Keamanan Pasca-Rilis
- Lakukan pengecekan akun *Super Admin* default, lalu ubah *password* seketika.
- Nonaktifkan akun _dummy/tester_ jika sebelumnya ikut terunggah pada *seed script*.
- Validasi fungsionalitas RLS (Row Level Security) bawaan Supabase jika dikombinasikan dengan Prisma.
