"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentDataSchema, StudentDataInput } from "@/lib/validations/ppdb";
import { submitStudentFormAction } from "@/actions/parent";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "next/navigation";

export function FormStudentClient({ 
  registrationId, 
  defaultValues 
}: { 
  registrationId: string;
  defaultValues?: Partial<StudentDataInput>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<StudentDataInput>({
    resolver: zodResolver(studentDataSchema),
    defaultValues: defaultValues || { gender: "male", religion: "Islam", siblingsCount: 0 },
  });

  const onSubmit = async (data: StudentDataInput) => {
    setError(null);
    try {
      await submitStudentFormAction(registrationId, data);
      router.push("/parent/form-parents");
    } catch (e: any) {
      setError(e.message || "Terjadi kesalahan saat menyimpan data.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
          <input type="text" {...register("fullName")} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none" />
          {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Panggilan <span className="text-red-500">*</span></label>
          <input type="text" {...register("nickname")} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none" />
          {errors.nickname && <p className="mt-1 text-xs text-red-500">{errors.nickname.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin <span className="text-red-500">*</span></label>
          <select {...register("gender")} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none bg-white">
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
          </select>
          {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Agama</label>
          <input type="text" {...register("religion")} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none" />
          {errors.religion && <p className="mt-1 text-xs text-red-500">{errors.religion.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir <span className="text-red-500">*</span></label>
          <input type="text" {...register("birthPlace")} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none" />
          {errors.birthPlace && <p className="mt-1 text-xs text-red-500">{errors.birthPlace.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir <span className="text-red-500">*</span></label>
          <input type="date" {...register("birthDate")} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none" />
          {errors.birthDate && <p className="mt-1 text-xs text-red-500">{errors.birthDate.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">NISN (Jika ada)</label>
          <input type="text" {...register("nisn")} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none" />
          {errors.nisn && <p className="mt-1 text-xs text-red-500">{errors.nisn.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Saudara</label>
          <input type="number" {...register("siblingsCount")} min={0} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none" />
          {errors.siblingsCount && <p className="mt-1 text-xs text-red-500">{errors.siblingsCount.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap <span className="text-red-500">*</span></label>
          <textarea {...register("address")} rows={3} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none" />
          {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Transportasi ke Sekolah</label>
          <input type="text" {...register("transportation")} placeholder="Misal: Diantar orang tua, jalan kaki, ojek" className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none" />
          {errors.transportation && <p className="mt-1 text-xs text-red-500">{errors.transportation.message}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan & Lanjut ke Data Orang Tua"} <Icon name="arrow_forward" className="ml-1" />
        </Button>
      </div>
    </form>
  );
}
