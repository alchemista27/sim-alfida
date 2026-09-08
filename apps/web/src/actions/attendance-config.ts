"use server";

import { revalidatePath } from "next/cache";
import { type GpsConfigInput, type HolidayInput } from "@sim/shared";
import { apiFetch } from "@/lib/api";

export async function getGpsConfigs() {
  return apiFetch("/hr/config/gps", { method: "GET" });
}

export async function upsertGpsConfig(data: GpsConfigInput) {
  await apiFetch("/hr/config/gps", {
    method: "POST",
    body: JSON.stringify(data)
  });
  revalidatePath("/admin/attendance-settings");
}

export async function getHolidays(month: number, year: number, unitId?: string) {
  const query = `month=${month}&year=${year}${unitId ? `&unitId=${unitId}` : ''}`;
  return apiFetch(`/hr/config/holidays?${query}`, { method: "GET" });
}

export async function upsertHoliday(data: HolidayInput) {
  await apiFetch("/hr/config/holidays", {
    method: "POST",
    body: JSON.stringify(data)
  });
  revalidatePath("/admin/attendance-settings");
}

export async function deleteHoliday(id: string) {
  await apiFetch(`/hr/config/holidays/${id}`, { method: "DELETE" });
  revalidatePath("/admin/attendance-settings");
}
