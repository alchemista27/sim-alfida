"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parentDataSchema, ParentDataInput } from "@/lib/validations/ppdb";
import { submitParentFormAction } from "@/actions/parent";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function FormParentsClient({ 
  registrationId, 
  defaultValues 
}: { 
  registrationId: string;
  defaultValues?: Partial<ParentDataInput>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ParentDataInput>({
    resolver: zodResolver(parentDataSchema),
    defaultValues: defaultValues || {
      father: { education: "SMA", incomeRange: "Rp 3.000.000 - Rp 5.000.000" },
      mother: { education: "SMA", incomeRange: "Tidak Berpenghasilan" },
    },
  });

  const onSubmit = async (data: ParentDataInput) => {
    setError(null);
    try {
      await submitParentFormAction(registrationId, data);
      // It will redirect automatically from action, but just in case:
    } catch (e: any) {
      setError(e.message || "Terjadi kesalahan saat menyimpan data.");
    }
  };

  const ParentSection = ({ prefix, title }: { prefix: "father" | "mother", title: string }) => (
    <div className="space-y-6">
      <h3 className="font-bold text-lg text-primary border-b border-border pb-2">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
          <input type="text" {...register(`${prefix}.fullName`)} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none" />
          {errors[prefix]?.fullName && <p className="mt-1 text-xs text-red-500">{errors[prefix]?.fullName?.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">NIK (16 Digit) <span className="text-red-500">*</span></label>
          <input type="text" maxLength={16} {...register(`${prefix}.nik`)} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none" />
          {errors[prefix]?.nik && <p className="mt-1 text-xs text-red-500">{errors[prefix]?.nik?.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir <span className="text-red-500">*</span></label>
          <input type="text" {...register(`${prefix}.birthPlace`)} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none" />
          {errors[prefix]?.birthPlace && <p className="mt-1 text-xs text-red-500">{errors[prefix]?.birthPlace?.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir <span className="text-red-500">*</span></label>
          <input type="date" {...register(`${prefix}.birthDate`)} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none" />
          {errors[prefix]?.birthDate && <p className="mt-1 text-xs text-red-500">{errors[prefix]?.birthDate?.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pendidikan Terakhir <span className="text-red-500">*</span></label>
          <select {...register(`${prefix}.education`)} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none bg-white">
            {["SD", "SMP", "SMA", "D3", "S1", "S2", "S3", "Lainnya"].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          {errors[prefix]?.education && <p className="mt-1 text-xs text-red-500">{errors[prefix]?.education?.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan <span className="text-red-500">*</span></label>
          <input type="text" {...register(`${prefix}.occupation`)} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none" />
          {errors[prefix]?.occupation && <p className="mt-1 text-xs text-red-500">{errors[prefix]?.occupation?.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rentang Penghasilan <span className="text-red-500">*</span></label>
          <select {...register(`${prefix}.incomeRange`)} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none bg-white">
            <option value="Tidak Berpenghasilan">Tidak Berpenghasilan</option>
            <option value="< Rp 1.000.000">&lt; Rp 1.000.000</option>
            <option value="Rp 1.000.000 - Rp 3.000.000">Rp 1.000.000 - Rp 3.000.000</option>
            <option value="Rp 3.000.000 - Rp 5.000.000">Rp 3.000.000 - Rp 5.000.000</option>
            <option value="> Rp 5.000.000">&gt; Rp 5.000.000</option>
          </select>
          {errors[prefix]?.incomeRange && <p className="mt-1 text-xs text-red-500">{errors[prefix]?.incomeRange?.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WA/HP <span className="text-red-500">*</span></label>
          <input type="text" {...register(`${prefix}.phone`)} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none" />
          {errors[prefix]?.phone && <p className="mt-1 text-xs text-red-500">{errors[prefix]?.phone?.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap <span className="text-red-500">*</span></label>
          <textarea {...register(`${prefix}.address`)} rows={2} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none" />
          {errors[prefix]?.address && <p className="mt-1 text-xs text-red-500">{errors[prefix]?.address?.message}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
      
      <ParentSection prefix="father" title="Data Ayah / Wali Laki-laki" />
      <ParentSection prefix="mother" title="Data Ibu / Wali Perempuan" />

      <div className="flex justify-between pt-4 border-t border-border">
        <Link href="/parent/form-student">
          <Button type="button" variant="ghost">
            <Icon name="arrow_back" className="mr-1" /> Kembali ke Data Siswa
          </Button>
        </Link>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Kirim & Lanjut Tahap Berikutnya"} <Icon name="check" className="ml-1" />
        </Button>
      </div>
    </form>
  );
}
