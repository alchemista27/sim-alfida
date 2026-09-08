"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function getFoundationSettings() {
  return apiFetch("/admin/foundation-settings", {
    method: "GET",
  });
}

export async function updateFoundationSettings(formData: FormData) {
  const id = formData.get("id") as string;
  const foundationName = formData.get("foundationName") as string;
  const chairmanName = formData.get("chairmanName") as string;
  const bankName = formData.get("bankName") as string;
  const bankAccountNumber = formData.get("bankAccountNumber") as string;
  const bankAccountHolder = formData.get("bankAccountHolder") as string;
  
  const logoFile = formData.get("logoFile") as File | null;
  const signatureFile = formData.get("signatureFile") as File | null;
  
  const { uploadToCloudinary } = await import("@/lib/cloudinary");

  let logoUrl = formData.get("logoUrl") as string;
  let chairmanSignatureUrl = formData.get("chairmanSignatureUrl") as string;

  if (logoFile && logoFile.size > 0) {
    const arrayBuffer = await logoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    logoUrl = await uploadToCloudinary(
      buffer,
      `sim-alfida/foundation`,
      `logo-${Date.now()}`
    );
  }

  if (signatureFile && signatureFile.size > 0) {
    const arrayBuffer = await signatureFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    chairmanSignatureUrl = await uploadToCloudinary(
      buffer,
      `sim-alfida/foundation`,
      `signature-${Date.now()}`
    );
  }

  await apiFetch(`/admin/foundation-settings/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      foundationName,
      chairmanName,
      logoUrl,
      chairmanSignatureUrl,
      bankName,
      bankAccountNumber,
      bankAccountHolder,
    }),
  });

  revalidatePath("/admin/foundation-settings");
  return { success: true };
}
