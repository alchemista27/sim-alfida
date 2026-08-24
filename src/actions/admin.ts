"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { unitSchema, assignAdminSchema } from "@/lib/validations/admin";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createUnitAction(data: unknown) {
  await requireRole([UserRole.super_admin]);
  const parsed = unitSchema.parse(data);

  const unit = await prisma.unit.create({
    data: {
      name: parsed.name,
      slug: parsed.slug,
      level: parsed.level,
      isActive: parsed.isActive,
      unitSettings: {
        create: {
          principalName: `Kepala Sekolah ${parsed.name}`,
        },
      },
    },
  });

  revalidatePath("/admin/units");
  revalidatePath("/admin/dashboard");
  return unit;
}

export async function updateUnitAction(id: string, data: unknown) {
  await requireRole([UserRole.super_admin]);
  const parsed = unitSchema.parse(data);

  const unit = await prisma.unit.update({
    where: { id },
    data: {
      name: parsed.name,
      level: parsed.level,
      isActive: parsed.isActive,
      // slug is readonly for update
    },
  });

  revalidatePath("/admin/units");
  revalidatePath(`/admin/units/${id}`);
  return unit;
}

export async function assignAdminUnitAction(data: unknown) {
  await requireRole([UserRole.super_admin]);
  const { userId, unitId } = assignAdminSchema.parse(data);

  const assignment = await prisma.userRoleAssignment.upsert({
    where: {
      userId_role_unitId: {
        userId,
        role: UserRole.admin_unit,
        unitId,
      },
    },
    update: {},
    create: {
      userId,
      role: UserRole.admin_unit,
      unitId,
    },
  });

  revalidatePath(`/admin/units/${unitId}`);
  return assignment;
}

export async function removeAdminUnitAction(userId: string, unitId: string) {
  await requireRole([UserRole.super_admin]);

  await prisma.userRoleAssignment.deleteMany({
    where: {
      userId,
      role: UserRole.admin_unit,
      unitId,
    },
  });

  revalidatePath(`/admin/units/${unitId}`);
}

export async function searchUsersAction(query: string) {
  // Hanya pastikan user login, tidak perlu cek role berat untuk pencarian nama
  const { requireAuth } = await import("@/lib/auth-guard");
  await requireAuth();
  
  if (!query || query.length < 2) return [];

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { fullName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } }
      ]
    },
    take: 10,
    select: {
      id: true,
      fullName: true,
      email: true
    }
  });
  
  return users;
}
