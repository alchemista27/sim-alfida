
import { z } from 'zod';
import { ExecutionStatus, ExecutionPriority, VerificationStatus } from '@sim/database';

export const CreateExecutionTaskSchema = z.object({
  programId: z.string().uuid(),
  milestoneId: z.string().uuid().optional().nullable(),
  source: z.string().optional().nullable(),
  referenceId: z.string().uuid().optional().nullable(),
  description: z.string().min(1),
  expectedOutput: z.string().optional().nullable(),
  assignorId: z.string().uuid().optional().nullable(),
  assigneeId: z.string().uuid().optional().nullable(),
  delegationDate: z.string().datetime().optional(),
  deadline: z.string().datetime().optional().nullable(),
  priority: z.nativeEnum(ExecutionPriority).optional(),
  status: z.nativeEnum(ExecutionStatus).optional(),
  progress: z.number().min(0).max(100).optional(),
  actualEndDate: z.string().datetime().optional().nullable(),
  verifierId: z.string().uuid().optional().nullable(),
  verificationStatus: z.nativeEnum(VerificationStatus).optional(),
  verificationNotes: z.string().optional().nullable(),
});
export const UpdateExecutionTaskSchema = CreateExecutionTaskSchema.partial();
export type CreateExecutionTaskDto = z.infer<typeof CreateExecutionTaskSchema>;
export type UpdateExecutionTaskDto = z.infer<typeof UpdateExecutionTaskSchema>;
