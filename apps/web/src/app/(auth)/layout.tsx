import React from "react";
import { Icon } from "@/components/ui/icon";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await prisma.foundationSettings.findFirst();
  const logoUrl = settings?.logoUrl || null;
  const foundationName = settings?.foundationName || "Yayasan Alfida";

  return (
    <div className="flex min-h-screen w-full bg-neutral">
      {/* Left Panel - Branding (40% Desktop) */}
      <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-tertiary to-secondary text-on-tertiary flex-col justify-between p-12 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center p-1">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Icon name="hub" className="text-2xl text-tertiary" />
            )}
          </div>
          <span className="font-heading font-bold text-2xl tracking-tight text-surface">
            SIM-Alfida
          </span>
        </div>

        <div className="my-auto space-y-4">
          <h1 className="font-heading text-3xl font-extrabold leading-tight text-surface">
            Sistem Informasi Manajemen Terpadu
          </h1>
          <p className="text-base text-surface/90 font-normal max-w-md">
            Layanan pengelolaan pendidikan, pendaftaran calon siswa baru (PPDB), dan administrasi di lingkungan {foundationName}.
          </p>
        </div>

        <div className="text-xs text-surface/70">
          &copy; {new Date().getFullYear()} {foundationName}. All rights reserved.
        </div>

        {/* Decorative circle */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-surface/10 blur-2xl pointer-events-none" />
      </div>

      {/* Right Panel - Form (60% Desktop) */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-surface">
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Mobile Logo Branding */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8 object-contain" />
            ) : (
              <Icon name="hub" className="text-3xl text-tertiary" />
            )}
            <span className="font-heading font-bold text-xl text-tertiary">
              SIM-Alfida
            </span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
