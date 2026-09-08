"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function createClass(data: any) {
  try {
    const newClass = await apiFetch("/academic/classes", {
      method: "POST",
      body: JSON.stringify(data)
    });
    revalidatePath("/unit/ppdb-classes");
    return { success: true, data: newClass };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal membuat kelas baru" };
  }
}

export async function updateClass(id: string, data: any) {
  try {
    const updated = await apiFetch(`/academic/classes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
    revalidatePath("/unit/ppdb-classes");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memperbarui kelas" };
  }
}

export async function deleteClass(id: string) {
  try {
    await apiFetch(`/academic/classes/${id}`, { method: "DELETE" });
    revalidatePath("/unit/ppdb-classes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus kelas" };
  }
}
