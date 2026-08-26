import { PrismaClient } from "@/generated/client";
import * as fs from "fs";
import * as xlsx from "xlsx";

const prisma = new PrismaClient();

async function main() {
  // 1. Baca data excel asli untuk memetakan email ke password aslinya
  console.log("Membaca data sso lama untuk referensi password...");
  const workbook = xlsx.readFile("sistem-data/data-sso-pegawai.xlsx");
  const originalData = xlsx.utils.sheet_to_json<any>(workbook.Sheets[workbook.SheetNames[0]]);
  
  const passwordMap = new Map<string, string>();
  for (const row of originalData) {
    if (row.email && row.password) {
      passwordMap.set(row.email.toLowerCase(), row.password);
    }
  }

  // 2. Ambil data dari database
  const users = await prisma.user.findMany({
    include: {
      roles: {
        include: {
          unit: true,
        },
      },
    },
  });

  const headers = ["id", "username", "email", "first_name", "last_name", "roles", "groups", "password"];
  const rows = [headers.join(",")];

  for (const user of users) {
    const nameParts = user.fullName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");
    const username = user.email.split("@")[0];

    const roles = Array.from(new Set(user.roles.map(r => r.role))).join(";");
    const groups = Array.from(new Set(user.roles.map(r => r.unit?.name).filter(Boolean))).join(";");

    // Ambil password presisi dari map excel lama, jika user baru gunakan fallback
    const exactPassword = passwordMap.get(user.email.toLowerCase()) || "";

    const row = [
      user.id,
      username,
      user.email,
      firstName,
      lastName,
      roles,
      groups,
      exactPassword
    ].map(field => `"${field || ""}"`).join(",");
    
    rows.push(row);
  }

  const outputPath = "sistem-data/export-sso-pegawai.csv";
  fs.writeFileSync(outputPath, rows.join("\n"));
  console.log(`Berhasil mengekspor ${users.length} pengguna ke ${outputPath} dengan password presisi.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
