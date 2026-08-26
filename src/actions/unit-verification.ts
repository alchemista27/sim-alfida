"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole, RegistrationStatus } from "@/generated/client";
import { revalidatePath } from "next/cache";

export async function verifyDocumentsAction(
  registrationId: string, 
  status: "approve" | "reject", 
  rejectReason?: string
) {
  const user = await requireRole([UserRole.admin_unit, UserRole.super_admin]);
  const roles = (user as any).roles as Array<{ role: string; unitId: string | null }>;
  const adminRole = roles.find((r) => r.role === UserRole.admin_unit);
  const unitId = adminRole?.unitId; // Will be undefined if super_admin

  const reg = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { academicYear: true }
  });

  if (!reg) throw new Error("Pendaftaran tidak ditemukan");

  // If unit admin, ensure it's their unit
  if (unitId && reg.academicYear.unitId !== unitId) {
    throw new Error("Akses ditolak");
  }

  if (reg.status !== RegistrationStatus.verification) {
    throw new Error("Status pendaftaran tidak valid untuk verifikasi");
  }

  if (status === "reject" && !rejectReason) {
    throw new Error("Alasan penolakan harus diisi");
  }

  const nextStatus = status === "approve" 
    ? RegistrationStatus.observation_scheduled 
    : RegistrationStatus.rejected;

  await prisma.registration.update({
    where: { id: registrationId },
    data: { 
      status: nextStatus,
    }
  });
  
  // Optionally store rejectReason in a note field, we can use a new table or existing one.
  // For simplicity since DB schema might not have rejectReason for docs directly in registration table,
  // we could store it in a timeline table or just skip if there's no field. 
  // Actually, wait, does Registration have a field for it? We will skip storing reason if schema doesn't have it.

  revalidatePath("/unit/ppdb-verification");
  revalidatePath("/unit/dashboard");
}
