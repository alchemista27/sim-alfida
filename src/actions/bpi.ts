"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { LiqoGroupSchema, LiqoMemberSchema, type LiqoGroupInput, type LiqoMemberInput } from "@/lib/validators/bpi";

export async function getLiqoGroups() {
  await requireRole([UserRole.super_admin, UserRole.admin_bpi]);
  
  return await prisma.liqoGroup.findMany({
    include: {
      murobbi: {
        select: {
          id: true,
          fullName: true,
        }
      },
      _count: {
        select: { members: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function upsertLiqoGroup(data: LiqoGroupInput) {
  await requireRole([UserRole.super_admin, UserRole.admin_bpi]);
  const parsed = LiqoGroupSchema.parse(data);

  if (parsed.id) {
    await prisma.liqoGroup.update({
      where: { id: parsed.id },
      data: {
        name: parsed.name,
        murobbiId: parsed.murobbiId,
        description: parsed.description,
      }
    });
  } else {
    await prisma.liqoGroup.create({
      data: {
        name: parsed.name,
        murobbiId: parsed.murobbiId,
        description: parsed.description,
      }
    });
  }

  revalidatePath("/admin/bpi/liqo");
}

export async function getLiqoMembers(groupId: string) {
  await requireRole([UserRole.super_admin, UserRole.admin_bpi]);
  
  return await prisma.liqoMember.findMany({
    where: { groupId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        }
      }
    },
    orderBy: { joinedAt: 'desc' }
  });
}

export async function addLiqoMember(data: LiqoMemberInput) {
  await requireRole([UserRole.super_admin, UserRole.admin_bpi]);
  const parsed = LiqoMemberSchema.parse(data);

  // Periksa apakah user sudah punya liqo (jika aturannya 1 user 1 liqo)
  const existing = await prisma.liqoMember.findFirst({
    where: { userId: parsed.userId }
  });
  if (existing) {
    throw new Error("Pegawai ini sudah menjadi anggota di kelompok Liqo lain.");
  }

  await prisma.liqoMember.create({
    data: {
      groupId: parsed.groupId,
      userId: parsed.userId,
    }
  });

  revalidatePath("/admin/bpi/liqo");
}

export async function removeLiqoMember(groupId: string, userId: string) {
  await requireRole([UserRole.super_admin, UserRole.admin_bpi]);
  
  await prisma.liqoMember.deleteMany({
    where: {
      groupId,
      userId
    }
  });

  revalidatePath("/admin/bpi/liqo");
}

export async function getPotentialMurobbis() {
  await requireRole([UserRole.super_admin, UserRole.admin_bpi]);
  
  // Ambil user yang punya role murobbi, guru, atau admin_bpi
  const assignments = await prisma.userRoleAssignment.findMany({
    where: {
      role: {
        in: [UserRole.murobbi, UserRole.guru, UserRole.admin_bpi]
      }
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true
        }
      }
    }
  });

  // Distinct users
  const uniqueUsers = new Map<string, { id: string, fullName: string }>();
  for (const a of assignments) {
    uniqueUsers.set(a.user.id, a.user);
  }

  return Array.from(uniqueUsers.values());
}

export async function getPotentialMutarobbis() {
  await requireRole([UserRole.super_admin, UserRole.admin_bpi]);
  
  // Pegawai (guru/karyawan) yang belum punya kelompok Liqo
  const assignments = await prisma.userRoleAssignment.findMany({
    where: {
      role: {
        in: [UserRole.guru, UserRole.karyawan]
      }
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          liqoMemberships: true
        }
      }
    }
  });

  // Distinct users and filter those who are already in a Liqo
  const availableUsers = new Map<string, { id: string, fullName: string }>();
  for (const a of assignments) {
    if (a.user.liqoMemberships.length === 0) {
      availableUsers.set(a.user.id, { id: a.user.id, fullName: a.user.fullName });
    }
  }

  return Array.from(availableUsers.values());
}

export async function getLiqoAttendanceStats() {
  await requireRole([UserRole.super_admin, UserRole.admin_bpi]);

  const groups = await prisma.liqoGroup.findMany({
    include: {
      murobbi: { select: { fullName: true } },
      _count: { select: { members: true, meetings: true } },
      meetings: {
        include: {
          attendances: true
        }
      }
    }
  });

  return groups.map(group => {
    let totalPresent = 0;
    let totalRecords = 0;

    group.meetings.forEach(meeting => {
      meeting.attendances.forEach(att => {
        totalRecords++;
        if (att.status === 'present') totalPresent++;
      });
    });

    const attendanceRate = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;

    return {
      id: group.id,
      name: group.name,
      murobbiName: group.murobbi.fullName,
      memberCount: group._count.members,
      meetingCount: group._count.meetings,
      attendanceRate,
    };
  });
}

export async function getGlobalMutabaahStats(startDate: Date, endDate: Date) {
  await requireRole([UserRole.super_admin, UserRole.admin_bpi]);

  const records = await prisma.mutabaahRecord.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      }
    }
  });

  const total = records.length;
  if (total === 0) return {
    totalRecords: 0,
    avgSholatJamaah: 0,
    pctSholatDhuha: 0,
    pctSholatTahajud: 0,
    avgTilawahPages: 0,
    pctPuasaSunnah: 0,
    pctInfaq: 0,
  };

  const sums = records.reduce((acc, curr) => ({
    sholatJamaah: acc.sholatJamaah + curr.sholatJamaah,
    sholatDhuha: acc.sholatDhuha + (curr.sholatDhuha ? 1 : 0),
    sholatTahajud: acc.sholatTahajud + (curr.sholatTahajud ? 1 : 0),
    tilawahPages: acc.tilawahPages + curr.tilawahPages,
    puasaSunnah: acc.puasaSunnah + (curr.puasaSunnah ? 1 : 0),
    infaq: acc.infaq + (curr.infaq ? 1 : 0),
  }), {
    sholatJamaah: 0,
    sholatDhuha: 0,
    sholatTahajud: 0,
    tilawahPages: 0,
    puasaSunnah: 0,
    infaq: 0,
  });

  return {
    totalRecords: total,
    avgSholatJamaah: sums.sholatJamaah / total,
    pctSholatDhuha: (sums.sholatDhuha / total) * 100,
    pctSholatTahajud: (sums.sholatTahajud / total) * 100,
    avgTilawahPages: sums.tilawahPages / total,
    pctPuasaSunnah: (sums.puasaSunnah / total) * 100,
    pctInfaq: (sums.infaq / total) * 100,
  };
}
