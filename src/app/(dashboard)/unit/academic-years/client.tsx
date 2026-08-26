"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { academicYearSchema, AcademicYearInput } from "@/lib/validations/unit";
import { createAcademicYearAction } from "@/actions/unit";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "next/navigation";

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  quota: number;
  ppdbActive: boolean;
}

interface Props {
  unitId: string;
  unitName: string;
  years: AcademicYear[];
}

export function AcademicYearClient({ unitId, unitName, years }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AcademicYearInput>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      quota: 1,
      ppdbActive: false,
    },
  });

  const onSubmit = async (data: AcademicYearInput) => {
    setServerError(null);
    try {
      // Pastikan form dikirim dengan kuota 1 (default akademik) dan ppdbActive = false
      await createAcademicYearAction(unitId, { ...data, quota: 1, ppdbActive: false });
      reset();
      setShowModal(false);
      router.refresh();
    } catch (e: any) {
      setServerError(e.message || "Gagal membuat tahun ajaran.");
    }
  };

  const fmt = (isoStr: string) => {
    if (!isoStr) return "-";
    return new Date(isoStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-xl text-primary">
            Riwayat Tahun Ajaran
          </h2>
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
            <Icon name="add" className="mr-1" />
            Tambah Tahun Ajaran
          </Button>
        </div>

        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-500 uppercase bg-neutral/50 border-b border-border">
              <tr>
                <th className="px-5 py-3 font-semibold">Tahun Ajaran</th>
                <th className="px-5 py-3 font-semibold">Mulai</th>
                <th className="px-5 py-3 font-semibold">Selesai</th>
                <th className="px-5 py-3 font-semibold">Digunakan PPDB?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {years.map((ay) => (
                <tr key={ay.id} className="hover:bg-neutral/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-primary">{ay.name}</td>
                  <td className="px-5 py-3">{fmt(ay.startDate)}</td>
                  <td className="px-5 py-3">{fmt(ay.endDate)}</td>
                  <td className="px-5 py-3">
                    {ay.ppdbActive ? (
                      <span className="text-teal-600 font-medium">Ya</span>
                    ) : (
                      <span className="text-gray-400">Tidak</span>
                    )}
                  </td>
                </tr>
              ))}
              {years.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-gray-400 text-sm">
                    Belum ada tahun ajaran terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface w-full max-w-md rounded-xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-primary mb-4">
              Tambah Tahun Ajaran Baru
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{serverError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Tahun Ajaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("name")}
                  placeholder="Contoh: 2027/2028"
                  className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                  <input type="date" {...register("startDate")} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none" />
                  {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                  <input type="date" {...register("endDate")} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none" />
                  {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate.message}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setShowModal(false); reset(); }}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
