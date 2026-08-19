import { z } from "zod";

export const MutabaahRecordSchema = z.object({
  date: z.coerce.date(),
  sholatJamaah: z.number().int().min(0).max(5),
  sholatRawatib: z.number().int().min(0).max(12),
  sholatDhuha: z.boolean(),
  sholatTahajud: z.boolean(),
  tilawahPages: z.number().int().min(0),
  puasaSunnah: z.boolean(),
  infaq: z.boolean(),
});

export type MutabaahRecordInput = z.infer<typeof MutabaahRecordSchema>;
