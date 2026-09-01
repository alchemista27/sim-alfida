
import { z } from 'zod';
import { KPIIndicatorType, KPIDirection, KPIUpdateFrequency } from '@sim/database';

export const CreateExecutionKPISchema = z.object({
  programId: z.string().uuid(),
  name: z.string().min(1),
  indicatorType: z.nativeEnum(KPIIndicatorType),
  direction: z.nativeEnum(KPIDirection).optional(),
  baseline: z.number().optional(),
  target: z.number().optional(),
  realization: z.number().optional(),
  unit: z.string().min(1),
  weight: z.number().min(0).max(100).optional(),
  dataSource: z.string().optional().nullable(),
  updateFrequency: z.nativeEnum(KPIUpdateFrequency).optional(),
  picId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});
export const UpdateExecutionKPISchema = CreateExecutionKPISchema.partial();
export type CreateExecutionKPIDto = z.infer<typeof CreateExecutionKPISchema>;
export type UpdateExecutionKPIDto = z.infer<typeof UpdateExecutionKPISchema>;
