"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { LiqoScheduleSchema, LiqoMeetingSchema, LiqoAttendanceSchema, type LiqoScheduleInput, type LiqoMeetingInput, type LiqoAttendanceInput } from "@/lib/validators/murobbi";
import { getCurrentUser } from "@/actions/user";

export async function getMyMentoredGroup() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await requireRole([UserRole.murobbi]);

  return await prisma.liqoGroup.findFirst({
    where: { murobbiId: user.id },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, fullName: true, email: true }
          }
        }
      },
      meetings: {
        orderBy: { date: 'desc' }
      }
    }
  });
}

export async function updateLiqoSchedule(groupId: string, data: LiqoScheduleInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await requireRole([UserRole.murobbi]);

  const parsed = LiqoScheduleSchema.parse(data);

  // Validate ownership
  const group = await prisma.liqoGroup.findUnique({ where: { id: groupId } });
  if (group?.murobbiId !== user.id) throw new Error("Forbidden: Not the Murobbi of this group");

  await prisma.liqoGroup.update({
    where: { id: groupId },
    data: {
      scheduleDay: parsed.scheduleDay,
      scheduleTime: parsed.scheduleTime,
      scheduleLocation: parsed.scheduleLocation,
      whatsappLink: parsed.whatsappLink,
    }
  });

  revalidatePath("/murobbi/liqo");
}

export async function createLiqoMeeting(groupId: string, data: LiqoMeetingInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await requireRole([UserRole.murobbi]);

  const parsed = LiqoMeetingSchema.parse(data);

  // Validate ownership
  const group = await prisma.liqoGroup.findUnique({ where: { id: groupId } });
  if (group?.murobbiId !== user.id) throw new Error("Forbidden: Not the Murobbi of this group");

  await prisma.liqoMeeting.create({
    data: {
      groupId,
      date: parsed.date,
      materialTitle: parsed.materialTitle,
      summary: parsed.summary,
    }
  });

  revalidatePath("/murobbi/liqo");
}

export async function saveLiqoAttendance(groupId: string, data: LiqoAttendanceInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await requireRole([UserRole.murobbi]);

  const parsed = LiqoAttendanceSchema.parse(data);

  // Validate ownership
  const group = await prisma.liqoGroup.findUnique({ where: { id: groupId } });
  if (group?.murobbiId !== user.id) throw new Error("Forbidden: Not the Murobbi of this group");

  // Validate meeting belongs to this group
  const meeting = await prisma.liqoMeeting.findUnique({ where: { id: parsed.meetingId } });
  if (meeting?.groupId !== groupId) throw new Error("Invalid meeting");

  // Upsert all attendances
  await prisma.$transaction(
    parsed.attendances.map((att) => 
      prisma.liqoAttendance.upsert({
        where: {
          meetingId_userId: {
            meetingId: parsed.meetingId,
            userId: att.userId,
          }
        },
        update: {
          status: att.status,
          notes: att.notes,
        },
        create: {
          meetingId: parsed.meetingId,
          userId: att.userId,
          status: att.status,
          notes: att.notes,
        }
      })
    )
  );

  revalidatePath("/murobbi/liqo");
}

export async function getGroupMutabaahStats(groupId: string, startDate: Date, endDate: Date) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await requireRole([UserRole.murobbi]);

  const group = await prisma.liqoGroup.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: {
          user: {
            include: {
              mutabaahRecords: {
                where: {
                  date: {
                    gte: startDate,
                    lte: endDate,
                  }
                },
                orderBy: { date: "asc" }
              }
            }
          }
        }
      }
    }
  });

  if (group?.murobbiId !== user.id) throw new Error("Forbidden");

  return group.members.map(m => ({
    userId: m.userId,
    fullName: m.user.fullName,
    records: m.user.mutabaahRecords
  }));
}
