"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { RegistrationStatus } from "@sim/database";

export async function verifyDocumentsAction(
  registrationId: string, 
  status: "approve" | "reject", 
  rejectReason?: string
) {
  const nextStatus = status === "approve" 
    ? RegistrationStatus.observation_scheduled 
    : RegistrationStatus.rejected;
  
  await apiFetch(`/ppdb/registration/${registrationId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status: nextStatus })
  });

  revalidatePath("/unit/ppdb-verification");
  revalidatePath("/unit/dashboard");
}
