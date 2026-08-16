"use server";

import { prisma } from "@/lib/prisma";
import { ReEnrollmentSchema, type ReEnrollmentInput } from "@/lib/validators/academic";
import { revalidatePath } from "next/cache";

export async function submitReEnrollment(data: ReEnrollmentInput) {
  try {
    const validatedData = ReEnrollmentSchema.parse(data);

    // Get current enrollment details
    const currentEnrollment = await prisma.studentEnrollment.findUnique({
      where: { id: validatedData.currentEnrollmentId },
      include: {
        studentData: true,
      },
    });

    if (!currentEnrollment) {
      return { success: false, error: "Data pendaftaran aktif tidak ditemukan." };
    }

    // Check if re-enrollment already exists for the next year
    const existingReEnrollment = await prisma.studentEnrollment.findUnique({
      where: {
        studentDataId_academicYearId: {
          studentDataId: currentEnrollment.studentDataId,
          academicYearId: validatedData.nextAcademicYearId,
        },
      },
    });

    if (existingReEnrollment) {
      return { success: false, error: "Siswa ini sudah didaftarkan ulang untuk tahun ajaran tersebut." };
    }

    // Run transaction: update student data (if address changed) and create new enrollment
    await prisma.$transaction(async (tx) => {
      if (
        currentEnrollment.studentData.address !== validatedData.address ||
        currentEnrollment.studentData.transportation !== validatedData.transportation
      ) {
        await tx.studentData.update({
          where: { id: currentEnrollment.studentDataId },
          data: {
            address: validatedData.address,
            transportation: validatedData.transportation,
          },
        });
      }

      await tx.studentEnrollment.create({
        data: {
          studentDataId: currentEnrollment.studentDataId,
          academicYearId: validatedData.nextAcademicYearId,
          classId: currentEnrollment.classId, // Initially same class, to be updated later by admin
          parentId: currentEnrollment.parentId,
          status: "re_enrolled",
          enrollmentType: "re_enrollment",
        },
      });
    });

    revalidatePath("/academic/re-enrollment");
    return { success: true };
  } catch (error) {
    console.error("Re-enrollment error:", error);
    return { success: false, error: "Terjadi kesalahan pada server saat daftar ulang." };
  }
}
