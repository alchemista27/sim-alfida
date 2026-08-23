"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { AssignStaffSchema, type AssignStaffInput } from "@/lib/validators/department";

export async function getStaffAssignments() {
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian, UserRole.admin_unit, UserRole.admin_unit_nondik]);
  
  // Ambil user yang berpotensi menjadi staf/guru
  return await prisma.user.findMany({
    include: {
      roles: {
        include: {
          unit: true
        }
      }
    },
    orderBy: { fullName: "asc" }
  });
}

export async function assignStaffToUnit(data: AssignStaffInput) {
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian, UserRole.admin_unit, UserRole.admin_unit_nondik]);
  const parsed = AssignStaffSchema.parse(data);

  // Periksa apakah role sudah ada di unit tersebut
  const existingRole = await prisma.userRoleAssignment.findFirst({
    where: {
      userId: parsed.userId,
      role: parsed.role,
      unitId: parsed.unitId,
    }
  });

  if (!existingRole) {
    await prisma.userRoleAssignment.create({
      data: {
        userId: parsed.userId,
        role: parsed.role,
        unitId: parsed.unitId,
      }
    });
  }

  revalidatePath("/admin/staff");
}

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function createStaffUser(data: { fullName: string; email: string; unitId: string; role: "guru" | "karyawan" }) {
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian, UserRole.admin_unit, UserRole.admin_unit_nondik]);

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: "Password123!", 
    options: {
      data: { full_name: data.fullName }
    }
  });

  if (authError) throw new Error(authError.message);
  if (!authData.user) throw new Error("Gagal membuat pengguna di sistem.");

  // Pastikan tidak duplikat di DB Prisma
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  
  let userId = authData.user.id;
  if (!existing) {
    await prisma.user.create({
      data: {
        id: userId,
        fullName: data.fullName,
        email: data.email,
        passwordHash: "managed_by_supabase",
      }
    });
  } else {
    userId = existing.id;
  }

  // Assign role
  await prisma.userRoleAssignment.create({
    data: {
      userId: userId,
      unitId: data.unitId,
      role: data.role === "guru" ? UserRole.guru : UserRole.karyawan
    }
  });

  revalidatePath("/admin/staff");
  return { success: true };
}

export async function removeStaffAssignment(assignmentId: string) {
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian, UserRole.admin_unit, UserRole.admin_unit_nondik]);
  
  await prisma.userRoleAssignment.delete({
    where: { id: assignmentId }
  });
  
  revalidatePath("/admin/staff");
}
