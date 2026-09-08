"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function processPromotions(formData: FormData) {
  try {
    const payload = formData.get("payload") as string;
    if (!payload) throw new Error("No data provided");
    const decisions = JSON.parse(payload);
    
    await apiFetch("/academic/promotions", {
      method: "POST",
      body: JSON.stringify({ decisions })
    });

    revalidatePath("/unit/promotions");
    return { success: true, count: decisions.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
