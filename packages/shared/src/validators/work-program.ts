import { z } from "zod";
import { WorkProgramStatus } from "@sim/database";

export const WorkProgramSchema = z.object({
  departmentId: z.string().uuid("ID Departemen tidak valid"),
  academicYearId: z.string().uuid("ID Tahun Ajaran tidak valid").optional(),
  title: z.string().min(5, "Judul minimal 5 karakter").max(255),
  description: z.string().optional(),
  targetDate: z.coerce.date().optional(),
  status: z.nativeEnum(WorkProgramStatus).default(WorkProgramStatus.planned),
});

export type WorkProgramInput = z.infer<typeof WorkProgramSchema>;
