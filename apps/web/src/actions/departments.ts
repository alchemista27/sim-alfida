"use server";

import { revalidatePath } from "next/cache";
import { type DepartmentInput, type AssignDepartmentAdminInput } from "@sim/shared";
import { apiFetch } from "@/lib/api";

export async function getDepartments() {
  return apiFetch("/hr/departments", { method: "GET" });
}

export async function upsertDepartment(data: DepartmentInput) {
  await apiFetch("/hr/departments", {
    method: "POST",
    body: JSON.stringify(data)
  });
  revalidatePath("/admin/departments");
}

export async function deleteDepartment(id: string) {
  await apiFetch(`/hr/departments/${id}`, { method: "DELETE" });
  revalidatePath("/admin/departments");
}

export async function assignDepartmentAdmin(data: AssignDepartmentAdminInput) {
  await apiFetch("/hr/departments/assign-admin", {
    method: "POST",
    body: JSON.stringify(data)
  });
  revalidatePath("/admin/departments");
}

export async function removeDepartmentAdmin(departmentId: string, userId: string) {
  await apiFetch(`/hr/departments/${departmentId}/admin/${userId}`, { method: "DELETE" });
  revalidatePath("/admin/departments");
}
