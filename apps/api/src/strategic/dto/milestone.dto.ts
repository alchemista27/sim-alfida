
import { z } from 'zod';
import { ExecutionStatus } from '@sim/database';

export const CreateExecutionMilestoneSchema = z.object({
  programId: z.string().uuid(),
  order: z.number().int().optional(),
  name: z.string().min(1),
  output: z.string().optional().nullable(),
  weight: z.number().min(0).max(100).optional(),
  startDate: z.string().datetime().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
  actualEndDate: z.string().datetime().optional().nullable(),
  picId: z.string().uuid().optional().nullable(),
  status: z.nativeEnum(ExecutionStatus).optional(),
  progress: z.number().min(0).max(100).optional(),
  requiredEvidence: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
export const UpdateExecutionMilestoneSchema = CreateExecutionMilestoneSchema.partial();
export type CreateExecutionMilestoneDto = z.infer<typeof CreateExecutionMilestoneSchema>;
export type UpdateExecutionMilestoneDto = z.infer<typeof UpdateExecutionMilestoneSchema>;
