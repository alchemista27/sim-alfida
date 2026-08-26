import { z } from "zod";
import { LeaveType } from "@/generated/client";

export const LeaveRequestSchema = z.object({
  type: z.nativeEnum(LeaveType),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().min(5, "Alasan minimal 5 karakter"),
  attachmentUrl: z.string().optional(),
}).refine(data => data.startDate <= data.endDate, {
  message: "Tanggal mulai tidak boleh melewati tanggal selesai",
  path: ["startDate"],
}).refine(data => {
  if (data.type === LeaveType.sakit && !data.attachmentUrl) {
    return false;
  }
  return true;
}, {
  message: "Surat keterangan dokter wajib dilampirkan untuk izin sakit",
  path: ["attachmentUrl"],
});

export type LeaveRequestInput = z.infer<typeof LeaveRequestSchema>;
