"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { getActiveRegistration } from "./parent";
import { RegistrationStatus } from "@sim/database";

export async function uploadRequiredDocumentsAction(formData: FormData) {
  const registrationId = formData.get("registrationId") as string;
  if (!registrationId) throw new Error("Data tidak lengkap.");

  const reg = await getActiveRegistration();
  if (!reg || reg.id !== registrationId || (reg.status !== RegistrationStatus.documents_uploaded && reg.status !== RegistrationStatus.medical_pending)) {
    throw new Error("Transisi status tidak diizinkan saat ini.");
  }

  const fileKeys = ["photo", "father_id", "mother_id", "birth_certificate", "family_card", "school_certificate"];
  const uploadPromises: Promise<any>[] = [];
  const { uploadToCloudinary } = await import("@/lib/cloudinary");

  for (const key of fileKeys) {
    const file = formData.get(key) as File | null;
    if (file && file.size > 0) {
      uploadPromises.push(
        (async () => {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const uploadedUrl = await uploadToCloudinary(
            buffer,
            `sim-alfida/documents/${reg.academicYear.unit.slug}/${reg.registrationNumber}`,
            `${key}-${Date.now()}`
          );
          
          await apiFetch("/ppdb/documents/upsert", {
            method: "POST",
            body: JSON.stringify({
              registrationId,
              type: key,
              fileUrl: uploadedUrl,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type,
            })
          });
        })()
      );
    }
  }

  await Promise.all(uploadPromises);

  await apiFetch(`/ppdb/documents/finalize/${registrationId}`, { method: "POST" });

  revalidatePath("/parent/documents");
  redirect("/parent/medical");
}

export async function uploadMedicalResultAction(formData: FormData) {
  const registrationId = formData.get("registrationId") as string;
  const file = formData.get("file") as File;
  
  if (!registrationId || !file) throw new Error("Data tidak lengkap.");

  const reg = await getActiveRegistration();
  if (!reg || reg.id !== registrationId || reg.status !== RegistrationStatus.medical_pending) {
    throw new Error("Transisi status tidak valid untuk upload IMC.");
  }

  const { uploadToCloudinary } = await import("@/lib/cloudinary");
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const uploadedUrl = await uploadToCloudinary(
    buffer,
    `sim-alfida/documents/${reg.academicYear.unit.slug}/${reg.registrationNumber}`,
    `medical_result-${Date.now()}`
  );

  await apiFetch("/ppdb/documents/upsert", {
    method: "POST",
    body: JSON.stringify({
      registrationId,
      type: "medical_result",
      fileUrl: uploadedUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    })
  });

  await apiFetch(`/ppdb/documents/medical-done/${registrationId}`, { method: "POST" });

  revalidatePath("/parent/medical");
  redirect("/parent/dashboard");
}

export async function uploadSingleDocumentAction(formData: FormData) {
  const registrationId = formData.get("registrationId") as string;
  const key = formData.get("key") as string;
  const file = formData.get("file") as File | null;
  
  if (!registrationId || !key || !file || file.size === 0) {
    throw new Error("Data tidak lengkap untuk file: " + key);
  }

  const reg = await getActiveRegistration();
  if (!reg || reg.id !== registrationId || (reg.status !== RegistrationStatus.documents_uploaded && reg.status !== RegistrationStatus.medical_pending)) {
    throw new Error("Transisi status tidak diizinkan saat ini.");
  }

  const { uploadToCloudinary } = await import("@/lib/cloudinary");

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const uploadedUrl = await uploadToCloudinary(
    buffer,
    `sim-alfida/documents/${reg.academicYear.unit.slug}/${reg.registrationNumber}`,
    `${key}-${Date.now()}`
  );
  
  await apiFetch("/ppdb/documents/upsert", {
    method: "POST",
    body: JSON.stringify({
      registrationId,
      type: key,
      fileUrl: uploadedUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    })
  });
  
  return { success: true, url: uploadedUrl };
}

export async function finalizeDocumentUploadAction(registrationId: string) {
  await apiFetch(`/ppdb/documents/finalize/${registrationId}`, { method: "POST" });
  revalidatePath("/parent/documents");
  redirect("/parent/medical");
}
