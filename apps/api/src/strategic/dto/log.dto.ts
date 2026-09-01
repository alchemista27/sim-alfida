
import { z } from 'zod';

export const CreateExecutionLogSchema = z.object({
  programId: z.string().uuid(),
  milestoneId: z.string().uuid().optional().nullable(),
  activityDate: z.string().datetime(),
  activityName: z.string().min(1),
  location: z.string().optional().nullable(),
  picId: z.string().uuid().optional().nullable(),
  participantCount: z.number().int().optional().nullable(),
  output: z.string().optional().nullable(),
  budgetRef: z.string().optional().nullable(),
  issuesFound: z.string().optional().nullable(),
  recommendation: z.string().optional().nullable(),
  documentationLink: z.string().optional().nullable(),
  issueId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});
export const UpdateExecutionLogSchema = CreateExecutionLogSchema.partial();
export type CreateExecutionLogDto = z.infer<typeof CreateExecutionLogSchema>;
export type UpdateExecutionLogDto = z.infer<typeof UpdateExecutionLogSchema>;
