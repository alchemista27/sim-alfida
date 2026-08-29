import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
    email: z.string().email("Format email tidak valid"),
    phone: z
      .string()
      .min(10, "Nomor WA/HP minimal 10 digit")
      .max(15, "Nomor WA/HP maksimal 15 digit")
      .regex(/^[0-9]+$/, "Nomor HP hanya boleh berisi angka"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[A-Z]/, "Password wajib mengandung setidaknya 1 huruf besar")
      .regex(/[0-9]/, "Password wajib mengandung setidaknya 1 angka"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
