"use server";

import { requireRole } from "@/lib/auth-guard";
import { UserRole, RegistrationStatus } from "@/generated/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function verifyPaymentAction(registrationId: string, isApproved: boolean, reason?: string) {
  await requireRole([UserRole.admin_unit, UserRole.super_admin]);

  const newStatus = isApproved ? RegistrationStatus.payment_verified : RegistrationStatus.pending_payment;
  
  await prisma.$transaction([
    prisma.registration.update({
      where: { id: registrationId },
      data: { status: newStatus },
    }),
    prisma.payment.update({
      where: { registrationId },
      data: { 
        status: isApproved ? "verified" : "rejected",
        verifiedAt: isApproved ? new Date() : null,
      },
    }),
  ]);

  revalidatePath("/unit/ppdb-payments");
  revalidatePath("/parent/dashboard"); // For parent view
}
