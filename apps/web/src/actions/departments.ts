"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { revalidatePath } from "next/cache";
import { DepartmentSchema, AssignDepartmentAdminSchema, type DepartmentInput, type AssignDepartmentAdminInput } from "@sim/shared";

export async function getDepartments() {
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian]);
  
  return await prisma.department.findMany({
    include: {
      unit: true,
      admins: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function upsertDepartment(data: DepartmentInput) {
  await requireRole([UserRole.super_admin]);
  const parsed = DepartmentSchema.parse(data);

  if (parsed.id) {
    await prisma.department.update({
      where: { id: parsed.id },
      data: {
        name: parsed.name,
        description: parsed.description,
        unitId: parsed.unitId,
        isActive: parsed.isActive,
      },
    });
  } else {
    await prisma.department.create({
      data: {
        name: parsed.name,
        description: parsed.description,
        unitId: parsed.unitId,
        isActive: parsed.isActive,
      },
    });
  }

  revalidatePath("/admin/departments");
}

export async function deleteDepartment(id: string) {
  await requireRole([UserRole.super_admin]);
  await prisma.department.delete({ where: { id } });
  revalidatePath("/admin/departments");
}

export async function assignDepartmentAdmin(data: AssignDepartmentAdminInput) {
  await requireRole([UserRole.super_admin]);
  const parsed = AssignDepartmentAdminSchema.parse(data);

  // Periksa jika user sudah punya role admin_bidang, jika belum tambahkan
  const existingRole = await prisma.userRoleAssignment.findFirst({
    where: {
      userId: parsed.userId,
      role: UserRole.admin_bidang,
    }
  });

  if (!existingRole) {
    await prisma.userRoleAssignment.create({
      data: {
        userId: parsed.userId,
        role: UserRole.admin_bidang,
      }
    });
  }

  // Buat mapping admin ke departemen
  await prisma.departmentAdmin.upsert({
    where: {
      departmentId_userId: {
        departmentId: parsed.departmentId,
        userId: parsed.userId,
      }
    },
    update: {},
    create: {
      departmentId: parsed.departmentId,
      userId: parsed.userId,
    }
  });

  revalidatePath("/admin/departments");
}

export async function removeDepartmentAdmin(departmentId: string, userId: string) {
  await requireRole([UserRole.super_admin]);
  await prisma.departmentAdmin.delete({
    where: {
      departmentId_userId: { departmentId, userId }
    }
  });
  revalidatePath("/admin/departments");
}
