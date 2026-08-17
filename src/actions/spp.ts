"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GenerateSppSchema, VerifySppSchema } from "@/lib/validators/spp";
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

    // Get all active enrollments for this unit and academic year
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        academicYearId: parsed.academicYearId,
        status: 'active',
        class: { unitId: parsed.unitId }
      },
      select: { id: true }
    });

    if (enrollments.length === 0) {
      throw new Error("Tidak ada siswa aktif yang ditemukan pada tahun ajaran dan unit ini.");
    }

    // Check if invoices already exist for this month/year for these enrollments to avoid duplicate errors
    const existingInvoices = await prisma.sppInvoice.findMany({
      where: {
        month: parsed.month,
        year: parsed.year,
        enrollmentId: { in: enrollments.map(e => e.id) }
      },
      select: { enrollmentId: true }
    });

    const existingEnrollmentIds = new Set(existingInvoices.map(e => e.enrollmentId));
    const newEnrollments = enrollments.filter(e => !existingEnrollmentIds.has(e.id));

    if (newEnrollments.length === 0) {
      return { success: true, count: 0, message: "Seluruh tagihan untuk bulan ini sudah pernah dibuat sebelumnya." };
    }

    // Create invoices
    const payload = newEnrollments.map(e => ({
      enrollmentId: e.id,
      month: parsed.month,
      year: parsed.year,
      amount: parsed.amount,
      status: 'unpaid' as const
    }));

    const result = await prisma.sppInvoice.createMany({
      data: payload
    });

    revalidatePath("/unit/spp");
    return { success: true, count: result.count, message: `Berhasil membuat ${result.count} tagihan baru.` };
  } catch (error: any) {
    return { success: false, error: error.message };
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
