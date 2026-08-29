"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { UnitLevel } from "@sim/shared";

// DTO for Unit in Table
export interface UnitTableRow {
  id: string;
  name: string;
  level: UnitLevel;
  isActive: boolean;
  quota: number;
  registered: number;
  adminName: string | null;
  ppdbActive: boolean;
  activeStudents: number;
  attendanceRate: number;
}

interface UnitTableProps {
  data: UnitTableRow[];
}

export function UnitTable({ data }: UnitTableProps) {
  const getLevelBadge = (level: UnitLevel) => {
    switch (level) {
      case "tk":
        return <Badge variant="teal">TK</Badge>;
      case "sd":
        return <Badge className="bg-blue-100 text-blue-700">SD</Badge>;
      case "smp":
        return <Badge className="bg-orange-100 text-orange-700">SMP</Badge>;
      case "sma":
        return <Badge className="bg-purple-100 text-purple-700">SMA</Badge>;
      case "pesantren":
        return <Badge className="bg-green-100 text-green-700">Pesantren</Badge>;
      default:
        return <Badge variant="gray">{level}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto bg-surface rounded-xl border border-border">
      <table className="w-full text-sm text-left text-gray-600">
        <thead className="text-xs text-gray-500 uppercase bg-neutral/50 border-b border-border">
          <tr>
            <th className="px-6 py-4 font-semibold">Nama Unit</th>
            <th className="px-6 py-4 font-semibold">Jenjang</th>
            <th className="px-6 py-4 font-semibold">Pendaftar PPDB</th>
            <th className="px-6 py-4 font-semibold">Siswa Aktif</th>
            <th className="px-6 py-4 font-semibold">Kehadiran</th>
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
                <span className="font-bold">{unit.registered}</span>
                <span className="text-gray-400 text-xs ml-1">/ {unit.quota}</span>
                {unit.ppdbActive && <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full" title="PPDB Aktif"></span>}
              </td>
              <td className="px-6 py-4 font-bold text-teal-700">{unit.activeStudents}</td>
              <td className="px-6 py-4">
                <Badge variant={unit.attendanceRate >= 90 ? "teal" : unit.attendanceRate >= 75 ? "amber" : "red"}>
                  {unit.attendanceRate}%
                </Badge>
              </td>
              <td className="px-6 py-4 text-right">
                <Link href={`/admin/units/${unit.id}`} passHref>
                  <Button variant="outline" size="sm">
                    <Icon name="settings" className="mr-1" />
                    Kelola
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                Belum ada data unit pendidikan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
