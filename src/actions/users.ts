"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

function mapRole(roleStr: string): UserRole {
  const r = roleStr.toLowerCase();
  if (r.includes('super')) return UserRole.super_admin;
  if (r.includes('admin') || r.includes('tu') || r.includes('staf')) return UserRole.admin_unit;
  if (r.includes('guru') || r.includes('pengajar')) return UserRole.guru;
  if (r.includes('karyawan')) return UserRole.karyawan;
  if (r.includes('ppdb')) return UserRole.tim_ppdb;
  if (r.includes('observer')) return UserRole.observer;
  return UserRole.orang_tua; // default fallback
}

export async function batchImportUsers(usersData: any[]) {
  try {
    if (!usersData || usersData.length === 0) {
      return { success: false, error: "Data kosong." };
    }

    let imported = 0;

    for (const row of usersData) {
      // Abaikan jika tidak ada email
      if (!row.email) continue;

      const hashedPassword = await bcrypt.hash(row.password || 'password123', 10);
      const groups = row.groups ? String(row.groups).split(';').map((g: string) => g.trim()) : [];
      
      const fullName = row.first_name || row.last_name 
        ? `${row.first_name || ''} ${row.last_name || ''}`.trim() 
        : row.username || 'Pegawai';

      const roleStrings = row.roles ? String(row.roles).split(';') : ['karyawan'];
      const rolesToAssign = [...new Set(roleStrings.map(r => mapRole(r.trim())))];

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
          id: row.id || undefined, // Gunakan UUID dari file jika ada
          email: row.email,
          username: row.username,
          firstName: row.first_name,
          lastName: row.last_name,
          fullName: fullName,
          groups: groups,
          passwordHash: hashedPassword,
          roles: {
            create: rolesToAssign.map(r => ({ role: r }))
          }
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
