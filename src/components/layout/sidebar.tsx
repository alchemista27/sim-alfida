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
      { title: "Unit Pendidikan", href: "/admin/units", icon: "domain" },
      { title: "Manajemen Pengguna", href: "/admin/users", icon: "manage_accounts" },
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
    ],
  },
  {
    title: "Portal Orang Tua",
    items: [
      { title: "Dashboard Ortu", href: "/parent/dashboard", icon: "home" },
      { title: "Pilih Unit", href: "/parent/select-unit", icon: "school" },
      { title: "Pembayaran", href: "/parent/payment", icon: "payments" },
      { title: "Form Siswa", href: "/parent/form-student", icon: "assignment" },
      { title: "Form Ortu", href: "/parent/form-parents", icon: "family_restroom" },
      { title: "Upload Berkas", href: "/parent/documents", icon: "upload_file" },
      { title: "Surat IMC", href: "/parent/medical", icon: "local_hospital" },
      { title: "Jadwal Observasi", href: "/parent/observation", icon: "event_available" },
      { title: "Hasil Seleksi", href: "/parent/result", icon: "emoji_events" },
    ],
  },
  {
    title: "Observer",
    items: [
      { title: "Input Observasi", href: "/observer/input", icon: "rate_review" },
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
  const isParent = !isSuperAdmin && !isAdminUnit && status === "authenticated";

  const filteredGroups = navGroups.map(group => {
    // Hide auth links if logged in
    if (group.title === "Auth & Utama" && status === "authenticated") {
      return {
        ...group,
        items: group.items.filter(item => item.title !== "Login" && item.title !== "Register")
      };
    }
    return group;
  }).filter(group => {
    // Filter groups based on role
    if (group.title === "Super Admin" && !isSuperAdmin) return false;
    if (group.title === "Admin Unit (PPDB)" && !isAdminUnit) return false;
    if (group.title === "Portal Orang Tua" && !isParent) return false;
    if (group.title === "Observer") return false; // Hide observer for now
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
