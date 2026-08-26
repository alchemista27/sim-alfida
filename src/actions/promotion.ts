"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/generated/client";

export async function processPromotions(formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const payload = formData.get("payload") as string;
    if (!payload) throw new Error("No data provided");

    const decisions: { enrollmentId: string, decision: "promoted" | "retained" }[] = JSON.parse(payload);
    
    // Authorization check
    // Ensure user is an admin_unit of the respective enrollment's unit
    const roles = await prisma.userRoleAssignment.findMany({
      where: { userId: user.id }
    });
    const isSuperAdmin = roles.some(r => r.role === 'super_admin');
    const userUnits = roles.filter(r => r.role === 'admin_unit').map(r => r.unitId);

    // 1. Bulk Fetch Enrollments
    const enrollments = await prisma.studentEnrollment.findMany({
      where: { id: { in: decisions.map(d => d.enrollmentId) } },
      include: { class: true }
    });

    const enrollmentsMap = new Map(enrollments.map(e => [e.id, e]));
    
    // 2. Filter authorized decisions
    const authorizedDecisions = decisions.filter(d => {
      const enrollment = enrollmentsMap.get(d.enrollmentId);
      if (!enrollment) return false;
      if (!isSuperAdmin && !userUnits.includes(enrollment.class.unitId)) return false;
      return true;
    });

    // Menggunakan PostgreSQL RPC untuk bulk upsert kenaikan kelas (Ekstrem Performa)
    const rpcPayload = authorizedDecisions.map(d => ({
      enrollmentId: d.enrollmentId,
      decision: d.decision,
      decidedBy: user.id
    }));

    const rpcResult: any = await prisma.$queryRaw`
      SELECT batch_upsert_promotions(${rpcPayload}::jsonb) as result
    `;

    let count = authorizedDecisions.length;

    revalidatePath("/unit/promotions");
    return { success: true, count };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
