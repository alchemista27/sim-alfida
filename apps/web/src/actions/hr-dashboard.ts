"use server";

import { apiFetch } from "@/lib/api";

export async function getStaffDemographics(): Promise<{
  totalUsers: number;
  rolesCount: { role: string; _count: { userId: number } }[];
  formattedUnitBreakdown: { unitName: string; count: number }[];
}> {
  return apiFetch("/hr/dashboard/demographics", { method: "GET" });
}

export async function getAttendanceRecap(startDate: Date, endDate: Date, unitId?: string) {
  const query = new URLSearchParams({
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  });
  if (unitId) query.append("unitId", unitId);
  return apiFetch(`/hr/dashboard/attendance-recap?${query.toString()}`, { method: "GET" });
}
