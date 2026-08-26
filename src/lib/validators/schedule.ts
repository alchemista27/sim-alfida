import { z } from "zod";
import { DayOfWeek } from "@/generated/client";

export const ClassScheduleSchema = z.object({
  id: z.string().uuid().optional(),
  classId: z.string().uuid({ message: "Kelas wajib diisi" }),
  subjectId: z.string().uuid({ message: "Mata pelajaran wajib diisi" }),
  teacherId: z.string().uuid({ message: "Guru pengampu wajib diisi" }),
  day: z.nativeEnum(DayOfWeek, { required_error: "Hari wajib diisi" }),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu salah (HH:MM)"),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu salah (HH:MM)"),
}).refine(data => {
  return data.startTime < data.endTime;
}, {
  message: "Jam selesai harus setelah jam mulai",
  path: ["endTime"]
});
