"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { ActivityReportInput } from "@sim/shared";
import { ReportType } from "@sim/database";

export async function getActivityReports(departmentId?: string, type?: ReportType) {
  let url = "/bpi/reports?";
  if (departmentId) url += `dept=${departmentId}&`;
  if (type) url += `type=${type}&`;
  return apiFetch(url);
}

export async function createActivityReport(data: ActivityReportInput) {
  return apiFetch("/bpi/reports", { method: "POST", body: JSON.stringify(data) });
}

export async function deleteActivityReport(id: string) {
  return apiFetch(`/bpi/reports/${id}`, { method: "DELETE" });
}
