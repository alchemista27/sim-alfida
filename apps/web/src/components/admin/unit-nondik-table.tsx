"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { deleteUnitAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { UnitLevel } from "@sim/shared";
import { UnitTableRow } from "./unit-table";

interface UnitNondikTableProps {
  data: UnitTableRow[];
}

export function UnitNondikTable({ data }: UnitNondikTableProps) {
  const [deletingUnit, setDeletingUnit] = useState<UnitTableRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const confirmDelete = async () => {
    if (!deletingUnit) return;
    setDeleteLoading(true);
    try {
      await deleteUnitAction(deletingUnit.id);
      setDeletingUnit(null);
    } catch (error: unknown) {
      alert("Gagal menghapus: " + (error instanceof Error ? error.message : "Terjadi kesalahan"));
    }
    setDeleteLoading(false);
  };

  const getLevelBadge = (level: UnitLevel) => {
    switch (level) {
      case "kantor_yayasan":
        return <Badge className="bg-indigo-100 text-indigo-700">Kantor Pusat</Badge>;
      case "non_pendidikan":
        return <Badge className="bg-slate-100 text-slate-700">Unit Usaha</Badge>;
      default:
        return <Badge variant="gray">{level}</Badge>;
    }
  };

  return (
    <>
    <div className="overflow-x-auto bg-surface rounded-xl border border-border">
      <table className="w-full text-sm text-left text-gray-600">
        <thead className="text-xs text-gray-500 uppercase bg-neutral/50 border-b border-border">
          <tr>
            <th className="px-6 py-4 font-semibold">Nama Unit</th>
            <th className="px-6 py-4 font-semibold">Jenis</th>
            <th className="px-6 py-4 font-semibold">Admin / Penanggung Jawab</th>
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="px-6 py-4 font-semibold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((unit) => (
            <tr key={unit.id} className="hover:bg-neutral/30 transition-colors">
              <td className="px-6 py-4 font-medium text-primary">
                {unit.name}
              </td>
              <td className="px-6 py-4">{getLevelBadge(unit.level)}</td>
              <td className="px-6 py-4">
                {unit.adminName ? (
                  <span className="font-medium text-primary">{unit.adminName}</span>
                ) : (
                  <span className="text-gray-400 italic">Belum ditentukan</span>
                )}
              </td>
              <td className="px-6 py-4">
                {unit.isActive ? (
                  <Badge variant="teal">Aktif</Badge>
                ) : (
                  <Badge variant="gray">Nonaktif</Badge>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/admin/units-nondik/${unit.id}`} passHref>
                    <Button variant="outline" size="sm">
                      <Icon name="settings" className="mr-1" />
                      Kelola
                    </Button>
                  </Link>
                  <button
                    onClick={() => setDeletingUnit(unit)}
                    className="text-red-600 hover:opacity-80 font-medium text-xs bg-transparent border border-red-300 px-3 py-1 rounded flex items-center"
                  >
                    <span className="material-symbols-rounded mr-1 text-[16px]">delete</span>
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                Belum ada data unit non-pendidikan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {deletingUnit && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-surface rounded-md shadow-xl w-full max-w-md overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-bold text-primary font-heading">Konfirmasi Hapus Unit</h3>
          </div>
          <div className="p-6">
            <p className="text-sm font-body text-primary">
              Apakah Anda yakin ingin menghapus unit <span className="font-bold">{deletingUnit.name}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <div className="bg-neutral px-6 py-4 flex justify-end gap-3">
            <button
              onClick={() => setDeletingUnit(null)}
              className="px-[20px] py-[12px] text-sm font-medium text-tertiary bg-transparent rounded hover:bg-black/5"
            >
              Batal
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleteLoading}
              className="px-[20px] py-[12px] text-sm font-medium text-white bg-red-600 hover:opacity-90 rounded disabled:opacity-50"
            >
              {deleteLoading ? 'Menghapus...' : 'Hapus Unit'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
