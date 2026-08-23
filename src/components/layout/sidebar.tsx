"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface NavGroup {
  title: string;
  items: {
    title: string;
    href: string;
    icon: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    title: "Auth & Utama",
    items: [
      { title: "Login", href: "/login", icon: "login" },
      { title: "Register", href: "/register", icon: "person_add" },
      { title: "Pilih Modul", href: "/modules", icon: "apps" },
    ],
  },
  {
    title: "Super Admin",
    items: [
      { title: "Dashboard Admin", href: "/admin/dashboard", icon: "dashboard" },
      { title: "Pantauan Akademik", href: "/admin/academic", icon: "analytics" },
      { title: "Unit Pendidikan", href: "/admin/units", icon: "domain" },
      { title: "Manajemen Pengguna", href: "/admin/users", icon: "manage_accounts" },
    ],
  },
  {
    title: "Manajemen Karyawan",
    items: [
      { title: "Dasbor Kepegawaian", href: "/admin/hr/dashboard", icon: "analytics" },
      { title: "GPS & Hari Libur", href: "/admin/attendance-settings", icon: "settings_suggest" },
      { title: "Rekap Absensi", href: "/admin/hr/attendance", icon: "summarize" },
      { title: "Departemen / Bidang", href: "/admin/departments", icon: "domain" },
      { title: "Distribusi Pegawai", href: "/admin/staff", icon: "badge" },
      { title: "Kelola Cuti/Izin", href: "/admin/hr/leaves", icon: "event_available" },
      { title: "Program Kerja", href: "/admin/work-programs", icon: "assignment" },
      { title: "Laporan Aktivitas", href: "/admin/activity-reports", icon: "article" },
    ],
  },
  {
    title: "Bina Pribadi Islami",
    items: [
      { title: "Kelompok Liqo", href: "/admin/bpi/liqo", icon: "groups" },
    ],
  },
  {
    title: "Admin Unit (PPDB)",
    items: [
      { title: "Dashboard Unit", href: "/unit/dashboard", icon: "speed" },
      { title: "Settings Unit", href: "/unit/settings", icon: "tune" },
      { title: "Overview PPDB", href: "/unit/ppdb-overview", icon: "calendar_month" },
      { title: "Daftar Pendaftaran", href: "/unit/ppdb-registrations", icon: "list_alt" },
      { title: "Verifikasi Bayar", href: "/unit/ppdb-payments", icon: "receipt_long" },
      { title: "Verifikasi Berkas", href: "/unit/ppdb-verification", icon: "folder_open" },
      { title: "Observasi", href: "/unit/ppdb-observations", icon: "event_note" },
      { title: "Penempatan Kelas", href: "/unit/ppdb-classes", icon: "class" },
      { title: "Assign Observer", href: "/unit/observers", icon: "how_to_reg" },
    ],
  },
  {
    title: "Admin Unit (SDM & Absensi)",
    items: [
      { title: "Distribusi Pegawai", href: "/admin/staff", icon: "badge" },
      { title: "Pengaturan GPS & Libur", href: "/admin/attendance-settings", icon: "settings_suggest" },
      { title: "Rekap Absensi", href: "/admin/hr/attendance", icon: "summarize" },
      { title: "Kelola Cuti/Izin", href: "/admin/hr/leaves", icon: "event_available" },
    ],
  },
  {
    title: "Portal Orang Tua",
    items: [
      { title: "Dashboard Ortu", href: "/parent/dashboard", icon: "home" },
      { title: "Pilih Unit (Daftar Baru)", href: "/parent/select-unit", icon: "school" },
    ],
  },
  {
    title: "Observer",
    items: [
      { title: "Input Observasi", href: "/observer", icon: "rate_review" },
    ],
  },
  {
    title: "Admin Unit (Akademik)",
    items: [
      { title: "Tahun Ajaran", href: "/unit/academic-years", icon: "event" },
      { title: "Mata Pelajaran", href: "/unit/subjects", icon: "menu_book" },
      { title: "Kelas & Siswa", href: "/unit/classes", icon: "class" },
      { title: "Jadwal Pelajaran", href: "/unit/schedules", icon: "calendar_month" },
      { title: "Ekstrakurikuler", href: "/unit/extracurricular", icon: "sports_soccer" },
      { title: "Tagihan SPP", href: "/unit/spp", icon: "payments" },
      { title: "Kenaikan Kelas", href: "/unit/promotions", icon: "school" },
    ],
  },
  {
    title: "Guru (Akademik)",
    items: [
      { title: "Dashboard Guru", href: "/teacher/schedules", icon: "home" },
      { title: "Absensi Siswa", href: "/teacher/attendance", icon: "how_to_reg" },
      { title: "Jurnal Mengajar", href: "/teacher/journals", icon: "history_edu" },
      { title: "RPP", href: "/teacher/lesson-plans", icon: "assignment" },
      { title: "Input Nilai Harian", href: "/teacher/grades", icon: "grading" },
      { title: "Penilaian Ekskul", href: "/teacher/extracurricular", icon: "sports_score" },
      { title: "Rapor (LHBS)", href: "/teacher/lhbs", icon: "contact_page" },
    ],
  },
  {
    title: "Layanan Pegawai",
    items: [
      { title: "Absensi Harian", href: "/staff/attendance", icon: "fingerprint" },
      { title: "Riwayat Absensi", href: "/staff/attendance/history", icon: "history" },
      { title: "Mutabaah (Amal Yaumi)", href: "/staff/mutabaah", icon: "task_alt" },
      { title: "Jadwal Liqo (Karyawan)", href: "/staff/liqo", icon: "event_note" },
      { title: "Pengajuan Izin/Cuti", href: "/staff/leaves", icon: "event_busy" },
    ],
  },
  {
    title: "Grup Mentoring",
    items: [
      { title: "Dasbor Murobbi", href: "/murobbi/liqo", icon: "co_present" },
    ],
  },
  {
    title: "Portal Orang Tua (Akademik)",
    items: [
      { title: "Bayar SPP", href: "/parent/spp", icon: "receipt_long" },
      { title: "Rapor (LHBS)", href: "/parent/lhbs", icon: "auto_stories" },
    ],
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user, status } = useAuth();

  // Determine user roles
  const userRoles = user?.roles || [];
  const isSuperAdmin = userRoles.some((r: any) => r.role === "super_admin");
  const isAdminUnit = userRoles.some((r: any) => r.role === "admin_unit");
  const isAdminUnitNondik = userRoles.some((r: any) => r.role === "admin_unit_nondik");
  const isObserver = userRoles.some((r: any) => r.role === "observer");
  const isTeacher = userRoles.some((r: any) => r.role === "guru");
  const isKaryawan = userRoles.some((r: any) => r.role === "karyawan");
  const isAdminKepegawaian = userRoles.some((r: any) => r.role === "admin_kepegawaian");
  const isAdminBpi = userRoles.some((r: any) => r.role === "admin_bpi");
  const isMurobbi = userRoles.some((r: any) => r.role === "murobbi");
  const isParent = userRoles.some((r: any) => r.role === "orang_tua");

  const filteredGroups = navGroups.map(group => {
    // Hide auth links if logged in
    if (group.title === "Auth & Utama" && status === "authenticated") {
      return {
        ...group,
        items: group.items.filter(item => item.title !== "Login" && item.title !== "Register")
      };
    }
    // Filter department vs staff items for admin_kepegawaian
    if (group.title === "Manajemen Karyawan") {
      return {
        ...group,
        items: group.items.filter(item => {
          if (item.href === "/admin/departments" && !isSuperAdmin) return false;
          return true;
        })
      };
    }
    // Return group unmodified, items filter comes next
    return group;
  }).filter(group => {
    // If user is super admin, they should ONLY see Super Admin specific menus to avoid clutter,
    // even if they have other roles in the database.
    if (isSuperAdmin) {
      const allowedForSuperAdmin = ["Auth & Utama", "Super Admin", "Manajemen Karyawan", "Bina Pribadi Islami"];
      return allowedForSuperAdmin.includes(group.title);
    }

    // Filter groups based on role strictly for non-super-admins
    if (group.title === "Super Admin" && !isSuperAdmin) return false;
    if (group.title === "Manajemen Karyawan" && !isAdminKepegawaian) return false;
    if (group.title === "Bina Pribadi Islami" && !isAdminBpi) return false;
    if (group.title === "Grup Mentoring" && !isMurobbi) return false;
    if (group.title === "Admin Unit (PPDB)" && !isAdminUnit) return false;
    if (group.title === "Admin Unit (Akademik)" && !isAdminUnit) return false;
    if (group.title === "Admin Unit (SDM & Absensi)" && !isAdminUnit && !isAdminUnitNondik) return false;
    if (group.title === "Portal Orang Tua" && !isParent) return false;
    if (group.title === "Portal Orang Tua (Akademik)" && !isParent) return false;
    if (group.title === "Guru (Akademik)" && !isTeacher) return false;
    if (group.title === "Layanan Pegawai" && !isTeacher && !isKaryawan) return false;
    if (group.title === "Observer" && !isObserver) return false;
    
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed top-14 left-0 z-40 w-60 h-[calc(100vh-3.5rem)] bg-surface border-r border-border overflow-y-auto transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="py-4 space-y-4">
          {filteredGroups.map((group, idx) => (
            <div key={idx} className="px-3">
              <h4 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                {group.title}
              </h4>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium rounded transition-colors",
                        isActive
                          ? "bg-teal-50 text-tertiary font-semibold border-r-2 border-tertiary"
                          : "text-primary hover:bg-neutral hover:text-tertiary"
                      )}
                    >
                      <Icon name={item.icon} className="text-base" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
