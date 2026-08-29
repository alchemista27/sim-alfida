import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { ExtraScheduleDocument } from "@/components/pdf/ExtraScheduleDocument";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request, { params }: { params: Promise<{ enrollmentId: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { enrollmentId } = await params;

    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { id: enrollmentId },
      include: { 
        studentData: true,
        class: { include: { unit: true } }
      }
    });
    
    if (!enrollment) return new NextResponse("Not Found", { status: 404 });
    
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: enrollment.academicYearId }
    });

    const memberships = await prisma.extracurricularMember.findMany({
      where: { enrollmentId },
      include: {
        extracurricular: {
          include: {
            schedules: true
          }
        }
      }
    });
    
    // Flatten schedules and add extraName
    const consolidatedSchedules = memberships.flatMap(m => 
      m.extracurricular.schedules.map(s => ({
        ...s,
        extraName: m.extracurricular.name
      }))
    ).sort((a, b) => {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      if (days.indexOf(a.day) !== days.indexOf(b.day)) return days.indexOf(a.day) - days.indexOf(b.day);
      return a.startTime.localeCompare(b.startTime);
    });

    const stream = await renderToStream(
      <ExtraScheduleDocument 
        student={enrollment.studentData} 
        schedules={consolidatedSchedules} 
        unit={enrollment.class.unit} 
        academicYear={academicYear}
        className={enrollment.class.name}
      />
    );
    
    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Jadwal_Ekskul_${enrollment.studentData.fullName.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}
