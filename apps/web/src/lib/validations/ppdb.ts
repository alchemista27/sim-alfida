import { z } from "zod";

export const studentDataSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  nickname: z.string().min(2, "Nama panggilan minimal 2 karakter"),
  gender: z.enum(["male", "female"], { required_error: "Pilih jenis kelamin" }),
  birthPlace: z.string().min(3, "Tempat lahir wajib diisi"),
  birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
  religion: z.string().min(1, "Agama wajib diisi"),
  nisn: z.string().optional(), // NISN is optional for TK
  siblingsCount: z.coerce.number().min(0),
  address: z.string().min(10, "Alamat lengkap wajib diisi"),
  transportation: z.string().optional(),
});

export const parentDataSchema = z.object({
  father: z.object({
    fullName: z.string().min(3, "Nama ayah wajib diisi"),
    nik: z.string().length(16, "NIK harus 16 digit").regex(/^[0-9]+$/, "Hanya angka"),
    birthPlace: z.string().min(3, "Tempat lahir wajib diisi"),
    birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
    education: z.string().min(2, "Pendidikan terakhir wajib diisi"),
    occupation: z.string().min(2, "Pekerjaan wajib diisi"),
    incomeRange: z.string().min(1, "Rentang penghasilan wajib diisi"),
    phone: z.string().min(10, "Nomor HP tidak valid"),
    address: z.string().min(10, "Alamat wajib diisi"),
  }),
  mother: z.object({
    fullName: z.string().min(3, "Nama ibu wajib diisi"),
    nik: z.string().length(16, "NIK harus 16 digit").regex(/^[0-9]+$/, "Hanya angka"),
    birthPlace: z.string().min(3, "Tempat lahir wajib diisi"),
    birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
    education: z.string().min(2, "Pendidikan terakhir wajib diisi"),
    occupation: z.string().min(2, "Pekerjaan wajib diisi"),
    incomeRange: z.string().min(1, "Rentang penghasilan wajib diisi"),
    phone: z.string().min(10, "Nomor HP tidak valid"),
    address: z.string().min(10, "Alamat wajib diisi"),
  }),
});

export type StudentDataInput = z.infer<typeof studentDataSchema>;
export type ParentDataInput = z.infer<typeof parentDataSchema>;
