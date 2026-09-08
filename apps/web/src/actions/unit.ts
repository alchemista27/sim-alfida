"use server";

import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function getAdminUnitId(): Promise<string> {
  const user = await requireRole([UserRole.admin_unit, UserRole.admin_unit_nondik, UserRole.super_admin]);
  const roles = (user as any).roles as Array<{ role: string; unitId: string | null }>;
  const adminRole = roles.find((r) => (r.role === UserRole.admin_unit || r.role === UserRole.admin_unit_nondik) && r.unitId);
  if (!adminRole?.unitId) {
    throw new Error("Unit tidak ditemukan untuk akun ini");
  }
  return adminRole.unitId;
}

export async function updateUnitSettingsAction(unitId: string, data: unknown) {
  await apiFetch(`/admin/units/${unitId}/settings`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  revalidatePath("/unit/settings");
  revalidatePath(`/admin/units/${unitId}`);
}

export async function uploadUnitImageAction(unitId: string, formData: FormData) {
  const type = formData.get("type") as "logo" | "signature";
  const file = formData.get("file") as File;
  if (!type || !file) throw new Error("Data tidak lengkap.");

  let uploadedUrl = "";
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { uploadToCloudinary } = await import("@/lib/cloudinary");
    // Just use unitId as folder name to avoid fetching slug from Prisma
    uploadedUrl = await uploadToCloudinary(buffer, `sim-alfida/units/${unitId}`, `${type}-${Date.now()}`);
  } catch (err) {
    throw new Error(`Gagal mengunggah ${type}.`);
  }

  const updateData = type === "logo" ? { logoUrl: uploadedUrl } : { principalSignatureUrl: uploadedUrl };
  await apiFetch(`/admin/units/${unitId}/settings`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });

  revalidatePath("/unit/settings");
  revalidatePath(`/admin/units/${unitId}`);
  return uploadedUrl;
}

export async function createAcademicYearAction(unitId: string, data: unknown) {
  const ay = await apiFetch(`/admin/units/${unitId}/academic-years`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  revalidatePath("/unit/ppdb-overview");
  return ay;
}

export async function togglePpdbActiveAction(unitId: string, academicYearId: string, activate: boolean) {
  await apiFetch(`/admin/units/${unitId}/academic-years/${academicYearId}/toggle`, {
    method: "PUT",
    body: JSON.stringify({ activate }),
  });
  revalidatePath("/unit/ppdb-overview");
  revalidatePath("/admin/dashboard");
}
