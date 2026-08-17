import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { ClassScheduleDocument } from "@/components/pdf/ClassScheduleDocument";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request, { params }: { params: Promise<{ classId: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { classId } = await params;

    const cls = await prisma.class.findUnique({
      where: { id: classId },
      include: { 
        unit: true
      }
    });
    
    if (!cls) return new NextResponse("Not Found", { status: 404 });

    const academicYear = await prisma.academicYear.findUnique({
      where: { id: cls.academicYearId }
    });

    const schedules = await prisma.classSchedule.findMany({
      where: { classId },
      include: {
        subject: true,
        teacher: true
      },
      orderBy: [
        { day: 'asc' },
        { startTime: 'asc' }
      ]
    });
    
    const stream = await renderToStream(
      <ClassScheduleDocument 
        cls={cls} 
        schedules={schedules} 
        unit={cls.unit} 
        academicYear={academicYear} 
      />
    );
    
    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Jadwal_Kelas_${cls.name.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}
