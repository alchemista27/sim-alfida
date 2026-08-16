"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { submitReEnrollment } from "@/server/actions/re-enrollment";

interface ReEnrollmentFormProps {
  currentEnrollmentId: string;
  nextAcademicYearId: string;
  initialAddress: string;
  initialTransportation: string;
}

export function ReEnrollmentForm({
  currentEnrollmentId,
  nextAcademicYearId,
  initialAddress,
  initialTransportation,
}: ReEnrollmentFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [address, setAddress] = useState(initialAddress);
  const [transportation, setTransportation] = useState(initialTransportation);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    
    const result = await submitReEnrollment({
      currentEnrollmentId,
      nextAcademicYearId,
      address,
      transportation,
    });

    setIsPending(false);

    if (result.success) {
      alert("Berhasil mendaftarkan ulang siswa!");
      router.push("/parent/academic/re-enrollment");
      router.refresh();
    } else {
      setError(result.error || "Gagal melakukan daftar ulang.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Alamat Tempat Tinggal Saat Ini
        </label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Masukkan alamat lengkap"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Alat Transportasi
        </label>
        <select
          value={transportation}
          onChange={(e) => setTransportation(e.target.value)}
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Pilih transportasi</option>
          <option value="Jalan Kaki">Jalan Kaki</option>
          <option value="Sepeda">Sepeda</option>
          <option value="Sepeda Motor">Sepeda Motor</option>
          <option value="Mobil Pribadi">Mobil Pribadi</option>
          <option value="Antar Jemput Sekolah">Antar Jemput Sekolah</option>
          <option value="Angkutan Umum">Angkutan Umum</option>
        </select>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Menyimpan..." : "Konfirmasi Daftar Ulang"}
      </Button>
    </form>
  );
}
