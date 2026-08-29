"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GenerateLhbsSchema } from "@sim/shared";
import { createClient } from "@/lib/supabase/server";

export async function generateLhbsReport(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const data = {
      enrollmentId: formData.get("enrollmentId") as string,
      semester: formData.get("semester") as "mid" | "final",
      notes: formData.get("notes") as string | undefined,
    };

    const parsed = GenerateLhbsSchema.parse(data);

    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { id: parsed.enrollmentId },
      include: { class: true }
    });

    if (!enrollment) throw new Error("Siswa tidak ditemukan.");

    const homeroom = await prisma.homeroomAssignment.findFirst({
      where: { classId: enrollment.classId, teacherId: user.id }
    });

    if (!homeroom) {
      // Also allow super admins
      const isSuperAdmin = await prisma.userRoleAssignment.findFirst({
        where: { userId: user.id, role: 'super_admin' }
      });
      if (!isSuperAdmin) throw new Error("Akses ditolak. Anda bukan Wali Kelas untuk siswa ini.");
    }

    // 1. Kalkulasi Nilai per Mata Pelajaran (menggunakan PostgreSQL RPC untuk menghapus CPU JS Bottleneck)
    const gradesRpcResult: any = await prisma.$queryRaw`
      SELECT calculate_lhbs_grades(${parsed.enrollmentId}::uuid, ${parsed.semester}::text) as grades
    `;
    
    const gradesSnapshot: any[] = gradesRpcResult[0]?.grades || [];
    
    // Sort grades by subject name
    gradesSnapshot.sort((a, b) => a.subjectName.localeCompare(b.subjectName));

    // 2. Data Ekstrakurikuler
    // Map `mid` -> `ganjil` and `final` -> `genap` for now
    const extraSemester = parsed.semester === "mid" ? "ganjil" : "genap";
    const extraGrades = await prisma.extracurricularGrade.findMany({
      where: {
        enrollmentId: parsed.enrollmentId,
        semester: extraSemester as any
      },
      include: {
        member: { include: { extracurricular: true } }
      }
    });

    const extraSnapshot = extraGrades.map(eg => ({
      extraName: eg.member.extracurricular.name,
      score: eg.score,
      notes: eg.notes
    }));

    // 3. Rekap Kehadiran
    const attendances = await prisma.attendance.findMany({
      where: { enrollmentId: parsed.enrollmentId }
    });

    const attendanceSum = {
      present: 0, sick: 0, permitted: 0, absent: 0
    };

    for (const a of attendances) {
      if (a.status === 'present') attendanceSum.present++;
      else if (a.status === 'sick') attendanceSum.sick++;
      else if (a.status === 'permitted') attendanceSum.permitted++;
      else if (a.status === 'absent') attendanceSum.absent++;
    }

    // 4. Simpan ke LhbsReport
    // We use upsert so teacher can re-generate the report
    
    // Use raw query for upsert to handle the unique constraint properly if findUnique fails
    const existingReport = await prisma.lhbsReport.findUnique({
      where: {
        enrollmentId_semester_academicYearId: {
          enrollmentId: parsed.enrollmentId,
          semester: parsed.semester as any,
          academicYearId: enrollment.academicYearId
        }
      }
    });

    if (existingReport) {
      await prisma.lhbsReport.update({
        where: { id: existingReport.id },
        data: {
          gradesSnapshot: gradesSnapshot,
          extraSnapshot: extraSnapshot,
          attendanceSum: attendanceSum,
          notes: parsed.notes,
          issuedAt: new Date()
        }
      });
    } else {
      await prisma.lhbsReport.create({
        data: {
          enrollmentId: parsed.enrollmentId,
          semester: parsed.semester as any,
          academicYearId: enrollment.academicYearId,
          gradesSnapshot: gradesSnapshot,
          extraSnapshot: extraSnapshot,
          attendanceSum: attendanceSum,
          notes: parsed.notes
        }
      });
    }

    revalidatePath("/teacher/lhbs");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
