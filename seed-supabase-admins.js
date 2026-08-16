require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const prisma = new PrismaClient();

async function main() {
  const units = await prisma.unit.findMany();
  console.log(`Menemukan ${units.length} unit.`);

  const passwordHash = await bcrypt.hash('admin123', 10);

  for (const unit of units) {
    const username = `admin_${unit.slug}`.replace(/-/g, '_');
    const email = `${unit.slug}@alfida.com`;
    const fullName = `Admin ${unit.name}`;

    // Hapus data lama di Prisma jika ada (agar UUID bisa di-set ulang ke UUID Supabase)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      await prisma.userRoleAssignment.deleteMany({ where: { userId: existingUser.id } });
      await prisma.user.delete({ where: { id: existingUser.id } });
    }

    // Buat akun di Supabase Auth (auth.users)
    let authUserId;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: 'admin123',
      options: {
        data: { full_name: fullName }
      }
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('already exists') || authError.status === 422) {
        console.log(`Supabase User sudah ada: ${email}, mencoba login untuk mengambil ID...`);
        const { data: signData, error: signError } = await supabase.auth.signInWithPassword({
          email,
          password: 'admin123'
        });
        if (!signError && signData.user) {
          authUserId = signData.user.id;
          console.log(`Berhasil mendapatkan ID dari login: ${authUserId}`);
        } else {
          console.error(`Gagal login untuk mengambil ID ${email}:`, signError?.message);
          continue;
        }
      } else {
        console.error(`Gagal membuat Supabase Auth untuk ${email}:`, authError);
        continue;
      }
    } else {
      authUserId = authData.user.id;
      console.log(`Sukses buat Supabase Auth untuk: ${email} (ID: ${authUserId})`);
    }

    if (!authUserId) {
      console.log(`Lewati ${email} karena ID tidak ditemukan.`);
      continue;
    }

    // Sinkronisasi ke Prisma
    const user = await prisma.user.upsert({
      where: { id: authUserId },
      update: {
        email,
        username,
        fullName,
        passwordHash,
        groups: ['Admin Unit']
      },
      create: {
        id: authUserId,
        email,
        username,
        fullName,
        passwordHash,
        groups: ['Admin Unit']
      }
    });

    // Beri role
    await prisma.userRoleAssignment.upsert({
      where: { id: `${user.id}-${unit.id}` }, // If no unique ID is defined, this might fail, wait, we don't have unique constraint on userId+role+unitId
      update: { role: 'admin_unit', unitId: unit.id },
      create: {
        userId: user.id,
        role: 'admin_unit',
        unitId: unit.id
      }
    }).catch(async (e) => {
       // If upsert fails because of no unique constraint, just check and create
       const existingRole = await prisma.userRoleAssignment.findFirst({
         where: { userId: user.id, role: 'admin_unit', unitId: unit.id }
       });
       if (!existingRole) {
         await prisma.userRoleAssignment.create({
           data: { userId: user.id, role: 'admin_unit', unitId: unit.id }
         });
       }
    });
    
    console.log(`✅ Selesai disinkronisasi: ${email}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
