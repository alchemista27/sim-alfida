"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function verifyPaymentAction(registrationId: string, isApproved: boolean, reason?: string) {
  await apiFetch('/ppdb/verify-payment', {
    method: 'POST',
    body: JSON.stringify({ registrationId, isApproved, reason })
  });

  revalidatePath("/unit/ppdb-payments");
  revalidatePath("/parent/dashboard"); 
}

export async function updateRegistrationStatus(registrationId: string, status: string) {
  const res = await apiFetch(`/ppdb/registration/${registrationId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status })
  });
  revalidatePath("/unit/ppdb-data");
  return res;
}
