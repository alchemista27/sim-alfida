
import { z } from 'zod';
import { EvidenceType, EvidenceNature, VerificationStatus } from '@sim/database';

export const CreateExecutionEvidenceSchema = z.object({
  programId: z.string().uuid(),
  milestoneId: z.string().uuid().optional().nullable(),
  taskId: z.string().uuid().optional().nullable(),
  name: z.string().min(1),
  type: z.nativeEnum(EvidenceType).optional(),
  nature: z.nativeEnum(EvidenceNature).optional(),
  ownerId: z.string().uuid().optional().nullable(),
  physicalLocation: z.string().optional().nullable(),
  digitalLink: z.string().optional().nullable(),
  availabilityStatus: z.string().optional().nullable(),
  documentDate: z.string().datetime().optional().nullable(),
  version: z.string().optional().nullable(),
  quality: z.string().optional().nullable(),
  verifierId: z.string().uuid().optional().nullable(),
  verificationStatus: z.nativeEnum(VerificationStatus).optional(),
  verificationDate: z.string().datetime().optional().nullable(),
  repairNeeded: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
export const UpdateExecutionEvidenceSchema = CreateExecutionEvidenceSchema.partial();
export type CreateExecutionEvidenceDto = z.infer<typeof CreateExecutionEvidenceSchema>;
export type UpdateExecutionEvidenceDto = z.infer<typeof UpdateExecutionEvidenceSchema>;
