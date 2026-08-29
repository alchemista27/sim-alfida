import { z } from "zod";

export const LiqoGroupSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Nama kelompok minimal 3 karakter").max(200, "Nama terlalu panjang"),
  murobbiId: z.string().uuid("Murobbi harus dipilih"),
  description: z.string().optional().nullable(),
});

export type LiqoGroupInput = z.infer<typeof LiqoGroupSchema>;

export const LiqoMemberSchema = z.object({
  groupId: z.string().uuid("Group ID tidak valid"),
  userId: z.string().uuid("User ID tidak valid"),
});

export type LiqoMemberInput = z.infer<typeof LiqoMemberSchema>;
