"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function createUnitAction(data: unknown) {
  const unit = await apiFetch("/admin/units", {
    method: "POST",
    body: JSON.stringify(data),
  });
  revalidatePath("/admin/units");
  revalidatePath("/admin/dashboard");
  return unit;
}

export async function updateUnitAction(id: string, data: unknown) {
  const unit = await apiFetch(`/admin/units/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  revalidatePath("/admin/units");
  revalidatePath(`/admin/units/${id}`);
  return unit;
}

export async function assignAdminUnitAction(data: { userId: string, unitId: string, isNondik?: boolean }) {
  const assignment = await apiFetch("/admin/units/assign-admin", {
    method: "POST",
    body: JSON.stringify(data),
  });
  revalidatePath(data.isNondik ? `/admin/units-nondik/${data.unitId}` : `/admin/units/${data.unitId}`);
  return assignment;
}

export async function removeAdminUnitAction(userId: string, unitId: string, isNondik: boolean = false) {
  await apiFetch(`/admin/units/${unitId}/admin/${userId}${isNondik ? '?isNondik=true' : ''}`, {
    method: "DELETE",
  });
  revalidatePath(isNondik ? `/admin/units-nondik/${unitId}` : `/admin/units/${unitId}`);
}

export async function searchUsersAction(query: string) {
  if (!query || query.length < 1) return [];
  return apiFetch(`/admin/users/search?q=${encodeURIComponent(query)}`, {
    method: "GET",
  });
}

export async function deleteUnitAction(unitId: string) {
  await apiFetch(`/admin/units/${unitId}`, {
    method: "DELETE",
  });
  revalidatePath("/admin/units");
  revalidatePath("/admin/dashboard");
}
