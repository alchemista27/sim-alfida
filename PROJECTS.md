## Sistem Informasi Manajemen Yayasan Alfida

Sistem informasi Manajemen Yayasan Alfida adalah sistem pengelolaan unit dan sumber daya yayasan alfida yang ditujukan untuk meningkatkan efektivitas dan efisiensi pengelolaan yayasan. Yayasan Alfida memiliki 2 TK, 3 SD, 1 SMP, 1 SMA dan 1 Pesantren Alquran sebagai unit Pendidikannya. Sistem informasi manajemen ini akan memiliki fitur sebagai berikut:
1. Single Sign On (SSO) multi role yang terhubung dengan seluruh modul sistem informasi termasuk dengan Website Yayasan yang berbasis WordPress dan LMS Yayasan yang berbasis Moodle
2. Modul PPDB
3. Modul Akademik
4. Modul Surat Menyurat
5. Modul Manajemen Karyawan dan Absensi
6. Modul Payroll
7. Modul Rekrutmen Tenaga Kerja Baru

## Tech Stack
- **Frontend / Framework**: Next.js 15 (React 19, App Router)
- **Database & Auth**: Supabase (PostgreSQL & Supabase Auth)
- **ORM**: Prisma
- **Storage**: Cloudinary
- **Styling**: TailwindCSS

Secara keseluruhan sistem ini akan memiliki sistem multi tenant dengan pembagian peran sebagai berikut:
1. Super admin bisa menambahkan unit dan mengakses seluruh unit serta modul yang ada
2. Admin unit hanya bisa mengakses fitur-fitur khusus untuk unitnya sendiri dan assign guru atau karyawan yang ber-homebase di unitnya
3. Guru dan Karyawan memiliki akses ke modul manajemen karyawan dan absensi.

Sementara pembagian rolenya masih seperti ini dahulu.

Satu hal yang penting, super admin bisa upload logo yayasan dan admin unit bisa upload logo unit dan tanda tangan kepala sekolah. Ini akan banyak berguna nanti di modul surat menyurat.

### Modul PPDB
Modul ini adalah modul penerimaan peserta didik baru di lingkungan unit di bawah naungan Yayasan Alfida. Alur kerja penggunaan modul ini adalah:
- Super admin membuat unit dan assign admin unit
- Admin unit mengaktifkan tahun ajaran baru yang akan menerima peserta didik baru
- Admin unit menentukan kuota pendaftar
- Orang tua calon siswa akan melakukan registrasi dengan mengisi form Nama Lengkap, Email, Nomor WA/HP, Password, dan Konfirmasi Password
- Setelah registrasi atau saat login, pengguna akan diarahkan ke halaman pemilihan modul utama yang disesuaikan dengan role. Misalnya, orang tua hanya akan melihat modul PPDB dan Akademik, sedangkan admin melihat modul sesuai wewenangnya.
- Setelah memilih modul PPDB, orang tua calon siswa kemudian memilih unit pendidikan yang ingin dia registrasi
- Dalam memilih unit ini, orang tua calon siswa dapat melihat kuota pendaftaran sudah full atau belum
- Setelah memilih Unit, orang tua akan diarahkan untuk melakukan pembayaran pendaftaran (untuk sementara menggunakan transfer manual ke rekening Yayasan, nanti kedepannya akan menggunakan payment gateway DOKU/Midtrans/Duitku/Xendit)
- Setelah melakukan pembayaran orang tua calon siswa harus menunggu status pembayaran terverifikasi (sementara oleh admin dulu, nanti setelah implementasi payment gateway bisa langsung otomatis)
- Orang tua mengisi formulir data siswa, dan data orang tua/wali (yang berisi: Nama Lengkap, Panggilan, Jenis Kelamin, Agama - Islam, Tempat Lahir, Tanggal Lahir - format DDMMYYYY, NISN, Jumlah saudara, Alamat lengkap, Alat transportasi, Hobi dan Cita-cita)
- Orang tua mengisi formulir data orang tua (ayah dan ibu)
- Orang tua selanjutnya mengunggah berkas (Pasfoto calon siswa, Surat keterangan sekolah sebelumnya, Akte kelahiran, Kartu keluarga, KTP ayah, dan KTP Ibu)
- Orang tua kemudian mendownload surat pengantar pemeriksaan ke klinik IMC (Iqra Medical Centre), Kop surat menggunakan logo unit dan logo yayasan yang sudah diupload sebelumnya oleh super admin dan admin unit. Surat sudah tertandatangani karena admin unit mengunggah tanda tangan kepala sekolah.
- Setelah pemeriksaan di IMC, hasil pemeriksaan diunggah di portal PPDB oleh orang tua
- Tim PPDB setiap unit memeriksa berkas yang sudah diunggah orang tua calon siswa dan menentukan peserta yang lolos ke tahap observasi
- Admin unit mengatur jadwal dan kuota harian observasi
- Orang tua memilih jadwal observasi
- Observer menginput hasil observasi dan langsung tersusun menjadi peringkat mengisi kuota siswa yang diterima
- Setelah semua proses, admin unit langsung assign siswa baru ke kelas sesuai dengan kelas paralel yang ada
- Orang tua yang anaknya dinyatakan lulus bisa download dan print surat keterangan lulus
- Orang tua yang anaknya dinyatakan lulus kemudian diarahkan untuk login ke modul akademik untuk proses daftar ulang dan tahapan selanjutnya.

