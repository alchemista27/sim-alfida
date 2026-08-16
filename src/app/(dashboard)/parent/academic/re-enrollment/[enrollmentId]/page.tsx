import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ReEnrollmentForm } from "./form";

export const metadata = {
  title: "Form Daftar Ulang | SIM-Alfida",
};

export default async function ReEnrollmentFormPage({
  params,
}: {
  params: { enrollmentId: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Ambil data enrollment yang akan didaftarkan ulang
  const currentEnrollment = await prisma.studentEnrollment.findUnique({
    where: {
      id: params.enrollmentId,
      parentId: user.id,
      status: "active",
    },
    include: {
      studentData: true,
      academicYear: {
        include: {
          unit: true,
        },
      },
    },
  });

  if (!currentEnrollment) {
    redirect("/parent/academic/re-enrollment");
  }

  // Cari tahun ajaran berikutnya untuk unit yang sama
  // Asumsi: Admin Unit sudah membuat tahun ajaran baru dengan tanggal mulai > tahun ajaran sekarang
  const nextAcademicYear = await prisma.academicYear.findFirst({
    where: {
      unitId: currentEnrollment.academicYear.unitId,
      startDate: {
        gt: currentEnrollment.academicYear.endDate,
      },
    },
    orderBy: {
      startDate: "asc",
    },
  });

  if (!nextAcademicYear) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Daftar Ulang: {currentEnrollment.studentData.fullName}</h1>
        <Card>
          <div className="pt-6">
            <p className="text-destructive text-center">
              Maaf, pendaftaran ulang belum dibuka karena Tahun Ajaran berikutnya belum diatur oleh admin sekolah.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Cek apakah sudah pernah didaftarkan ulang
  const existingReEnrollment = await prisma.studentEnrollment.findUnique({
    where: {
      studentDataId_academicYearId: {
        studentDataId: currentEnrollment.studentDataId,
        academicYearId: nextAcademicYear.id,
      },
    },
  });

  if (existingReEnrollment) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Daftar Ulang: {currentEnrollment.studentData.fullName}</h1>
        <Card>
          <div className="pt-6">
            <p className="text-primary font-medium text-center">
              Siswa ini sudah berhasil didaftarkan ulang untuk tahun ajaran {nextAcademicYear.name}.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Formulir Daftar Ulang</h1>
        <p className="text-muted-foreground">
          Pastikan data alamat dan transportasi di bawah ini benar sebelum mendaftarkan ulang.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Data Siswa</CardTitle>
          </CardHeader>
          <div className="space-y-2 mt-4">
            <div>
              <span className="font-semibold text-sm">Nama Lengkap:</span>
              <p className="text-sm text-muted-foreground">{currentEnrollment.studentData.fullName}</p>
            </div>
            <div>
              <span className="font-semibold text-sm">NISN:</span>
              <p className="text-sm text-muted-foreground">{currentEnrollment.studentData.nisn || "-"}</p>
            </div>
            <div>
              <span className="font-semibold text-sm">Tahun Ajaran Lama:</span>
              <p className="text-sm text-muted-foreground">{currentEnrollment.academicYear.name}</p>
            </div>
            <div>
              <span className="font-semibold text-sm">Tahun Ajaran Baru:</span>
              <p className="text-sm font-medium text-primary">{nextAcademicYear.name}</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Konfirmasi & Update Data</CardTitle>
            <div className="text-sm text-muted-foreground mt-2">
              Perbarui alamat jika ada perubahan.
            </div>
          </CardHeader>
          <div className="mt-4">
            <ReEnrollmentForm 
              currentEnrollmentId={currentEnrollment.id}
              nextAcademicYearId={nextAcademicYear.id}
              initialAddress={currentEnrollment.studentData.address}
              initialTransportation={currentEnrollment.studentData.transportation || ""}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
