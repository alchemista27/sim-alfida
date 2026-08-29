"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GenerateSppSchema, VerifySppSchema } from "@sim/shared";
import { createClient } from "@/lib/supabase/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function generateBulkSppInvoices(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const data = {
      unitId: formData.get("unitId") as string,
      academicYearId: formData.get("academicYearId") as string,
      month: parseInt(formData.get("month") as string),
      year: parseInt(formData.get("year") as string),
      amount: parseFloat(formData.get("amount") as string),
    };

    const parsed = GenerateSppSchema.parse(data);

    // Verify admin has access to this unit
    const userRole = await prisma.userRoleAssignment.findFirst({
      where: { userId: user.id, role: 'admin_unit', unitId: parsed.unitId }
    });
    const isSuperAdmin = await prisma.userRoleAssignment.findFirst({
      where: { userId: user.id, role: 'super_admin' }
    });
    if (!userRole && !isSuperAdmin) throw new Error("Akses ditolak");

    // Call Supabase Edge Function instead of processing here to avoid timeouts
    const { data: result, error } = await supabase.functions.invoke("generate-spp", {
      body: {
        unitId: parsed.unitId,
        academicYearId: parsed.academicYearId,
        month: parsed.month,
        year: parsed.year,
        amount: parsed.amount,
        generatedBy: user.id
      }
    });

    if (error) {
      console.error("Edge function error:", error);
      throw new Error(error.message || "Gagal membuat tagihan massal.");
    }

    if (result.error) {
      throw new Error(result.error);
    }

    revalidatePath("/unit/spp");
    return { success: true, count: result.count, message: result.message };
  } catch (error: any) {
    console.error("generateBulkSppInvoices error:", error);
    return { success: false, error: error.message || "Gagal membuat tagihan massal." };
  }
}

export async function uploadSppProof(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const invoiceId = formData.get("invoiceId") as string;
    const file = formData.get("file") as File;

    if (!invoiceId || !file) {
      throw new Error("Data tidak lengkap.");
    }

    // Verify parent owns this enrollment
    const invoice = await prisma.sppInvoice.findUnique({
      where: { id: invoiceId },
      include: { enrollment: true }
    });

    if (!invoice) throw new Error("Tagihan tidak ditemukan.");
    if (invoice.enrollment.parentId !== user.id) throw new Error("Akses ditolak.");
    if (invoice.status === 'verified') throw new Error("Tagihan sudah diverifikasi, tidak dapat mengunggah ulang.");

    // Upload to cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Using a random suffix to avoid caching issues on same filename
    const filename = `spp_${invoiceId}_${Date.now()}`;
    const proofUrl = await uploadToCloudinary(buffer, 'sim-alfida/spp', filename);

    // Update invoice
    await prisma.sppInvoice.update({
      where: { id: invoiceId },
      data: {
        proofUrl,
        status: 'uploaded',
        uploadedAt: new Date(),
        rejectionNote: null // Clear previous rejection note if any
      }
    });

    revalidatePath("/parent/spp");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function verifySppInvoice(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const data = {
      invoiceId: formData.get("invoiceId") as string,
      status: formData.get("status") as "verified" | "rejected",
      rejectionNote: formData.get("rejectionNote") as string | undefined,
    };

    const parsed = VerifySppSchema.parse(data);

    const invoice = await prisma.sppInvoice.findUnique({
      where: { id: parsed.invoiceId },
      include: { enrollment: { include: { class: true } } }
    });

    if (!invoice) throw new Error("Tagihan tidak ditemukan.");

    // Verify admin has access to this unit
    const unitId = invoice.enrollment.class.unitId;
    const userRole = await prisma.userRoleAssignment.findFirst({
      where: { userId: user.id, role: 'admin_unit', unitId }
    });
    const isSuperAdmin = await prisma.userRoleAssignment.findFirst({
      where: { userId: user.id, role: 'super_admin' }
    });
    if (!userRole && !isSuperAdmin) throw new Error("Akses ditolak");

    if (parsed.status === 'rejected' && (!parsed.rejectionNote || parsed.rejectionNote.trim() === '')) {
      throw new Error("Catatan penolakan wajib diisi jika menolak.");
    }

    await prisma.sppInvoice.update({
      where: { id: parsed.invoiceId },
      data: {
        status: parsed.status,
        verifiedAt: new Date(),
        verifiedBy: user.id,
        rejectionNote: parsed.status === 'rejected' ? parsed.rejectionNote : null
      }
    });

    revalidatePath("/unit/spp");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
