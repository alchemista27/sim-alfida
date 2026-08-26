import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/client";

/**
 * Get the unit ID that this admin_unit user has access to.
 * Super Admins can pass an explicit unitId.
 * Returns null if the user is super_admin without a scoped unit.
 */
export async function getSessionUnitId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const prismaUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { roles: true },
  });

  if (!prismaUser) return null;

  const roles = prismaUser.roles;

  // Super admin has no unit scope (can access all)
  const isSuperAdmin = roles.some((r) => r.role === UserRole.super_admin);
  if (isSuperAdmin) return null;

  const adminRole = roles.find((r) => r.role === UserRole.admin_unit);
  return adminRole?.unitId ?? null;
}

/**
 * Resolve a unitId for the current session.
 * - For admin_unit: returns their scoped unitId (or throws if none)
 * - For super_admin: returns the fallbackUnitId (from URL) or the first unit
 */
export async function resolveUnitId(fallbackUnitId?: string): Promise<string> {
  const scopedUnitId = await getSessionUnitId();

  // Already scoped (admin_unit)
  if (scopedUnitId) return scopedUnitId;

  // Super admin with explicit fallback
  if (fallbackUnitId) return fallbackUnitId;

  // Super admin without explicit unit — pick first unit
  const firstUnit = await prisma.unit.findFirst({ orderBy: { createdAt: "asc" } });
  if (!firstUnit) throw new Error("Tidak ada unit tersedia");
  return firstUnit.id;
}
