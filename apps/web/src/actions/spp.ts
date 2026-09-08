"use server";
import { revalidatePath } from "next/cache";
import { GenerateSppSchema, VerifySppSchema } from "@sim/shared";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { apiFetch } from "@/lib/api";

export async function generateBulkSppInvoices(formData: FormData) {
  try {
    const data = {
      unitId: formData.get("unitId") as string,
      academicYearId: formData.get("academicYearId") as string,
      month: parseInt(formData.get("month") as string),
      year: parseInt(formData.get("year") as string),
      amount: parseFloat(formData.get("amount") as string),
    };

    const parsed = GenerateSppSchema.parse(data);

    const result = await apiFetch("/spp/generate", {
      method: "POST",
      body: JSON.stringify(parsed)
    });

    revalidatePath("/unit/spp");
    return { success: true, count: result?.count || 0, message: result?.message || "Berhasil memproses" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal membuat tagihan massal." };
  }
}

export async function uploadSppProof(formData: FormData) {
  try {
    const invoiceId = formData.get("invoiceId") as string;
    const file = formData.get("file") as File;

    if (!invoiceId || !file) throw new Error("Data tidak lengkap.");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `spp_${invoiceId}_${Date.now()}`;
    const proofUrl = await uploadToCloudinary(buffer, 'sim-alfida/spp', filename);

    await apiFetch("/spp/upload-proof", {
      method: "POST",
      body: JSON.stringify({ invoiceId, proofUrl })
    });

    revalidatePath("/parent/spp");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function verifySppInvoice(formData: FormData) {
  try {
    const data = {
      invoiceId: formData.get("invoiceId") as string,
      status: formData.get("status") as "verified" | "rejected",
      rejectionNote: formData.get("rejectionNote") as string | undefined,
    };
    const parsed = VerifySppSchema.parse(data);

    await apiFetch("/spp/verify", {
      method: "POST",
      body: JSON.stringify(parsed)
    });

    revalidatePath("/unit/spp");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
