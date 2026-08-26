import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/generated/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export interface UserRoleInfo {
  role: UserRole;
  unitId: string | null;
}

export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get Prisma user with roles
  const prismaUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { roles: true },
  });

  if (!prismaUser) {
    // Session is valid in Supabase but user profile is missing in DB
    // Clear session cookies and redirect
    await supabase.auth.signOut();
    redirect("/login");
  }

  return prismaUser;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth();
  const roles = user.roles || [];
  
  // Super admin bypasses role checks
  const isSuperAdmin = roles.some((r) => r.role === UserRole.super_admin);
  if (isSuperAdmin) return user;

  const hasRole = roles.some((r) => allowedRoles.includes(r.role));

  if (!hasRole) {
    redirect("/403");
  }
  return user;
}

export async function requireUnitAccess(unitId: string) {
  const user = await requireAuth();
  const roles = user.roles || [];
  const isSuperAdmin = roles.some((r) => r.role === UserRole.super_admin);
  if (isSuperAdmin) return user;

  const hasUnitAccess = roles.some((r) => r.unitId === unitId);
  if (!hasUnitAccess) {
    redirect("/403");
  }
  return user;
}
