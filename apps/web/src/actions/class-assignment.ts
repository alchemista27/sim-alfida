"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function assignToClass(registrationId: string, classId: string) {
  try {
    const data = await apiFetch("/academic/classes/assign", {
      method: "POST",
      body: JSON.stringify({ registrationId, classId })
    });
    revalidatePath("/unit/ppdb-classes/assignments");
    revalidatePath("/unit/ppdb-classes");
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menetapkan kelas" };
  }
}
