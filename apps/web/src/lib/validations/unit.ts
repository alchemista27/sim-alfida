import { z } from "zod";

export const unitSettingsSchema = z.object({
  principalName: z.string().min(3, "Nama kepala sekolah minimal 3 karakter"),
  principalNip: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length === 18 || val.length === 0,
      "NIP harus 18 digit"
    ),
});

export const academicYearSchema = z.object({
  name: z.string().min(3, "Nama tahun ajaran minimal 3 karakter (contoh: 2026/2027)"),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
  quota: z.coerce.number().min(1, "Kuota minimal 1 siswa").max(500),
  ppdbActive: z.boolean(),
});

export type UnitSettingsInput = z.infer<typeof unitSettingsSchema>;
export type AcademicYearInput = z.infer<typeof academicYearSchema>;
