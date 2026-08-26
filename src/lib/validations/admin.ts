import { z } from "zod";
import { UnitLevel } from "@/generated/client";

export const unitSchema = z.object({
  name: z.string().min(3, "Nama unit minimal 3 karakter"),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh berisi huruf kecil, angka, dan strip"),
  level: z.nativeEnum(UnitLevel),
  isActive: z.boolean(),
});

export const assignAdminSchema = z.object({
  userId: z.string().uuid("User ID tidak valid"),
  unitId: z.string().uuid("Unit ID tidak valid"),
});

export type UnitInput = z.infer<typeof unitSchema>;
export type AssignAdminInput = z.infer<typeof assignAdminSchema>;
