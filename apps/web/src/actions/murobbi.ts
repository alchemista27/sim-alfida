"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { LiqoMeetingInput, LiqoAttendanceInput } from "@sim/shared";

export async function getMyMentoredGroup() {
  const groups = await apiFetch("/bpi/murobbi/groups");
  return groups?.[0] || null;
}

export async function updateLiqoSchedule(groupId: string, data: { scheduleDay: any, scheduleTime: string, scheduleLocation: string, whatsappLink?: string }) {
  await apiFetch(`/bpi/groups/${groupId}`, { method: "PUT", body: JSON.stringify(data) });
  revalidatePath("/murobbi/liqo");
}

export async function createLiqoMeeting(groupId: string, data: LiqoMeetingInput) {
  await apiFetch(`/bpi/murobbi/groups/${groupId}/meetings`, { method: "POST", body: JSON.stringify(data) });
  revalidatePath("/murobbi/liqo");
}

export async function saveLiqoAttendance(groupId: string, data: LiqoAttendanceInput) {
  await apiFetch(`/bpi/murobbi/groups/${groupId}/attendance`, { method: "POST", body: JSON.stringify(data) });
  revalidatePath("/murobbi/liqo");
}

export async function getGroupMutabaahStats(groupId: string, startDate: Date, endDate: Date) {
  return apiFetch(`/bpi/murobbi/groups/${groupId}/mutabaah?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
}
