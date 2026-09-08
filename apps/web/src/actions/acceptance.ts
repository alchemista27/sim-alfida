"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function batchAcceptStudents(registrationIds: string[]) {
  const res = await apiFetch("/ppdb/registration/batch-accept", {
    method: "POST",
    body: JSON.stringify({ registrationIds })
  });
  revalidatePath("/admin/ppdb/observations/results");
  return res;
}

export async function batchRejectStudents(registrationIds: string[], reason: string = "Tidak memenuhi standar kelulusan observasi") {
  const res = await apiFetch("/ppdb/registration/batch-reject", {
    method: "POST",
    body: JSON.stringify({ registrationIds, reason })
  });
  revalidatePath("/admin/ppdb/observations/results");
  return res;
}
