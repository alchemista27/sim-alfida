"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { unitSchema, UnitInput } from "@/lib/validations/admin";
import { createUnitAction, updateUnitAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "next/navigation";

interface UnitFormProps {
  initialData?: UnitInput & { id?: string };
  onSuccess?: () => void;
}

export function UnitForm({ initialData, onSuccess }: UnitFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!initialData?.id;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UnitInput>({
    resolver: zodResolver(unitSchema),
    defaultValues: initialData || {
      name: "",
      slug: "",
      level: "tk",
      isActive: true,
    },
  });

  const nameValue = watch("name");

  // Auto-generate slug from name
  const generateSlug = () => {
    if (!nameValue) return;
    const slug = nameValue
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setValue("slug", slug, { shouldValidate: true });
  };

  const onSubmit = async (data: UnitInput) => {
    setError(null);
    try {
      if (isEditing) {
        await updateUnitAction(initialData.id!, data);
      } else {
        await createUnitAction(data);
      }
      if (onSuccess) onSuccess();
      else router.push("/admin/units");
    } catch (e: any) {
      setError(e.message || "Terjadi kesalahan saat menyimpan data unit.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded text-sm mb-4">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nama Unit Pendidikan
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            {...register("name")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-tertiary"
            placeholder="Contoh: TK Islam Terpadu Auladuna 1"
          />
          {!isEditing && (
            <Button type="button" variant="outline" onClick={generateSlug}>
              Generate Slug
            </Button>
          )}
        </div>
        {errors.name && (
          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL Slug
        </label>
        <input
          type="text"
          {...register("slug")}
          readOnly={isEditing}
          className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-tertiary ${
            isEditing ? "bg-gray-100 text-gray-500" : ""
          }`}
          placeholder="tk-auladuna-1"
        />
        {errors.slug && (
          <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Jenjang
        </label>
        <select
          {...register("level")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-tertiary bg-white"
        >
          <option value="tk">TK</option>
          <option value="sd">SD</option>
          <option value="smp">SMP</option>
          <option value="sma">SMA</option>
          <option value="pesantren">Pesantren</option>
        </select>
        {errors.level && (
          <p className="mt-1 text-xs text-red-500">{errors.level.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="isActive"
          {...register("isActive")}
          className="rounded border-gray-300 text-tertiary focus:ring-tertiary"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          Unit Aktif
        </label>
      </div>

      <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <Icon name="sync" className="animate-spin" />
          ) : (
            "Simpan Unit"
          )}
        </Button>
      </div>
    </form>
  );
}
