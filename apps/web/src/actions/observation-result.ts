"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function submitObservationResult(data: {
  observationBookingId: string;
  observerId: string;
  score: number;
  notes: string;
}) {
  try {
    const result = await apiFetch("/ppdb/observations/result", {
      method: "POST",
      body: JSON.stringify(data)
    });
    revalidatePath("/observer");
    revalidatePath("/unit/ppdb-observations/results");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan hasil observasi" };
  }
}
