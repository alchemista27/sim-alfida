import { z } from "zod";
import { ReportType } from "@/generated/client";

export const ActivityReportSchema = z.object({
  departmentId: z.string().uuid("ID Departemen tidak valid"),
  type: z.nativeEnum(ReportType),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  content: z.string().min(10, "Isi laporan minimal 10 karakter"),
  attachmentUrl: z.string().optional(),
}).refine(data => data.periodStart <= data.periodEnd, {
  message: "Tanggal mulai periode tidak boleh melewati tanggal akhir periode",
  path: ["periodStart"],
});

export type ActivityReportInput = z.infer<typeof ActivityReportSchema>;
