import React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/actions/user";

interface ModuleCardProps {
  title: string;
  subtitle: string;
  icon: string;
  active?: boolean;
  href?: string;
}

function ModuleCard({
  title,
  subtitle,
  icon,
  active = false,
  href = "#",
}: ModuleCardProps) {
  return (
    <Card
      className={`flex flex-col justify-between p-6 transition-all ${
        active
          ? "border-tertiary shadow-sm hover:shadow-md"
          : "opacity-75 bg-neutral/50 border-border"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              active ? "bg-teal-50 text-tertiary" : "bg-gray-100 text-gray-400"
            }`}
          >
            <Icon name={icon} className="text-2xl" />
          </div>
          {active ? (
            <Badge variant="teal">AKTIF</Badge>
          ) : (
            <Badge variant="gray">Segera Hadir</Badge>
          )}
        </div>
        <h3 className="font-heading font-bold text-lg text-primary mb-1">
          {title}
        </h3>
        <p className="text-xs text-gray-500 mb-6">{subtitle}</p>
      </div>

      <div>
        {active ? (
          <Link
            href={href}
            className="w-full py-2.5 px-4 bg-tertiary text-on-tertiary rounded text-xs font-semibold flex items-center justify-center gap-2 hover:bg-tertiary/90 transition-colors"
          >
            <span>Buka Modul</span>
            <Icon name="arrow_forward" className="text-sm" />
          </Link>
        ) : (
          <button
            disabled
            className="w-full py-2.5 px-4 bg-gray-200 text-gray-400 rounded text-xs font-semibold cursor-not-allowed"
          >
            Belum Tersedia
          </button>
        )}
      </div>
    </Card>
  );
}

export default async function ModulesPage() {
  const user = await getCurrentUser();
  const roles = user?.roles || [];
  
  let dashboardHref = "/parent/dashboard"; // Default to parent
  
  if (roles.some((r: any) => r.role === "super_admin")) {
    dashboardHref = "/admin/dashboard";
  } else if (roles.some((r: any) => r.role === "admin_kepegawaian")) {
    dashboardHref = "/admin/hr/dashboard";
  } else if (roles.some((r: any) => r.role === "admin_unit")) {
    dashboardHref = "/unit/dashboard";
  } else if (roles.some((r: any) => r.role === "guru")) {
    dashboardHref = "/teacher/dashboard";
  } else if (roles.some((r: any) => r.role === "karyawan")) {
    dashboardHref = "/staff/attendance";
  }

  let hrHref = "/staff/attendance";
  if (roles.some((r: any) => r.role === "super_admin" || r.role === "admin_kepegawaian")) {
    hrHref = "/admin/hr/dashboard";
  } else if (roles.some((r: any) => r.role === "admin_bidang")) {
    hrHref = "/admin/work-programs";
  } else if (roles.some((r: any) => r.role === "admin_bpi")) {
    hrHref = "/admin/bpi/liqo";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-primary">
          Pilih Modul SIM-Alfida
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Selamat datang, {user?.name || "Pengguna"}. Pilih modul yang ingin Anda akses sesuai dengan peranan Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ModuleCard
          title="PPDB (Penerimaan Siswa Baru)"
          subtitle="Modul pendaftaran calon siswa baru, verifikasi berkas, observasi, dan seleksi."
          icon="school"
          active={true}
          href={dashboardHref}
        />

        <ModuleCard
          title="Modul Akademik"
          subtitle="Pengelolaan data siswa, kelas, jadwal pelajaran, nilai, rapor dan penyesuaian kurikulum."
          icon="menu_book"
          active={true}
          href={dashboardHref}
        />

        <ModuleCard
          title="Modul Surat Menyurat"
          subtitle="Generasi surat resmi yayasan, template kop surat, dan tanda tangan digital."
          icon="mail"
        />

        <ModuleCard
          title="Manajemen Karyawan"
          subtitle="Pengelolaan data guru & staf, presensi, homebase unit, dan dokumen kepegawaian."
          icon="badge"
          active={true}
          href={hrHref}
        />

        <ModuleCard
          title="Payroll & Penggajian"
          subtitle="Penghitungan gaji terintegrasi presensi, tunjangan, dan slip gaji digital."
          icon="payments"
        />

        <ModuleCard
          title="Rekrutmen Tenaga Kerja"
          subtitle="Penerimaan pegawai & guru baru yayasan Alfida."
          icon="work"
        />
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center gap-2">
        <Icon name="info" className="text-base text-blue-600 flex-shrink-0" />
        <span>
          Akses terhadap modul-modul di atas dibatasi secara otomatis berdasarkan peranan (role) akun Anda.
        </span>
      </div>
    </div>
  );
}
