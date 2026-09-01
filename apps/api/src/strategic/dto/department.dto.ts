
import { z } from 'zod';
export const CreateDepartmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  unitId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional().nullable(),
  leaderId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().optional(),
});
export const UpdateDepartmentSchema = CreateDepartmentSchema.partial();
export type CreateDepartmentDto = z.infer<typeof CreateDepartmentSchema>;
export type UpdateDepartmentDto = z.infer<typeof UpdateDepartmentSchema>;
