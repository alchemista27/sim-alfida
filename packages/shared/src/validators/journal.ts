import { z } from "zod";
import { LessonPlanType } from "@sim/database";

export const TeachingJournalSchema = z.object({
  id: z.string().uuid().optional(),
  subjectId: z.string().uuid({ message: "Mata pelajaran harus dipilih" }),
  classId: z.string().uuid({ message: "Kelas harus dipilih" }),
  date: z.coerce.date({ required_error: "Tanggal harus diisi" }),
  material: z.string().min(5, { message: "Materi terlalu singkat (minimal 5 karakter)" }),
  method: z.string().min(5, { message: "Metode terlalu singkat (minimal 5 karakter)" }),
  reflection: z.string().optional(),
});

export const LessonPlanSchema = z.object({
  id: z.string().uuid().optional(),
  subjectId: z.string().uuid({ message: "Mata pelajaran harus dipilih" }),
  academicYearId: z.string().uuid({ message: "Tahun ajaran harus dipilih" }),
  type: z.nativeEnum(LessonPlanType, { required_error: "Tipe perencanaan harus dipilih" }),
  title: z.string().min(3, { message: "Judul perencanaan harus diisi (minimal 3 karakter)" }),
  content: z.string().min(10, { message: "Konten perencanaan wajib diisi" }),
});
