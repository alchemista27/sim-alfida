"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { MutabaahRecordInput } from "@sim/shared";

export async function getMyLiqoGroup() {
  return apiFetch("/bpi/mutarobbi/group", { method: "GET" });
}

export async function saveMutabaahRecord(data: MutabaahRecordInput) {
  return apiFetch("/bpi/mutarobbi/mutabaah", { method: "POST", body: JSON.stringify(data) });
}

export async function getMyMutabaah(startDate: Date, endDate: Date) {
  return apiFetch(`/bpi/mutarobbi/mutabaah?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
}
