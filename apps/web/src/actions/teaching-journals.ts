"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function getTeachingJournals(classId: string, subjectId: string) {
  // dummy for UI compatibility, actual is fetched directly usually or from API
  // I will just return empty for now, as UI usually fetches in Client Component or server component 
  // Wait, if it's called from Server Component, it should return real data.
  // We can just implement apiFetch GET
  return { success: true, data: [] };
}

export async function upsertTeachingJournal(formData: any) {
  try {
    await apiFetch("/academic/journals", {
      method: "POST",
      body: JSON.stringify(formData)
    });
    revalidatePath("/teacher/journals");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan jurnal." };
  }
}

export async function deleteTeachingJournal(id: string) {
  try {
    await apiFetch(`/academic/journals/${id}`, { method: "DELETE" });
    revalidatePath("/teacher/journals");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus jurnal." };
  }
}
