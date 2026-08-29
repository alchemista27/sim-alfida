import { z } from "zod";

export const verifyPaymentSchema = z.object({
  registrationId: z.string().min(1),
  isApproved: z.boolean(),
  reason: z.string().optional(),
});

export type VerifyPaymentDto = z.infer<typeof verifyPaymentSchema>;
