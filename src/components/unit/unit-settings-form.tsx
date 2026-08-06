"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { unitSettingsSchema, UnitSettingsInput } from "@/lib/validations/unit";
import { updateUnitSettingsAction } from "@/actions/unit";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "next/navigation";

interface UnitSettingsFormProps {
  unitId: string;
  unitName: string;
  unitLevel: string;
  defaultValues: {
    principalName: string;
    principalNip?: string;
  };
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
}

export function UnitSettingsForm({
  unitId,
  unitName,
  unitLevel,
  defaultValues,
  bankName,
  bankAccountNumber,
  bankAccountHolder,
}: UnitSettingsFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UnitSettingsInput>({
    resolver: zodResolver(unitSettingsSchema),
    defaultValues,
  });

  const onSubmit = async (data: UnitSettingsInput) => {
    setError(null);
    setSuccess(false);
    try {
      await updateUnitSettingsAction(unitId, data);
      setSuccess(true);
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Gagal menyimpan pengaturan unit.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Card 1 - Identitas Unit (readonly) */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-base font-bold text-primary mb-4 pb-2 border-b border-border">
          Identitas Unit
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Nama Unit</label>
            <input
              type="text"
              readOnly
              value={unitName}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-neutral text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Jenjang</label>
            <input
              type="text"
              readOnly
              value={unitLevel.toUpperCase()}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-neutral text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Card 2 - Kepala Sekolah (editable) */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-base font-bold text-primary mb-4 pb-2 border-b border-border">
            Kepala Sekolah
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded text-sm flex items-center gap-2">
              <Icon name="check_circle" className="text-base" />
              Pengaturan berhasil disimpan.
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Kepala Sekolah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("principalName")}
                className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-tertiary"
                placeholder="Contoh: Ibu Nur Hidayah, S.Pd."
              />
              {errors.principalName && (
                <p className="mt-1 text-xs text-red-500">{errors.principalName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIP Kepala Sekolah
              </label>
              <input
                type="text"
                {...register("principalNip")}
                className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-tertiary"
                placeholder="18 digit NIP (opsional)"
                maxLength={18}
              />
              {errors.principalNip && (
                <p className="mt-1 text-xs text-red-500">{errors.principalNip.message}</p>
              )}
            </div>
          </div>

          {/* Upload zones - placeholder for Sprint 5 */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo Unit</label>
              <div className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 bg-neutral/30 cursor-pointer hover:bg-neutral/60 transition-colors">
                <Icon name="cloud_upload" className="text-2xl" />
                <span className="text-xs font-medium">Klik atau drag logo (JPG/PNG, maks 2MB)</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanda Tangan Kepala Sekolah
              </label>
              <div className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 bg-neutral/30 cursor-pointer hover:bg-neutral/60 transition-colors">
                <Icon name="draw" className="text-2xl" />
                <span className="text-xs font-medium">Upload file tanda tangan (PNG transparan)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t border-border">
            <Button type="submit" variant="primary" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Icon name="sync" className="animate-spin text-sm" /> Menyimpan...
                </span>
              ) : (
                "Simpan Pengaturan"
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Card 3 - Rekening Bank (readonly, from foundation) */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-base font-bold text-primary mb-4 pb-2 border-b border-border">
          Rekening Bank Yayasan
        </h2>
        <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
          <Icon name="info" className="text-sm" />
          Rekening ini dikelola oleh Super Admin dan tidak dapat diubah di sini.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Bank</label>
            <input
              type="text"
              readOnly
              value={bankName || "Belum diatur"}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-neutral text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Nomor Rekening</label>
            <input
              type="text"
              readOnly
              value={bankAccountNumber || "Belum diatur"}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-neutral text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Atas Nama</label>
            <input
              type="text"
              readOnly
              value={bankAccountHolder || "Belum diatur"}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-neutral text-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
