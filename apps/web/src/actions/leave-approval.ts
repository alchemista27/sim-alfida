"use server";

import { revalidatePath } from "next/cache";
import { LeaveStatus } from "@sim/database";
import { apiFetch } from "@/lib/api";

export async function getAllLeaveRequests() {
  return apiFetch(`/hr/leave`, { method: "GET" });
}

export async function approveLeaveRequest(leaveId: string) {
  const res = await apiFetch(`/hr/leave/${leaveId}/approve`, { method: "POST" });
  revalidatePath("/admin/leave-approvals");
  return res;
}

export async function rejectLeaveRequest(leaveId: string) {
  const res = await apiFetch(`/hr/leave/${leaveId}/reject`, { method: "POST" });
  revalidatePath("/admin/leave-approvals");
  return res;
}
