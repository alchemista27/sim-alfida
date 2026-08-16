import { PrismaClient, UserRole } from "@prisma/client";
import * as xlsx from "xlsx";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const workbook = xlsx.readFile("sistem-data/data-sso-pegawai.xlsx");
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json<any>(sheet);

  // Find SD Iqra 1
  const sdIqra1 = await prisma.unit.findUnique({
    where: { slug: "sd-iqra-1" }
  });

  if (!sdIqra1) {
    throw new Error("Unit sd-iqra-1 not found");
  }

  // Find a guru in excel
  const guruExcel = data.find(d => d.roles && d.roles.includes("guru"));
  if (!guruExcel) {
    throw new Error("No guru found in Excel");
  }

  console.log(`Found guru: ${guruExcel.first_name} ${guruExcel.last_name} (${guruExcel.email})`);

  // Hash password
  const passwordHash = await bcrypt.hash(guruExcel.password, 10);

  // Check if exists
  let user = await prisma.user.findUnique({
    where: { email: guruExcel.email }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: guruExcel.id,
        email: guruExcel.email,
        username: guruExcel.username,
        firstName: guruExcel.first_name,
        lastName: guruExcel.last_name,
        fullName: `${guruExcel.first_name} ${guruExcel.last_name}`,
        passwordHash,
        groups: guruExcel.groups ? guruExcel.groups.split(";") : [],
        isActive: true,
      }
    });
    console.log("User created in Prisma.");
  } else {
    console.log("User already exists in Prisma.");
  }

  // Assign role guru
  const existingRole = await prisma.userRoleAssignment.findFirst({
    where: {
      userId: user.id,
      unitId: sdIqra1.id,
      role: UserRole.guru,
    }
  });

  if (!existingRole) {
    await prisma.userRoleAssignment.create({
      data: {
        userId: user.id,
        unitId: sdIqra1.id,
        role: UserRole.guru,
      }
    });
    console.log("Role guru assigned to sd-iqra-1.");
  } else {
    console.log("User already has guru role in sd-iqra-1.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
