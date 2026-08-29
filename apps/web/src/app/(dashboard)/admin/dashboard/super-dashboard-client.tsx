"use client";

import React from "react";
import { StatCard } from "@/components/admin/stat-card";

interface SuperDashboardClientProps {
  bpiOverview: {
    liqoAttendanceRate: number;
    avgJamaah: number;
    avgTilawah: number;
  };
  deptOverview: {
    planned: number;
    ongoing: number;
    completed: number;
    totalReports: number;
  };
  attOverview: {
    present: number;
    late: number;
    absent: number;
    activeLeaves: number;
  };
}

export function SuperDashboardClient({
  bpiOverview,
  deptOverview,
  attOverview,
}: SuperDashboardClientProps) {
  return (
    <div className="space-y-8">
      {/* Section A: Bina Pribadi Islami */}
      <div>
        <h2 className="font-heading font-semibold text-xl text-primary mb-4">Bina Pribadi Islami</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Indeks Kehadiran Liqo"
            value={`${bpiOverview.liqoAttendanceRate}%`}
            icon="group"
          />
          <StatCard
            title="Rata-rata Sholat Jamaah"
            value={`${Number(bpiOverview.avgJamaah).toFixed(1)}/5`}
            icon="mosque"
          />
          <StatCard
            title="Rata-rata Tilawah"
            value={`${Number(bpiOverview.avgTilawah).toFixed(1)} hal`}
            icon="menu_book"
          />
        </div>
      </div>

      {/* Section B: Kinerja Bidang */}
      <div>
        <h2 className="font-heading font-semibold text-xl text-primary mb-4">Kinerja Bidang</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Proker Selesai"
            value={deptOverview.completed}
            icon="task_alt"
          />
          <StatCard
            title="Proker Berjalan"
            value={deptOverview.ongoing}
            icon="pending_actions"
          />
          <StatCard
            title="Total Laporan Masuk"
            value={deptOverview.totalReports}
            icon="description"
          />
        </div>
      </div>

      {/* Section C: Kedisiplinan Hari Ini */}
      <div>
        <h2 className="font-heading font-semibold text-xl text-primary mb-4">Kedisiplinan Hari Ini</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Hadir Tepat Waktu"
            value={attOverview.present}
            icon="how_to_reg"
          />
          <StatCard
            title="Terlambat"
            value={attOverview.late}
            icon="alarm_off"
          />
          <StatCard
            title="Sedang Cuti/Izin"
            value={attOverview.activeLeaves}
            icon="event_busy"
          />
        </div>
      </div>
    </div>
  );
}
