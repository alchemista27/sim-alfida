"use server";

// removed auth
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RegistrationStatus } from "@prisma/client";
import { PpdbFsm } from "@/lib/ppdb-fsm";
import { studentDataSchema, parentDataSchema } from "@/lib/validations/ppdb";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getParentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { id: user.id };
}

export async function getActiveRegistration() {
  const user = await getParentUser();
  return prisma.registration.findFirst({
    where: { parentId: user.id },
    include: {
      academicYear: { include: { unit: true } },
      studentData: true,
      parentData: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

// ── S4-04: Create Registration ──
export async function createRegistrationAction(unitId: string) {
  const user = await getParentUser();

  const activeAY = await prisma.academicYear.findFirst({
    where: { unitId, ppdbActive: true },
    include: { unit: true },
  });

  if (!activeAY) {
    throw new Error("Tidak ada pendaftaran PPDB yang aktif di unit ini.");
  }

  // Prevent multiple active registrations
  const existing = await prisma.registration.findFirst({
    where: {
      parentId: user.id,
      status: { notIn: [RegistrationStatus.rejected] },
    },
  });

  if (existing) {
    throw new Error("Anda sudah memiliki pendaftaran yang sedang berjalan.");
  }

  // Count to generate seq
  const count = await prisma.registration.count({
    where: { academicYearId: activeAY.id },
  });
  const seq = String(count + 1).padStart(4, "0");
  const yearStr = activeAY.name.split("/")[0] || String(new Date().getFullYear());
  const slugUpper = activeAY.unit.slug.toUpperCase().substring(0, 8);
  const regNum = `PPDB-${slugUpper}-${yearStr}-${seq}`;

  const reg = await prisma.registration.create({
    data: {
      parentId: user.id,
      academicYearId: activeAY.id,
      registrationNumber: regNum,
      status: RegistrationStatus.pending_payment,
    },
  });

  // Increment registered counter
  await prisma.academicYear.update({
    where: { id: activeAY.id },
    data: { registered: { increment: 1 } },
  });

  revalidatePath("/parent/dashboard");
  redirect("/parent/payment");
}

// ── S4-06: Upload Payment Receipt ──
export async function uploadPaymentReceiptAction(registrationId: string) {
  const user = await getParentUser();
  const reg = await prisma.registration.findFirst({
    where: { id: registrationId, parentId: user.id },
  });

  if (!reg || reg.status !== RegistrationStatus.pending_payment) {
    throw new Error("Pendaftaran tidak valid untuk pembayaran saat ini.");
  }

  if (!PpdbFsm.canTransition(reg.status, RegistrationStatus.payment_uploaded)) {
    throw new Error("Transisi status tidak diizinkan.");
  }

  const MOCK_URL = "https://via.placeholder.com/600x800.png?text=Bukti+Bayar+Simulasi";

  await prisma.$transaction([
    prisma.registration.update({
      where: { id: registrationId },
      data: { status: RegistrationStatus.payment_uploaded },
    }),
    prisma.payment.upsert({
      where: { registrationId },
      update: {
        proofUrl: MOCK_URL,
        amount: 250000,
        uploadedAt: new Date(),
        status: "pending",
      },
      create: {
        registrationId,
        amount: 250000, // example nominal
        proofUrl: MOCK_URL,
        status: "pending",
      },
    }),
  ]);

  revalidatePath("/parent/dashboard");
  redirect("/parent/dashboard");
}

// ── S4-08: Form Data Siswa ──
export async function submitStudentFormAction(registrationId: string, data: unknown) {
  const user = await getParentUser();
  const reg = await prisma.registration.findFirst({
    where: { id: registrationId, parentId: user.id },
    include: { studentData: true, parentData: true },
  });

  if (!reg || reg.status !== RegistrationStatus.form_filling) {
    throw new Error("Tidak dapat mengisi form saat ini.");
  }

  const parsed = studentDataSchema.parse(data);

  await prisma.studentData.upsert({
    where: { registrationId },
    update: { ...parsed, birthDate: new Date(parsed.birthDate) },
    create: { ...parsed, birthDate: new Date(parsed.birthDate), registrationId },
  });

  revalidatePath("/parent/form-student");
}

// ── S4-09: Form Data Orang Tua ──
export async function submitParentFormAction(registrationId: string, data: unknown) {
  const user = await getParentUser();
  const reg = await prisma.registration.findFirst({
    where: { id: registrationId, parentId: user.id },
    include: { studentData: true, parentData: true },
  });

  if (!reg || reg.status !== RegistrationStatus.form_filling) {
    throw new Error("Tidak dapat mengisi form saat ini.");
  }

  const parsed = parentDataSchema.parse(data);

  await prisma.$transaction([
    prisma.parentData.deleteMany({ where: { registrationId } }),
    prisma.parentData.createMany({
      data: [
        { ...parsed.father, type: "father", birthDate: new Date(parsed.father.birthDate), registrationId },
        { ...parsed.mother, type: "mother", birthDate: new Date(parsed.mother.birthDate), registrationId },
      ],
    }),
  ]);

  // Check if both forms are complete, then transition
  const hasStudentData = await prisma.studentData.findUnique({ where: { registrationId } });
  if (hasStudentData) {
    await prisma.registration.update({
      where: { id: registrationId },
      data: { status: RegistrationStatus.documents_uploaded }, // Move forward
    });
  }

  revalidatePath("/parent/dashboard");
  redirect("/parent/dashboard");
}
