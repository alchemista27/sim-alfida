const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const units = await prisma.unit.findMany();
  console.log(`Ditemukan ${units.length} unit.`);

  const passwordHash = await bcrypt.hash('admin123', 10);

  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const username = `admin_${unit.slug}`.replace(/-/g, '_');
    const email = `${unit.slug}@alfida.com`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        username,
        fullName: `Admin ${unit.name}`,
        passwordHash,
        groups: ['Admin Unit']
      }
    });

    // Check if role exists
    const existingRole = await prisma.userRoleAssignment.findFirst({
      where: { userId: user.id, role: 'admin_unit', unitId: unit.id }
    });

    if (!existingRole) {
      await prisma.userRoleAssignment.create({
        data: {
          userId: user.id,
          role: 'admin_unit',
          unitId: unit.id
        }
      });
      console.log(`Created admin for ${unit.name} -> ${email}`);
    } else {
      console.log(`Admin for ${unit.name} already exists -> ${email}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
