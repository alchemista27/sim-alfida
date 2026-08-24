import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

/**
 * Memastikan user memiliki UserRoleAssignment tertentu.
 * Jika sudah ada, tidak melakukan apa-apa (idempotent).
 */
export async function ensureUserRole(
  userId: string,
  role: UserRole,
  unitId?: string | null
) {
  const existing = await prisma.userRoleAssignment.findFirst({
    where: { userId, role, unitId: unitId ?? null },
  });

  if (!existing) {
    await prisma.userRoleAssignment.create({
      data: { userId, role, unitId: unitId ?? undefined },
    });
  }
}
