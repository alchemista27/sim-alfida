"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function getClassSchedules(classId: string) {
  return { success: true, data: [] };
}

export async function upsertClassSchedule(formData: any, academicYearId?: string) {
  try {
    await apiFetch("/academic/schedules", {
      method: "POST",
      body: JSON.stringify(formData)
    });
    revalidatePath("/admin/schedules");
    revalidatePath("/teacher/schedules");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan jadwal." };
  }
}

export async function deleteClassSchedule(id: string) {
  try {
    await apiFetch(`/academic/schedules/${id}`, { method: "DELETE" });
    revalidatePath("/admin/schedules");
    revalidatePath("/teacher/schedules");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus jadwal." };
  }
}
