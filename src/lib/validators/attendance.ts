import { z } from "zod";

export const GpsConfigSchema = z.object({
  unitId: z.string().uuid(),
  latitude: z.number().min(-90).max(90, "Latitude tidak valid"),
  longitude: z.number().min(-180).max(180, "Longitude tidak valid"),
  radiusMeters: z.number().positive("Radius harus lebih besar dari 0").default(50),
});

export type GpsConfigInput = z.infer<typeof GpsConfigSchema>;

export const HolidaySchema = z.object({
  id: z.string().uuid().optional(),
  unitId: z.string().uuid().optional().nullable(), // Jika null, berarti libur nasional untuk semua unit
  date: z.date(),
  name: z.string().min(3, "Nama libur minimal 3 karakter"),
  description: z.string().optional().nullable(),
});

export type HolidayInput = z.infer<typeof HolidaySchema>;
