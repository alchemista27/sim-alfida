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

    let count = 0;
    
    // In a real app, we should use a transaction, but we'll process sequentially for simplicity in Sprint 19
    for (const d of decisions) {
      const enrollment = await prisma.studentEnrollment.findUnique({
        where: { id: d.enrollmentId },
        include: { class: true }
      });
      
      if (!enrollment) continue;
      
      if (!isSuperAdmin && !userUnits.includes(enrollment.class.unitId)) {
        continue; // Skip if not authorized
      }
      
      // Upsert PromotionDecision
      await prisma.promotionDecision.upsert({
        where: { enrollmentId: enrollment.id },
        update: {
          decision: d.decision as any,
          decidedBy: user.id,
          decidedAt: new Date()
        },
        create: {
          enrollmentId: enrollment.id,
          decision: d.decision as any,
          decidedBy: user.id
        }
      });
      
      count++;
    }

    revalidatePath("/unit/promotions");
    return { success: true, count };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
