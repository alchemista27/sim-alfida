"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { UserRole } from "@sim/database";

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

    // Prepare JSON payload for the RPC
    const payload = usersData.filter(row => row.email).map(row => ({
      id: row.id || undefined,
      email: row.email,
      password: row.password || 'password123',
      username: row.username,
      fullName: row.first_name || row.last_name 
        ? `${row.first_name || ''} ${row.last_name || ''}`.trim() 
        : row.username || 'Pegawai',
      first_name: row.first_name,
      last_name: row.last_name,
      groups: row.groups ? String(row.groups).split(';').map((g: string) => g.trim()) : [],
      roles: row.roles ? String(row.roles).split(';').map((r: string) => mapRole(r.trim())) : ['karyawan']
    }));

    if (payload.length === 0) {
      return { success: false, error: "Tidak ada data dengan email valid." };
    }

    // Call the Postgres RPC (super fast, avoids Vercel 10s timeout, handles Auth + Prisma)
    const result: any = await prisma.$queryRaw`
      SELECT batch_import_users_rpc(${JSON.stringify(payload)}::jsonb) as res
    `;

    const rpcData = result[0]?.res;

    // After importing users, we need to assign roles and groups via Prisma Bulk
    // (Since the RPC handles auth.users and shared.users, but not roles/groups mappings which are complex)
    const emails = payload.map(p => p.email);
    const importedUsers = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { id: true, email: true }
    });
    const userMap = new Map(importedUsers.map(u => [u.email, u.id]));

    const rolesToCreate: { userId: string, role: UserRole }[] = [];
    for (const p of payload) {
      const uid = userMap.get(p.email);
      if (uid) {
        for (const role of p.roles) {
          rolesToCreate.push({ userId: uid, role: role as UserRole });
        }
      }
    }

    // Upsert roles (ignore if exists using createMany skipDuplicates if possible, but skipDuplicates is only available on some DBs)
    // Actually, createMany with skipDuplicates is supported in Postgres
    if (rolesToCreate.length > 0) {
      await prisma.userRoleAssignment.createMany({
        data: rolesToCreate,
        skipDuplicates: true
      });
    }

    revalidatePath("/admin/users");
    return { success: true, imported: rpcData?.count || 0 };
  } catch (error: any) {
    console.error("Batch import failed:", error);
    return { success: false, error: error.message || "Gagal import." };
  }
}
