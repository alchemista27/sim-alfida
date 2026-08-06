"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { academicYearSchema, AcademicYearInput } from "@/lib/validations/unit";
import { createAcademicYearAction, togglePpdbActiveAction } from "@/actions/unit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "next/navigation";

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  quota: number;
  registered: number;
  ppdbActive: boolean;
}

interface PpdbOverviewClientProps {
  unitId: string;
  unitName: string;
  activeYear: AcademicYear | null;
  pastYears: AcademicYear[];
}

export function PpdbOverviewClient({
  unitId,
  unitName,
  activeYear,
  pastYears,
}: PpdbOverviewClientProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);

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
      quota: 30,
      ppdbActive: false,
    },
  });

  const onSubmit = async (data: AcademicYearInput) => {
    setServerError(null);
    try {
      await createAcademicYearAction(unitId, data);
      reset();
      setShowModal(false);
      router.refresh();
    } catch (e: any) {
      setServerError(e.message || "Gagal membuat tahun ajaran.");
    }
  };

  const handleToggle = async (ayId: string, activate: boolean) => {
    setIsToggling(true);
    try {
      await togglePpdbActiveAction(unitId, ayId, activate);
      router.refresh();
    } catch {
      alert("Gagal mengubah status PPDB.");
    } finally {
      setIsToggling(false);
    }
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-8">
      {/* Active Year Card */}
      <div>
        <h2 className="font-heading font-semibold text-xl text-primary mb-4">
          Tahun Ajaran Aktif
        </h2>
        {activeYear ? (
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-tertiary/30 rounded-xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-primary font-heading">
                    {activeYear.name}
                  </h3>
                  <Badge variant="green">PPDB Aktif</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {fmt(activeYear.startDate)} — {fmt(activeYear.endDate)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Kuota:{" "}
                  <span className="font-bold text-primary">
                    {activeYear.registered}/{activeYear.quota}
                  </span>{" "}
                  slot terisi
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                disabled={isToggling}
                onClick={() => handleToggle(activeYear.id, false)}
              >
                <Icon name="pause_circle" className="mr-1" />
                Nonaktifkan PPDB
              </Button>
            </div>
            {/* Progress bar */}
            <div className="mt-4 w-full bg-white/60 rounded-full h-2.5">
              <div
                className="h-full rounded-full bg-tertiary transition-all"
                style={{
                  width: `${Math.min(
                    Math.round((activeYear.registered / activeYear.quota) * 100),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500 bg-neutral/30">
            <Icon name="event_busy" className="text-4xl mb-2 text-gray-300" />
            <p className="text-sm font-medium">Belum ada PPDB aktif untuk {unitName}.</p>
            <p className="text-xs mt-1">
              Buat tahun ajaran baru dan aktifkan PPDB-nya.
            </p>
          </div>
        )}
      </div>

      {/* Past Years Table */}
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
                <th className="px-5 py-3 font-semibold">Kuota</th>
                <th className="px-5 py-3 font-semibold">Terdaftar</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...(activeYear ? [activeYear] : []), ...pastYears].map((ay) => (
                <tr key={ay.id} className="hover:bg-neutral/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-primary">{ay.name}</td>
                  <td className="px-5 py-3">{fmt(ay.startDate)}</td>
                  <td className="px-5 py-3">{fmt(ay.endDate)}</td>
                  <td className="px-5 py-3">{ay.quota}</td>
                  <td className="px-5 py-3">{ay.registered}</td>
                  <td className="px-5 py-3">
                    {ay.ppdbActive ? (
                      <Badge variant="green">Aktif</Badge>
                    ) : (
                      <Badge variant="gray">Nonaktif</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {!ay.ppdbActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isToggling}
                        onClick={() => handleToggle(ay.id, true)}
                      >
                        Aktifkan
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {!activeYear && pastYears.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                    Belum ada tahun ajaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kuota Siswa
                </label>
                <input
                  type="number"
                  {...register("quota")}
                  min={1}
                  max={500}
                  className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none"
                />
                {errors.quota && <p className="mt-1 text-xs text-red-500">{errors.quota.message}</p>}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ppdbActive"
                  {...register("ppdbActive")}
                  className="rounded border-gray-300 text-tertiary"
                />
                <label htmlFor="ppdbActive" className="text-sm font-medium text-gray-700">
                  Langsung aktifkan PPDB
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
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
