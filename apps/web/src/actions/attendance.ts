"use server";

import { revalidatePath } from "next/cache";
import { type GpsCheckInOutInput } from "@sim/shared";
import { apiFetch } from "@/lib/api";

export async function getTodayAttendanceContext() {
  const date = new Date();
  return apiFetch(`/hr/attendance/context?date=${date.toISOString()}`, { method: "GET" });
}

export async function checkIn(data: GpsCheckInOutInput) {
  const res = await apiFetch("/hr/attendance/check-in", {
    method: "POST",
    body: JSON.stringify(data)
  });
  revalidatePath("/staff/attendance");
  return res;
}

export async function checkOut(data: GpsCheckInOutInput) {
  const res = await apiFetch("/hr/attendance/check-out", {
    method: "POST",
    body: JSON.stringify(data)
  });
  revalidatePath("/staff/attendance");
  return res;
}

export async function getMyAttendanceHistory(month: number, year: number) {
  return apiFetch(`/hr/attendance/my-history?month=${month}&year=${year}`, { method: "GET" });
}
