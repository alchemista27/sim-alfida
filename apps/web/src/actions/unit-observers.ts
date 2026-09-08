"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function getTeachersWithObserverStatus() {
  return apiFetch("/ppdb/observers", { method: "GET" });
}

export async function toggleObserverRoleAction(userId: string, currentStatus: boolean) {
  const res = await apiFetch("/ppdb/observers/toggle", {
    method: "POST",
    body: JSON.stringify({ userId, currentStatus })
  });
  revalidatePath("/unit/observers");
  return res;
}
