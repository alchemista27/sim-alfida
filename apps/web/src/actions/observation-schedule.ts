"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function createSchedule(data: {
  academicYearId: string;
  date: Date;
  startTime: string;
  endTime: string;
  quota: number;
}) {
  try {
    const schedule = await apiFetch("/ppdb/schedules", {
      method: "POST",
      body: JSON.stringify(data)
    });
    revalidatePath("/admin/ppdb/observations");
    return { success: true, data: schedule };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal membuat jadwal observasi" };
  }
}

export async function updateSchedule(
  id: string,
  data: {
    date?: Date;
    startTime?: string;
    endTime?: string;
    quota?: number;
  }
) {
  try {
    const schedule = await apiFetch(`/ppdb/schedules/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
    revalidatePath("/admin/ppdb/observations");
    return { success: true, data: schedule };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memperbarui jadwal observasi" };
  }
}

export async function deleteSchedule(id: string) {
  try {
    await apiFetch(`/ppdb/schedules/${id}`, { method: "DELETE" });
    revalidatePath("/admin/ppdb/observations");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus jadwal observasi" };
  }
}
