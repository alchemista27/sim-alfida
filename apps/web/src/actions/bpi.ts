"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function getLiqoGroups() {
  return apiFetch("/bpi/groups");
}

export async function upsertLiqoGroup(data: any) {
  try {
    await apiFetch("/bpi/groups", { method: "POST", body: JSON.stringify(data) });
    revalidatePath("/admin/bpi/liqo");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getLiqoMembers(groupId: string) {
  return apiFetch(`/bpi/groups/${groupId}/members`);
}

export async function addLiqoMember(data: any) {
  try {
    await apiFetch("/bpi/groups/members", { method: "POST", body: JSON.stringify(data) });
    revalidatePath("/admin/bpi/liqo");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeLiqoMember(groupId: string, userId: string) {
  try {
    await apiFetch(`/bpi/groups/${groupId}/members/${userId}`, { method: "DELETE" });
    revalidatePath("/admin/bpi/liqo");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPotentialMurobbis() {
  return apiFetch("/bpi/potential-murobbis");
}

export async function getPotentialMutarobbis() {
  return apiFetch("/bpi/potential-mutarobbis");
}

export async function getLiqoAttendanceStats() {
  return apiFetch("/bpi/attendance-stats");
}

export async function getGlobalMutabaahStats(startDate: Date, endDate: Date) {
  return apiFetch(`/bpi/mutabaah-stats?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
}
