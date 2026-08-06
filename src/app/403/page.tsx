import React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral p-4">
      <div className="max-w-md w-full bg-surface rounded-xl shadow-sm border border-border p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <Icon name="block" className="text-3xl" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-primary mb-2">
          403 Forbidden
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Anda tidak memiliki izin (role) yang diperlukan untuk mengakses halaman ini. Jika ini adalah kesalahan, silakan hubungi administrator sistem.
        </p>
        <Link href="/modules" passHref>
          <Button variant="primary">Kembali ke Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
