# Panduan Deployment (Turborepo + Next.js + NestJS)

Sistem Informasi Manajemen Alfida sekarang menggunakan arsitektur **Turborepo** yang memisahkan Frontend (Next.js) dan Backend (NestJS). Dokumen ini berisi panduan *deployment* untuk arsitektur terpisah ini.

## Arsitektur Deployment
- **Frontend (Web)**: Vercel / Netlify
- **Backend (API)**: Railway / Render / DigitalOcean App Platform
- **Database**: PostgreSQL (Supabase / Neon / AWS RDS)
- **Auth**: Supabase Auth

---

## 1. Deploy Frontend (Next.js) ke Vercel

Karena kita menggunakan Turborepo, Vercel secara otomatis akan mendeteksi `turbo` dan melakukan *caching* dengan optimal.

### Konfigurasi di Dashboard Vercel:
1. **Framework Preset**: Next.js
2. **Root Directory**: `apps/web` (Atau biarkan kosong dan Vercel akan otomatis mengenali workspace `@sim/web`).
3. **Build Command**: `pnpm build` (atau biarkan default Vercel yang akan membaca `turbo run build`).
4. **Install Command**: `pnpm install`

### Environment Variables (Vercel):
```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
# URL Publik dari backend NestJS yang sudah di-deploy
NEXT_PUBLIC_API_URL=https://api.simalfida.com 
# URL Internal untuk Server Components jika di platform yang sama
API_URL=https://api.simalfida.com 
```

---

## 2. Deploy Backend (NestJS) ke Railway / Render

NestJS berjalan sebagai layanan Node.js (*long-running process*) dan memerlukan *environment* yang mendukung *Docker* atau Node.js murni.

### Opsi A: Deployment via Docker (Rekomendasi)
Di platform seperti Railway atau Render, Anda dapat mendeploy menggunakan Dockerfile.
1. Pastikan `Dockerfile` Anda sudah mendukung Turborepo *prune* untuk package `@sim/api`.
2. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://user:password@host:port/db?schema=public
   SUPABASE_JWT_SECRET=[SECRET_DARI_DASHBOARD_SUPABASE]
   ```

### Opsi B: Deployment via Node.js Build Pack
1. **Build Command**: `pnpm install && pnpm --filter @sim/api build`
2. **Start Command**: `pnpm --filter @sim/api start:prod`
   *(Catatan: Anda mungkin memerlukan `corepack enable` jika platform tidak mendukung pnpm secara native).*

---

## 3. Deployment Database & Prisma

### Migrasi Skema Database
Sangat penting untuk menjalankan migrasi database **sebelum** backend NestJS siap melayani *request*.
Tambahkan *Release Command* di platform hosting backend (Render/Railway):
```bash
pnpm --filter @sim/database prisma db push --accept-data-loss
# atau
pnpm --filter @sim/database prisma migrate deploy
```

### Prisma Client
Setiap proses `build` (baik di Vercel maupun Railway) secara otomatis akan memicu `prisma generate` berkat konfigurasi _workspace_ `@sim/database` milik kita. Tidak ada konfigurasi tambahan yang dibutuhkan!

---

## Tips & Troubleshooting
- **CORS Error**: Jika Frontend di-deploy di `https://simalfida.com` dan API di `https://api.simalfida.com`, pastikan `app.enableCors()` di `apps/api/src/main.ts` telah diizinkan untuk origin frontend Anda.
- **Unauthorized 401**: Jika API menolak request, pastikan Next.js mengirimkan cookie yang valid melalui `apps/web/src/lib/api.ts` dan `SUPABASE_JWT_SECRET` di backend sudah sinkron dengan yang ada di Supabase Dashboard (Settings > API > JWT Secret).
