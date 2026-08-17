import { z } from "zod";

export const GenerateSppSchema = z.object({
  unitId: z.string().uuid(),
  academicYearId: z.string().uuid(),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000).max(2100),
  amount: z.coerce.number().min(0, "Nominal tidak boleh negatif"),
});

export const VerifySppSchema = z.object({
  invoiceId: z.string().uuid(),
  status: z.enum(["verified", "rejected"], { required_error: "Status verifikasi wajib dipilih" }),
  rejectionNote: z.string().optional(),
});
