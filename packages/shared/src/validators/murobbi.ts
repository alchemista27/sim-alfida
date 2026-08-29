import { z } from "zod";
import { DayOfWeek, AttendanceStatus } from "@sim/database";

export const LiqoScheduleSchema = z.object({
  scheduleDay: z.nativeEnum(DayOfWeek).nullable().optional(),
  scheduleTime: z.string().nullable().optional(),
  scheduleLocation: z.string().nullable().optional(),
  whatsappLink: z.string().nullable().optional(),
});

export type LiqoScheduleInput = z.infer<typeof LiqoScheduleSchema>;

export const LiqoMeetingSchema = z.object({
  date: z.coerce.date(),
  materialTitle: z.string().min(3, "Judul materi minimal 3 karakter").max(200, "Judul terlalu panjang"),
  summary: z.string().optional().nullable(),
});

export type LiqoMeetingInput = z.infer<typeof LiqoMeetingSchema>;

export const LiqoAttendanceSchema = z.object({
  meetingId: z.string().uuid(),
  attendances: z.array(
    z.object({
      userId: z.string().uuid(),
      status: z.nativeEnum(AttendanceStatus),
      notes: z.string().optional().nullable(),
    })
  ),
});

export type LiqoAttendanceInput = z.infer<typeof LiqoAttendanceSchema>;
