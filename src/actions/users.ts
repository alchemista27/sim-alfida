"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
// Catatan: Jika ini dipakai bersama Supabase Auth, maka idealnya kita memanggil Supabase Admin API 
// untuk mendaftarkan akun auth (auth.users) sekaligus menyimpan ke tabel lokal.
// Namun karena struktur SSO, kita asumsikan integrasi via Prisma terlebih dahulu.

export async function batchImportUsers(csvText: string) {
  try {
    const lines = csvText.split('\n').filter(l => l.trim() !== '');
    if (lines.length < 2) return { success: false, error: "File CSV kosong atau tidak memiliki data." };

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    let imported = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || null;
      });

      // Abaikan jika tidak ada email
      if (!row.email) continue;

      const hashedPassword = await bcrypt.hash(row.password || 'password123', 10);
      const groups = row.groups ? row.groups.split(';').map((g: string) => g.trim()) : [];
      
      const fullName = row.first_name || row.last_name ? `${row.first_name || ''} ${row.last_name || ''}`.trim() : row.username || 'User';

      await prisma.user.upsert({
        where: { email: row.email },
        update: {
          username: row.username,
          firstName: row.first_name,
          lastName: row.last_name,
          fullName: fullName,
          groups: groups,
        },
        create: {
          email: row.email,
          username: row.username,
          firstName: row.first_name,
          lastName: row.last_name,
          fullName: fullName,
          groups: groups,
          passwordHash: hashedPassword,
        }
      });
      imported++;
    }

    revalidatePath("/admin/users");
    return { success: true, count: imported };
  } catch (error: any) {
    console.error("Batch import failed:", error);
    return { success: false, error: error.message || "Gagal melakukan batch import" };
  }
}
