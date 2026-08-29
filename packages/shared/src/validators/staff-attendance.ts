import { z } from "zod";

export const GpsCheckInOutSchema = z.object({
  latitude: z.number().min(-90).max(90, "Latitude tidak valid"),
  longitude: z.number().min(-180).max(180, "Longitude tidak valid"),
});

export type GpsCheckInOutInput = z.infer<typeof GpsCheckInOutSchema>;
