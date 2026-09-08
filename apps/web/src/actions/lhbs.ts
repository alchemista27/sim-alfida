"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function generateLhbsReport(formData: FormData) {
  try {
    const data = {
      enrollmentId: formData.get("enrollmentId") as string,
      semester: formData.get("semester") as "mid" | "final",
      notes: formData.get("notes") as string | undefined,
    };
    
    await apiFetch("/academic/lhbs/generate", {
      method: "POST",
      body: JSON.stringify(data)
    });
    
    revalidatePath("/teacher/lhbs");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
