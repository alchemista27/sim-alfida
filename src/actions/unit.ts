"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { unitSettingsSchema, academicYearSchema } from "@/lib/validations/unit";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

// ── Helper: get the unit ID scoped to the current admin_unit session ──
export async function getAdminUnitId(): Promise<string> {
  const user = await requireRole([UserRole.admin_unit, UserRole.super_admin]);
  const roles = (user as any).roles as Array<{ role: string; unitId: string | null }>;

  // super_admin can act on any unit — they pass unitId explicitly
  // admin_unit must use their own scoped unitId
  const adminRole = roles.find((r) => r.role === UserRole.admin_unit);
  if (!adminRole?.unitId) {
    // If super_admin, they should pass unitId from the URL
    throw new Error("Unit tidak ditemukan untuk akun ini");
  }
  return adminRole.unitId;
}

// ── S3-04: Update Unit Settings (Principal) ──
export async function updateUnitSettingsAction(
  unitId: string,
  data: unknown
) {
  await requireRole([UserRole.admin_unit, UserRole.super_admin]);
  const parsed = unitSettingsSchema.parse(data);

  await prisma.unitSettings.update({
    where: { unitId },
    data: {
      principalName: parsed.principalName,
      principalNip: parsed.principalNip || null,
    },
  });

  revalidatePath("/unit/settings");
  revalidatePath(`/admin/units/${unitId}`);
}

// ── S3-07: Create Academic Year ──
export async function createAcademicYearAction(unitId: string, data: unknown) {
  await requireRole([UserRole.admin_unit, UserRole.super_admin]);
  const parsed = academicYearSchema.parse(data);

  // If ppdbActive is set, deactivate all others for this unit first
  if (parsed.ppdbActive) {
    await prisma.academicYear.updateMany({
      where: { unitId },
      data: { ppdbActive: false },
    });
  }

  const ay = await prisma.academicYear.create({
    data: {
      unitId,
      name: parsed.name,
      startDate: new Date(parsed.startDate),
      endDate: new Date(parsed.endDate),
      quota: parsed.quota,
      ppdbActive: parsed.ppdbActive,
      registered: 0,
    },
  });

  revalidatePath("/unit/ppdb-overview");
  return ay;
}

// ── S3-07: Toggle PPDB Active ──
export async function togglePpdbActiveAction(
  unitId: string,
  academicYearId: string,
  activate: boolean
) {
  await requireRole([UserRole.admin_unit, UserRole.super_admin]);

  if (activate) {
    // Deactivate all others first
    await prisma.academicYear.updateMany({
      where: { unitId },
      data: { ppdbActive: false },
    });
  }

  await prisma.academicYear.update({
    where: { id: academicYearId },
    data: { ppdbActive: activate },
  });

  revalidatePath("/unit/ppdb-overview");
  revalidatePath("/admin/dashboard");
}
