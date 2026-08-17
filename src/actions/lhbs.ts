"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GenerateLhbsSchema } from "@/lib/validators/lhbs";
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

    // 1. Kalkulasi Nilai per Mata Pelajaran
    // Filter grade types based on semester.
    // For "mid" (ATS): daily, exam, ats
    // For "final" (AAS): daily, exam, aas
    const typesToInclude = parsed.semester === "mid" ? ['daily', 'exam', 'ats'] : ['daily', 'exam', 'aas'];

    const allGrades = await prisma.grade.findMany({
      where: {
        enrollmentId: parsed.enrollmentId,
        type: { in: typesToInclude as any }
      },
      include: { subject: true }
    });

    const gradesBySubject: Record<string, { subject: any, daily: number[], exam: number[], summative: number[] }> = {};

    for (const g of allGrades) {
      if (!gradesBySubject[g.subjectId]) {
        gradesBySubject[g.subjectId] = {
          subject: g.subject,
          daily: [],
          exam: [],
          summative: [] // ats or aas
        };
      }
      if (g.type === 'daily') gradesBySubject[g.subjectId].daily.push(Number(g.score));
      else if (g.type === 'exam') gradesBySubject[g.subjectId].exam.push(Number(g.score));
      else if (g.type === 'ats' || g.type === 'aas') gradesBySubject[g.subjectId].summative.push(Number(g.score));
    }

    const gradesSnapshot: any[] = [];
    
    for (const subjectId in gradesBySubject) {
      const data = gradesBySubject[subjectId];
      
      const avgDaily = data.daily.length > 0 ? data.daily.reduce((a, b) => a + b, 0) / data.daily.length : 0;
      const avgExam = data.exam.length > 0 ? data.exam.reduce((a, b) => a + b, 0) / data.exam.length : 0;
      const avgSummative = data.summative.length > 0 ? data.summative.reduce((a, b) => a + b, 0) / data.summative.length : 0;

      // Bobot: 40% Harian, 30% Ujian, 30% Summative (ATS/AAS)
      let finalScore = 0;
      if (data.summative.length > 0) {
        finalScore = (avgDaily * 0.4) + (avgExam * 0.3) + (avgSummative * 0.3);
      } else if (data.exam.length > 0) {
        // Fallback jika belum ada nilai ATS
        finalScore = (avgDaily * 0.5) + (avgExam * 0.5);
      } else {
        finalScore = avgDaily;
      }

      // Predikat sederhana
      let predikat = "D";
      if (finalScore >= 90) predikat = "A";
      else if (finalScore >= 80) predikat = "B";
      else if (finalScore >= 70) predikat = "C";

      gradesSnapshot.push({
        subjectId: data.subject.id,
        subjectCode: data.subject.code,
        subjectName: data.subject.name,
        avgDaily: Math.round(avgDaily * 100) / 100,
        avgExam: Math.round(avgExam * 100) / 100,
        summative: Math.round(avgSummative * 100) / 100,
        finalScore: Math.round(finalScore * 100) / 100,
        predikat
      });
    }
    
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
