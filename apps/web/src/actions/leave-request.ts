"use server";

import { revalidatePath } from "next/cache";
import { type LeaveRequestInput } from "@sim/shared";
import { apiFetch } from "@/lib/api";

export async function createLeaveRequest(data: LeaveRequestInput & { documentUrl?: string }) {
  await apiFetch("/hr/leave/my", {
    method: "POST",
    body: JSON.stringify(data)
  });
  revalidatePath("/staff/leave");
  return { success: true };
}

export async function getMyLeaveRequests() {
  return apiFetch("/hr/leave/my", { method: "GET" });
}
