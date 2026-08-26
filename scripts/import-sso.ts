import { PrismaClient, UnitLevel, UserRole } from "@/generated/client";
import * as xlsx from "xlsx";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const roleMapping: Record<string, UserRole> = {
  superadmin: UserRole.super_admin,
  staf_tu: UserRole.karyawan,
  wakasek_bidang_sarpras: UserRole.admin_bidang,
  wakasek_bidang_kesiswaan: UserRole.admin_bidang,
  guru_mapel: UserRole.guru,
  kepala_sekolah: UserRole.admin_unit,
  satpam: UserRole.karyawan,
  wakasek_bidang_humas: UserRole.admin_bidang,
  wali_kelas: UserRole.guru,
  wakasek_bidang_kurikulum: UserRole.admin_bidang,
  cleaning_service: UserRole.karyawan,
};

const unitMapping: Record<string, string> = {
  "Kantor Yayasan": "kantor-yayasan",
  "PQA dan Asrama": "pesantren-alfida",
  "Lazis": "lazis",
  "Paud Sawah Lebar": "tk-auladuna-1",
  "Paud Sukarami": "tk-auladuna-2",
  "sdit 3": "sd-iqra-3",
  "sdit 1": "sd-iqra-1",
  "sdit 2": "sd-iqra-2",
  "smpit": "smp-iqra",
  "smait": "sma-iqra",
  "Asrama Yatim": "asrama-yatim",
};

async function main() {
  console.log("Importing from sistem-data/data-sso-pegawai.xlsx...");

  const workbook = xlsx.readFile("sistem-data/data-sso-pegawai.xlsx");
  const data = xlsx.utils.sheet_to_json<any>(workbook.Sheets[workbook.SheetNames[0]]);

  const units = await prisma.unit.findMany();
  const unitBySlug = new Map(units.map(u => [u.slug, u.id]));

  // Create missing units
  for (const [groupName, slug] of Object.entries(unitMapping)) {
    if (!unitBySlug.has(slug)) {
      console.log(`Creating missing unit: ${groupName} (${slug})`);
      const newUnit = await prisma.unit.create({
        data: {
          name: groupName,
          slug: slug,
          level: UnitLevel.kantor_yayasan,
          isActive: true,
        }
      });
      unitBySlug.set(slug, newUnit.id);
    }
  }

  console.log(`Found ${data.length} records to import.`);
  let successCount = 0;

  for (const row of data) {
    if (!row.email) continue;
    
    const fullName = `${row.first_name || ""} ${row.last_name || ""}`.trim() || row.username;
    
    // Auth with Supabase
    let accId = null;
    let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: row.email,
      password: row.password,
    });

    if (authError || !authData?.user) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: row.email,
        password: row.password,
      });
      if (!signUpError && signUpData?.user) {
        accId = signUpData.user.id;
      } else {
        console.warn(`Failed to auth/create user in Supabase for ${row.email}:`, signUpError?.message);
      }
    } else {
      accId = authData.user.id;
    }

    if (!accId) continue;

    // Create or update User
    const userRecord = await prisma.user.upsert({
      where: { email: row.email },
      update: { id: accId, fullName },
      create: {
        id: accId,
        fullName,
        email: row.email,
        passwordHash: "managed_by_supabase",
        phone: "08110000" + Math.floor(Math.random() * 9999),
        isActive: true,
      },
    });

    // Assign roles & groups
    const rawRoles = row.roles ? row.roles.split(";") : [];
    const rawGroups = row.groups ? row.groups.split(";") : [];

    const parsedRoles = new Set(rawRoles.map((r: string) => roleMapping[r.trim()]).filter(Boolean));
    const parsedUnitIds = new Set(rawGroups.map((g: string) => unitBySlug.get(unitMapping[g.trim()])).filter(Boolean));

    // If they have no role mapped but are in excel, default to karyawan
    if (parsedRoles.size === 0) parsedRoles.add(UserRole.karyawan);
    
    for (const role of Array.from(parsedRoles)) {
      if (parsedUnitIds.size > 0) {
        for (const unitId of Array.from(parsedUnitIds)) {
          await prisma.userRoleAssignment.upsert({
            where: {
              userId_role_unitId: {
                userId: userRecord.id,
                role: role as UserRole,
                unitId: unitId as string,
              }
            },
            update: {},
            create: {
              userId: userRecord.id,
              role: role as UserRole,
              unitId: unitId as string,
            }
          });
        }
      } else {
        // Global
        await prisma.userRoleAssignment.create({
          data: {
            userId: userRecord.id,
            role: role as UserRole,
            unitId: null,
          }
        }).catch(() => {}); // ignore uniqueness error
      }
    }
    
    successCount++;
  }

  console.log(`Successfully imported ${successCount} users.`);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
