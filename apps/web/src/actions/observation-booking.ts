"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function bookSchedule(registrationId: string, scheduleId: string) {
  try {
    const data = await apiFetch("/ppdb/schedules/book", {
      method: "POST",
      body: JSON.stringify({ registrationId, scheduleId })
    });
    revalidatePath("/parent/dashboard");
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal melakukan booking jadwal" };
  }
}