### Modul akademik
Modul ini adalah modul khusus pengelolaan akademik yayasan dan seluruh unit pendidikan di bawah yayasan alfida. Dalam modul ini akan ada beberapa fitur:
- Fitur daftar ulang untuk siswa lama dan siswa yang baru diterima melalui PPDB oleh orang tua siswa
- Fitur input mata pelajaran untuk admin unit
- Fitur input nilai harian, nilai ujian, nilai asesmen tengah semester, nilai asesmen akhir semester, yang otomatis menjadi nilai di LHBS untuk guru mata pelajaran
- Fitur absensi siswa untuk guru mata pelajaran
- Fitur isi jurnal pembelajaran harian untuk guru mata pelajaran
- Fitur input program tahunan, program semester, dan rencana pelaksanaan pembelajaran untuk guru mata pelajaran
- Fitur bayar spp dan biaya lain untuk orang tua siswa
- Fitur generate LHBS untu wali kelas
- Fitur menambahkan mata pelajaran untuk admin unit
- Fitur assign guru mata pelajaran oleh admin unit
- FItur assign wali kelas oleh admin unit
- Fitur menambahkan guru baru oleh admin unit
- Fitur input jadwal mata pelajaran oleh wali kelas dan admin unit
- Fitur menambahkan ekstrakurikuler dan assign pembina ekstrakurikuler oleh admin unit
- Fitur mengisi jurnal kegiatan ekstrakurikuler dan input nilai ekstrakurikuler oleh pembina ekstrakurikuler
- Fitur input jadwal ekstrakurikuler oleh pembina ekstrakurikuler
- Fitur pilih ekskul untuk siswa oleh orang tua
- Fitur melihat dan cetak (pdf) jadwal pelajaran dan lihat dan cetak (pdf) jadwal ekstrakurikuler siswa oleh orang tua siswa
- Fitur melihat LHBS tengah semester dan LHBS akhir semester oleh orang tua siswa
- Fitur menentukan kenaikan kelas untuk wali kelas
- Fitur melihat keputusan kenaikan kelas siswa oleh orang tua
- LHBS, jadwal pelajaran, jadwal ekstrakurikuler, Program tahunan, program semester, rpp, dan keputusan kenaikan kelas bisa didownload dalam bentuk pdf dengan kop dan logo yang diupload admin unit (logo unit) dan super admin (logo yayasan)

### Modul Surat Menyurat
TBA

### Modul Manajemen Karyawan dan Absen
Modul ini adalah modul pengelolaan karyawan dan guru yang ada di lingkungan Yayasan Alfida Bengkulu. Modul ini memiliki fitur sebagai berikut:
- Super admin memiliki akses ke rekap nama-nama karyawan dan guru yang ada di lingkungan yayasan alfida dan semua rekapan dari masing-masing bidang
- Super admin bisa membuat bidang dan assign user untuk menjadi admin bidang
- Admin kepegawaian memiliki akses untuk merekap kehadiran karyawan dan guru
- Admin kepegawaian memiliki akses untuk assign guru dan karyawan ke unit yang ada
- Admin kepegawaian memiliki akses untuk menambahkan guru atau karyawan dan assign unit
- Admin Unit memiliki akses untuk menentukan titik lokasi koordinat absen by gps, radius absen dan seeding tanggal merah dan jadwal libur
- Admin unit bisa menambahkan guru dan karyawan yang bertugas di unit
- Admin bina pribadi islam memiliki akses untuk membuat kelompok UPA/Liqo, assign guru atau ustadz sebagai murobbi kelompok UPA/Liqo, rekap kehadiran peserta kelompok Liqo dan rekap laporan wajibat (sholat wajib, puasa kamis, infaq, baca alquran, sholat sunnah) masing-masing kelompok liqo
- Murobbi bisa mengakses fitur atur jadwal, update laporan kegiatan liqo, input kehadiran anggota kelompok, input laporan wajibat peserta.
- Admin masing-masing bidang bisa input program kerja, laporan kegiatan bulanan, dan laporan kegiatan mingguan.
- Guru dan karyawan bisa melakukan absen dengan GPS, akses jadwal UPA/liqo, mengajukan izin (cuti, sakit atau izin)
- Tambahkan satu unit khusus yaitu Kantor Yayasan (Bukan unit pendidikan)

### Modul Payroll
TBA

### Modul Rekrutmen Tenaga Kerja Baru
TBA