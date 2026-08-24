"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@prisma/client";

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

    // 3. Ambil data keputusan yang sudah ada sebelumnya
    const existingDecisions = await prisma.promotionDecision.findMany({
      where: { enrollmentId: { in: authorizedDecisions.map(d => d.enrollmentId) } }
    });
    const existingSet = new Set(existingDecisions.map(d => d.enrollmentId));

    const toCreate: any[] = [];
    const toUpdate: any[] = [];

    // 4. Pilah mana yang dibuat baru dan diperbarui
    for (const d of authorizedDecisions) {
      if (existingSet.has(d.enrollmentId)) {
        toUpdate.push(prisma.promotionDecision.update({
          where: { enrollmentId: d.enrollmentId },
          data: {
            decision: d.decision as any,
            decidedBy: user.id,
            decidedAt: new Date()
          }
        }));
      } else {
        toCreate.push({
          enrollmentId: d.enrollmentId,
          decision: d.decision as any,
          decidedBy: user.id,
          decidedAt: new Date()
        });
      }
    }

    // 5. Eksekusi bersamaan via Transaksi Prisma
    const txOperations = [];
    if (toCreate.length > 0) {
      txOperations.push(prisma.promotionDecision.createMany({ data: toCreate }));
    }
    txOperations.push(...toUpdate);

    if (txOperations.length > 0) {
      await prisma.$transaction(txOperations);
    }

    let count = authorizedDecisions.length;

    revalidatePath("/unit/promotions");
    return { success: true, count };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
