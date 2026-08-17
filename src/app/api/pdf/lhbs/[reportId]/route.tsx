import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { LhbsDocument } from "@/components/pdf/LhbsDocument";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request, { params }: { params: Promise<{ reportId: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { reportId } = await params;

    const report = await prisma.lhbsReport.findUnique({
      where: { id: reportId },
      include: { 
        academicYear: true,
        enrollment: {
          include: {
            studentData: true,
            class: { 
              include: { 
                unit: true,
                homeroomAssignments: { include: { teacher: true } }
              } 
            }
          }
        }
      }
    });
    
    if (!report) return new NextResponse("Not Found", { status: 404 });
    
    // Auth Check: Parent of the student, or admin/teacher
    const isParent = report.enrollment.parentId === user.id;
    const isHomeroom = report.enrollment.class.homeroomAssignments.some(h => h.teacherId === user.id);
    const isSuperAdmin = await prisma.userRoleAssignment.findFirst({ where: { userId: user.id, role: 'super_admin' }});
    
    if (!isParent && !isHomeroom && !isSuperAdmin) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const homeroomTeacher = report.enrollment.class.homeroomAssignments[0]?.teacher;

    const stream = await renderToStream(
      <LhbsDocument 
        report={report}
        student={report.enrollment.studentData} 
        unit={report.enrollment.class.unit} 
        className={report.enrollment.class.name}
        academicYear={report.academicYear}
        homeroomTeacher={homeroomTeacher}
      />
    );
    
    const semesterStr = report.semester === 'mid' ? 'ATS' : 'AAS';
    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Rapor_${semesterStr}_${report.enrollment.studentData.fullName.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}
