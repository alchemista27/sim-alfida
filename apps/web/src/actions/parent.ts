"use server";

import { redirect } from "next/navigation";
import { RegistrationStatus } from "@sim/database";
import { PpdbFsm } from "@/lib/ppdb-fsm";
import { studentDataSchema, parentDataSchema } from "@/lib/validations/ppdb";
import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";

export async function getActiveRegistration(): Promise<any> {
  return apiFetch("/ppdb/parent/registration/active", { method: "GET" });
}

export async function createRegistrationAction(unitId: string) {
  try {
    await apiFetch("/ppdb/parent/registration", {
      method: "POST",
      body: JSON.stringify({ unitId })
    });
    revalidatePath("/parent/dashboard");
    redirect("/parent/payment");
  } catch (error: any) {
    throw new Error(error.message || "Gagal membuat pendaftaran.");
  }
}

export async function uploadPaymentReceiptAction(formData: FormData) {
  const registrationId = formData.get("registrationId") as string;
  const file = formData.get("file") as File;

  if (!registrationId || !file) {
    throw new Error("Data tidak lengkap.");
  }

  // Get active reg to check status and generate path
  const reg = await getActiveRegistration();
  if (!reg || reg.id !== registrationId || reg.status !== RegistrationStatus.pending_payment) {
    throw new Error("Pendaftaran tidak valid untuk pembayaran saat ini.");
  }

  if (!PpdbFsm.canTransition(reg.status, RegistrationStatus.payment_uploaded)) {
    throw new Error("Transisi status tidak diizinkan.");
  }

  let uploadedUrl = "";
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { uploadToCloudinary } = await import("@/lib/cloudinary");
    uploadedUrl = await uploadToCloudinary(buffer, `sim-alfida/payments/${reg.academicYear.unit.slug}`, `pay-${reg.registrationNumber}-${Date.now()}`);
  } catch (err: any) {
    throw new Error("Gagal mengunggah file.");
  }

  await apiFetch("/ppdb/parent/payment/upload", {
    method: "POST",
    body: JSON.stringify({ registrationId, proofUrl: uploadedUrl })
  });

  revalidatePath("/parent/dashboard");
  redirect("/parent/dashboard");
}

export async function submitStudentFormAction(registrationId: string, data: unknown) {
  const parsed = studentDataSchema.parse(data);
  await apiFetch(`/ppdb/parent/student-data/${registrationId}`, {
    method: "POST",
    body: JSON.stringify(parsed)
  });
  revalidatePath("/parent/form-student");
}

export async function submitParentFormAction(registrationId: string, data: unknown) {
  const parsed = parentDataSchema.parse(data);
  await apiFetch(`/ppdb/parent/parent-data/${registrationId}`, {
    method: "POST",
    body: JSON.stringify(parsed)
  });
  revalidatePath("/parent/dashboard");
  redirect("/parent/dashboard");
}
