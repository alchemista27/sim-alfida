import { z } from "zod";
import { DayOfWeek } from "@/generated/client";

export const ExtracurricularSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Nama ekstrakurikuler minimal 3 karakter"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const CoachAssignmentSchema = z.object({
  id: z.string().uuid().optional(),
  extraId: z.string().uuid("Program ekskul wajib dipilih"),
  coachId: z.string().uuid("Guru pembina wajib dipilih"),
});

export const ExtracurricularScheduleSchema = z.object({
  id: z.string().uuid().optional(),
  extraId: z.string().uuid(),
  day: z.nativeEnum(DayOfWeek, { required_error: "Hari wajib dipilih" }),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu salah (HH:MM)"),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu salah (HH:MM)"),
  location: z.string().optional(),
}).refine(data => {
  return data.startTime < data.endTime;
}, {
  message: "Jam selesai harus setelah jam mulai",
  path: ["endTime"]
});

export const ExtracurricularJournalSchema = z.object({
  id: z.string().uuid().optional(),
  extraId: z.string().uuid(),
  date: z.coerce.date({ required_error: "Tanggal wajib diisi" }),
  activity: z.string().min(5, "Aktivitas minimal 5 karakter"),
  attendance: z.coerce.number().min(0, "Jumlah kehadiran tidak boleh negatif"),
  notes: z.string().optional(),
});

export const ExtracurricularGradeSchema = z.object({
  id: z.string().uuid().optional(),
  memberId: z.string().uuid(),
  enrollmentId: z.string().uuid(),
  semester: z.enum(["ganjil", "genap"], { required_error: "Semester wajib dipilih" }),
  score: z.enum(["A", "B", "C", "D"], { required_error: "Nilai wajib diisi" }),
  notes: z.string().optional(),
});

