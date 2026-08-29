"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { revalidatePath } from "next/cache";
import { LiqoGroupSchema, LiqoMemberSchema, type LiqoGroupInput, type LiqoMemberInput } from "@sim/shared";

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

  const roleExists = await prisma.userRoleAssignment.findFirst({
    where: { userId: parsed.murobbiId, role: UserRole.murobbi }
  });
  
  if (!roleExists) {
    await prisma.userRoleAssignment.create({
      data: { userId: parsed.murobbiId, role: UserRole.murobbi }
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

  // Gunakan PostgreSQL Aggregate Query (Super Cepat, Menghemat Memori JS)
  const result: any = await prisma.$queryRaw`
    SELECT 
      COUNT(*)::int as "totalRecords",
      COALESCE(AVG(sholat_jamaah), 0) as "avgSholatJamaah",
      COALESCE((COUNT(*) FILTER (WHERE sholat_dhuha = true)::float / NULLIF(COUNT(*), 0)) * 100, 0) as "pctSholatDhuha",
      COALESCE((COUNT(*) FILTER (WHERE sholat_tahajud = true)::float / NULLIF(COUNT(*), 0)) * 100, 0) as "pctSholatTahajud",
      COALESCE(AVG(tilawah_pages), 0) as "avgTilawahPages",
      COALESCE((COUNT(*) FILTER (WHERE puasa_sunnah = true)::float / NULLIF(COUNT(*), 0)) * 100, 0) as "pctPuasaSunnah",
      COALESCE((COUNT(*) FILTER (WHERE infaq = true)::float / NULLIF(COUNT(*), 0)) * 100, 0) as "pctInfaq"
    FROM sim.mutabaah_records
    WHERE "date" >= ${startDate} AND "date" <= ${endDate}
  `;

  return result[0] || {
    totalRecords: 0,
    avgSholatJamaah: 0,
    pctSholatDhuha: 0,
    pctSholatTahajud: 0,
    avgTilawahPages: 0,
    pctPuasaSunnah: 0,
    pctInfaq: 0,
  };
}
