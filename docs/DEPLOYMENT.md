# Panduan Deployment SIM-Alfida (Production)

Dokumen ini memuat _runbook_ untuk me-_deploy_ SIM-Alfida ke mesin server produksi (VPS).

## 1. Spesifikasi Server Minimal
- OS: Ubuntu 22.04 LTS / 24.04 LTS
- RAM: 2GB (direkomendasikan 4GB untuk *multi-tenant*)
- CPU: 2 Core
- Disk: 20GB SSD

## 2. Prasyarat (*Pre-requisites*)
Pastikan server Anda sudah terinstal:
- [Docker](https://docs.docker.com/engine/install/ubuntu/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Git

## 3. Langkah Instalasi Awal
1. Akses server VPS melalui SSH:
   ```bash
   ssh root@ip_server
   ```
2. Lakukan _clone_ repositori:
   ```bash
   git clone https://github.com/alchemista27/sim-alfida.git /opt/sim-alfida
   cd /opt/sim-alfida
   ```
3. Siapkan _Environment Variables_:
   ```bash
   cp .env.example .env.production.local
   nano .env.production.local
   ```
   *Isi `DATABASE_URL`, `DIRECT_URL`, dan token Cloudinary Anda secara benar.*

## 4. Konfigurasi Domain & SSL (HTTPS)
Agar aplikasi dapat diakses lewat HTTPS, Nginx dan Certbot membutuhkan domain yang valid:
1. Buka file `nginx/sim-alfida.conf`.
2. Ubah `sim.alfida.com` menjadi domain asli Anda.
3. Matikan _comment_ pada baris sertifikat SSL setelah proses *Certbot* sukses.
4. Perintah *generate* sertifikat awal:
   ```bash
   docker-compose -f docker-compose.prod.yml run --rm certbot certonly --webroot --webroot-path /var/www/certbot/ -d domainanda.com
   ```

## 5. Menjalankan Aplikasi
Membangun *image* dan menjalankan *container* di latar belakang:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## 6. Migrasi Database Produksi
Saat pertama kali berjalan atau setelah ada penambahan skema baru:
```bash
docker-compose -f docker-compose.prod.yml exec sim-web pnpm prisma migrate deploy
```
*Gunakan `pnpm prisma db push --accept-data-loss` HANYA jika Anda ingin memaksa perubahan tanpa mempedulikan data lama hilang (biasanya saat testing).*

## 7. Pemeliharaan (*Maintenance*)
- **Melihat Log Aplikasi**: `docker logs -f sim-alfida_sim-web_1`
- **Restart Aplikasi**: `docker-compose -f docker-compose.prod.yml restart sim-web`
- **Menutup Sistem (Down)**: `docker-compose -f docker-compose.prod.yml down`
