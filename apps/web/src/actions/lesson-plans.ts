"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function getLessonPlans(subjectId?: string, academicYearId?: string) {
  return { success: true, data: [] };
}

export async function upsertLessonPlan(formData: any) {
  try {
    await apiFetch("/academic/lesson-plans", {
      method: "POST",
      body: JSON.stringify(formData)
    });
    revalidatePath("/teacher/lesson-plans");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan rencana ajar." };
  }
}

export async function deleteLessonPlan(id: string) {
  try {
    await apiFetch(`/academic/lesson-plans/${id}`, { method: "DELETE" });
    revalidatePath("/teacher/lesson-plans");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus dokumen." };
  }
}
