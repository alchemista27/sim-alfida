"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getFoundationSettings() {
  await requireRole([UserRole.super_admin]);
  let settings = await prisma.foundationSettings.findFirst();
  if (!settings) {
    settings = await prisma.foundationSettings.create({
      data: {
        foundationName: "Yayasan Alfida",
      }
    });
  }
  return settings;
}

export async function updateFoundationSettings(formData: FormData) {
  await requireRole([UserRole.super_admin]);
  
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

  await prisma.foundationSettings.update({
    where: { id },
    data: {
      foundationName,
      chairmanName,
      logoUrl,
      chairmanSignatureUrl,
      bankName,
      bankAccountNumber,
      bankAccountHolder,
    }
  });

  revalidatePath("/admin/foundation-settings");
  return { success: true };
}
