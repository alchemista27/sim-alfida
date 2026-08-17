import { z } from "zod";

export const GenerateLhbsSchema = z.object({
  enrollmentId: z.string().uuid(),
  semester: z.enum(["mid", "final"], { required_error: "Jenis semester wajib dipilih" }),
  notes: z.string().optional()
});
