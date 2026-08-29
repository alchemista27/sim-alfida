"use server";

import { prisma } from "@/lib/prisma";
import { UserRole } from "@sim/database";
import { revalidatePath } from "next/cache";
import { resolveUnitId } from "@/lib/unit-context";

/**
 * Mengambil daftar semua guru di unit ini beserta status apakah mereka juga seorang observer.
 */
export async function getTeachersWithObserverStatus() {
  const unitId = await resolveUnitId();

  // Ambil semua role assignment 'guru' untuk unit ini
  const guruAssignments = await prisma.userRoleAssignment.findMany({
    where: {
      unitId,
      role: UserRole.guru,
    },
    include: {
      user: {
        include: {
          roles: {
            where: {
              unitId,
              role: UserRole.observer,
            }
          }
        }
      }
    },
    orderBy: {
      user: {
        fullName: 'asc'
      }
    }
  });

  return guruAssignments.map(assignment => {
    const isObserver = assignment.user.roles.length > 0;
    return {
      id: assignment.user.id,
      fullName: assignment.user.fullName,
      email: assignment.user.email,
      phone: assignment.user.phone,
      isObserver,
    };
  });
}

/**
 * Toggle (Tambah/Hapus) role observer untuk seorang guru di unit ini.
 */
export async function toggleObserverRoleAction(userId: string, currentStatus: boolean) {
  const unitId = await resolveUnitId();

  if (currentStatus) {
    // Hapus role observer
    await prisma.userRoleAssignment.deleteMany({
      where: {
        userId,
        unitId,
        role: UserRole.observer,
      },
    });
  } else {
    // Tambahkan role observer
    await prisma.userRoleAssignment.create({
      data: {
        userId,
        unitId,
        role: UserRole.observer,
      },
    });
  }

  revalidatePath("/unit/observers");
  return { success: true };
}
