import { z } from "zod";

export const DepartmentSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Nama bidang minimal 3 karakter"),
  description: z.string().optional().nullable(),
  unitId: z.string().uuid("Unit ID tidak valid").optional().nullable(),
  isActive: z.boolean().default(true),
});

export type DepartmentInput = z.infer<typeof DepartmentSchema>;

export const AssignDepartmentAdminSchema = z.object({
  departmentId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type AssignDepartmentAdminInput = z.infer<typeof AssignDepartmentAdminSchema>;

export const AssignStaffSchema = z.object({
  userId: z.string().uuid(),
  unitId: z.string().uuid(),
  role: z.enum(["guru", "karyawan"]),
});

export type AssignStaffInput = z.infer<typeof AssignStaffSchema>;
