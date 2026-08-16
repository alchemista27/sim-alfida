require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const unit = await prisma.unit.findFirst({
    where: { name: 'TK Islam Terpadu Auladuna 1' }
  });

  if (!unit) {
    console.error('Unit TK Auladuna 1 tidak ditemukan!');
    return;
  }

  // Cari academic year aktif
  let activeYear = await prisma.academicYear.findFirst({
    where: { unitId: unit.id, ppdbActive: true }
  });

  if (!activeYear) {
    activeYear = await prisma.academicYear.create({
      data: {
        unitId: unit.id,
        name: '2026/2027',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-06-30'),
        quota: 30,
        ppdbActive: true
      }
    });
    console.log('Created active academic year for TK Auladuna 1');
  }

  // Buat akun parent dummy
  let parent = await prisma.user.findFirst({ where: { email: 'ortu.dummy@alfida.com' } });
  if (!parent) {
    parent = await prisma.user.create({
      data: {
        email: 'ortu.dummy@alfida.com',
        fullName: 'Bapak Ahmad Dummy',
        passwordHash: 'dummyhash',
        roles: {
          create: { role: 'orang_tua' }
        }
      }
    });
  }

  // Jika pendaftarannya kurang dari 18, tambahkan
  const count = await prisma.registration.count({
    where: { academicYearId: activeYear.id }
  });

  const needed = 18 - count;
  if (needed <= 0) {
    console.log('Sudah ada 18 pendaftar (atau lebih) di database.');
    return;
  }

  const statuses = [
    'pending_payment', 'pending_payment', 'pending_payment', 
    'payment_uploaded', 'payment_uploaded', 'payment_uploaded',
    'verification', 'verification',
    'observation_scheduled', 'observation_done', 'accepted', 'accepted', 'accepted',
    'accepted', 'accepted', 'enrolled', 'rejected', 'form_filling'
  ];

  console.log(`Membuat ${needed} pendaftar dummy...`);

  for (let i = 0; i < needed; i++) {
    const num = String(count + i + 1).padStart(4, '0');
    const statusIdx = i % statuses.length;
    
    // Create registration
    const reg = await prisma.registration.create({
      data: {
        academicYearId: activeYear.id,
        parentId: parent.id,
        registrationNumber: `PPDB-TKA1-2026-${num}`,
        status: statuses[statusIdx]
      }
    });

    // Create student data
    await prisma.studentData.create({
      data: {
        registrationId: reg.id,
        fullName: `Siswa Dummy ${num}`,
        gender: i % 2 === 0 ? 'male' : 'female',
        birthPlace: 'Jakarta',
        birthDate: new Date('2020-01-01'),
        religion: 'Islam',
        address: 'Jl. Dummy No. 123'
      }
    });
  }

  console.log(`Berhasil menambahkan pendaftar! Total sekarang: 18`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
