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

export async function removeStaffAssignment(assignmentId: string) {
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian, UserRole.admin_unit, UserRole.admin_unit_nondik]);
  
  await prisma.userRoleAssignment.delete({
    where: { id: assignmentId }
  });
  
  revalidatePath("/admin/staff");
}
