import { PrismaClient, UnitLevel, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding SIM-Alfida initial data...");

  // 1. Foundation Settings
  const foundation = await prisma.foundationSettings.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      foundationName: "Yayasan Alfida",
      bankName: "Bank Syariah Indonesia (BSI)",
      bankAccountNumber: "7121234567",
      bankAccountHolder: "Yayasan Alfida",
    },
  });
  console.log("✓ Foundation Settings initialized:", foundation.foundationName);

  // 2. 8 Educational Units
  const unitsData = [
    { name: "TK Islam Terpadu Auladuna 1", slug: "tk-auladuna-1", level: UnitLevel.tk },
    { name: "TK Islam Terpadu Auladuna 2", slug: "tk-auladuna-2", level: UnitLevel.tk },
    { name: "SD Islam Terpadu Iqra 1", slug: "sd-iqra-1", level: UnitLevel.sd },
    { name: "SD Islam Terpadu Iqra 2", slug: "sd-iqra-2", level: UnitLevel.sd },
    { name: "SD Islam Terpadu Iqra 3", slug: "sd-iqra-3", level: UnitLevel.sd },
    { name: "SMP Islam Terpadu Iqra", slug: "smp-iqra", level: UnitLevel.smp },
    { name: "SMA Islam Terpadu Iqra", slug: "sma-iqra", level: UnitLevel.sma },
    { name: "Pesantren Quran Alfida", slug: "pesantren-alfida", level: UnitLevel.pesantren },
  ];

  const createdUnits = [];
  for (const u of unitsData) {
    const unit = await prisma.unit.upsert({
      where: { slug: u.slug },
      update: { name: u.name, level: u.level },
      create: {
        name: u.name,
        slug: u.slug,
        level: u.level,
        isActive: true,
      },
    });

    // Create unit settings if not exists
    await prisma.unitSettings.upsert({
      where: { unitId: unit.id },
      update: {},
      create: {
        unitId: unit.id,
        principalName: `Kepala Sekolah ${unit.name}`,
      },
    });

    createdUnits.push(unit);
  }
  console.log(`✓ ${createdUnits.length} Units & Settings created.`);

  // 3. Super Admin User
  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let superAdminId = "00000000-0000-0000-0000-000000000002";

  // Try to sign in first to get the existing user ID
  let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "admin@alfida.com",
    password: "Password123!",
  });

  if (authError || !authData?.user) {
    // If sign in fails, try to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: "admin@alfida.com",
      password: "Password123!",
    });
    
    if (signUpError || !signUpData?.user) {
      console.warn("Could not create/fetch Supabase user, using default ID. Error:", signUpError?.message);
    } else {
      superAdminId = signUpData.user.id;
    }
  } else {
    superAdminId = authData.user.id;
  }

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@alfida.com" },
    update: { id: superAdminId },
    create: {
      id: superAdminId,
      fullName: "Super Admin",
      email: "admin@alfida.com",
      phone: "081234567890",
      passwordHash: "managed_by_supabase",
      isActive: true,
    },
  });

  // Assign Super Admin Role
  const existingRole = await prisma.userRoleAssignment.findFirst({
    where: {
      userId: superAdmin.id,
      role: UserRole.super_admin,
    },
  });

  if (!existingRole) {
    await prisma.userRoleAssignment.create({
      data: {
        userId: superAdmin.id,
        role: UserRole.super_admin,
        unitId: null,
      },
    });
  }
  console.log("✓ Super Admin initialized:", superAdmin.email);

  // 4. Demo Academic Year for TK Auladuna 1
  const tk1 = createdUnits.find((u) => u.slug === "tk-auladuna-1");
  if (tk1) {
    await prisma.academicYear.upsert({
      where: {
        unitId_name: {
          unitId: tk1.id,
          name: "2026/2027",
        },
      },
      update: {},
      create: {
        unitId: tk1.id,
        name: "2026/2027",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-06-30"),
        ppdbActive: true,
        quota: 30,
        registered: 18,
      },
    });
    console.log("✓ Demo Academic Year 2026/2027 created for TK IT Auladuna 1.");
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
