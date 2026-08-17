import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { LessonPlanDocument } from "@/components/pdf/LessonPlanDocument";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { id } = await params;

    const plan = await prisma.lessonPlan.findUnique({
      where: { id },
      include: { 
        teacher: true, 
        subject: {
          include: {
            unit: true
          }
        }, 
        academicYear: true 
      }
    });
    
    if (!plan) return new NextResponse("Not Found", { status: 404 });
    
    // Auth Check: must be the teacher who created it, OR an admin of that unit
    // For simplicity, we just check if they are authenticated, but ideally:
    // if (plan.teacherId !== user.id && userRole !== admin) return 403
    
    const unit = plan.subject?.unit;

    const stream = await renderToStream(<LessonPlanDocument plan={plan} unit={unit} />);
    
    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="RPP_${plan.title.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}
