"use server";

import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { unstable_cache } from "next/cache";
import { apiFetch } from "@/lib/api";

const getCachedBpiOverview = unstable_cache(
  async () => {
    return apiFetch("/bpi/mutabaah-stats?start=2000-01-01T00:00:00Z&end=2100-01-01T00:00:00Z");
  },
  ['super-dashboard-bpi-overview'],
  { revalidate: 60 }
);

export async function getBpiOverview() {
  await requireRole([UserRole.super_admin]);
  return getCachedBpiOverview();
}

const getCachedDepartmentOverview = unstable_cache(
  async () => {
    return apiFetch("/strategic/departments/overview");
  },
  ['super-dashboard-dept-overview'],
  { revalidate: 60 }
);

export async function getDepartmentOverview() {
  await requireRole([UserRole.super_admin]);
  return getCachedDepartmentOverview();
}

const getCachedAttendanceOverview = unstable_cache(
  async () => {
    return apiFetch("/hr/attendance-overview");
  },
  ['super-dashboard-att-overview'],
  { revalidate: 60 }
);

export async function getAttendanceOverview() {
  await requireRole([UserRole.super_admin]);
  return getCachedAttendanceOverview();
}
