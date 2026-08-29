"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function verifyPaymentAction(registrationId: string, isApproved: boolean, reason?: string) {
  // Meneruskan request ke NestJS Controller
  await apiFetch('/ppdb/verify-payment', {
    method: 'POST',
    body: JSON.stringify({ registrationId, isApproved, reason })
  });

  // Revalidasi cache Next.js setelah mutasi berhasil di backend NestJS
  revalidatePath("/unit/ppdb-payments");
  revalidatePath("/parent/dashboard"); 
}
