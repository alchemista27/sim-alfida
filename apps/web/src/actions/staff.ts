"use server";

import { revalidatePath } from "next/cache";
import { type AssignStaffInput } from "@sim/shared";
import { apiFetch } from "@/lib/api";

export async function getStaffAssignments() {
  return apiFetch("/hr/staff", {
    method: "GET",
  });
}

export async function assignStaffToUnit(data: AssignStaffInput) {
  await apiFetch("/hr/staff/assign", {
    method: "POST",
    body: JSON.stringify(data),
  });
  revalidatePath("/admin/staff");
}

export async function createStaffUser(data: { fullName: string; email: string; unitId: string; role: "guru" | "karyawan" }) {
  const res = await apiFetch("/hr/staff/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
  revalidatePath("/admin/staff");
  return res;
}

export async function removeStaffAssignment(assignmentId: string) {
  await apiFetch(`/hr/staff/assignment/${assignmentId}`, {
    method: "DELETE",
  });
  revalidatePath("/admin/staff");
}
