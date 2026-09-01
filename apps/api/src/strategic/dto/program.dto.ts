
import { z } from 'zod';
import { ExecutionPriority } from '@sim/database';

export const CreateExecutionProgramSchema = z.object({
  departmentId: z.string().uuid(),
  academicYearId: z.string().uuid().optional().nullable(),
  title: z.string().min(1),
  source: z.string().optional().nullable(),
  objective: z.string().optional().nullable(),
  targetAudience: z.string().optional().nullable(),
  mainOutput: z.string().optional().nullable(),
  expectedOutcome: z.string().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDateRencana: z.string().datetime().optional().nullable(),
  userId: z.string().uuid().optional().nullable(), // PIC
  coordinatorId: z.string().uuid().optional().nullable(),
  priority: z.nativeEnum(ExecutionPriority).optional(),
  budgetRef: z.string().optional().nullable(),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled', 'delayed']).optional(),
  manualProgress: z.number().min(0).max(100).optional().nullable(),
});
export const UpdateExecutionProgramSchema = CreateExecutionProgramSchema.partial();
export type CreateExecutionProgramDto = z.infer<typeof CreateExecutionProgramSchema>;
export type UpdateExecutionProgramDto = z.infer<typeof UpdateExecutionProgramSchema>;
