import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Daftar Ulang Akademik | SIM-Alfida",
};

export default async function ReEnrollmentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Cari data enrollment aktif untuk orang tua ini
  const activeEnrollments = await prisma.studentEnrollment.findMany({
    where: {
      parentId: user.id,
      status: "active",
    },
    include: {
      studentData: true,
      academicYear: true,
      class: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Daftar Ulang Siswa</h1>
        <p className="text-muted-foreground">
          Pilih siswa yang akan didaftarkan ulang untuk tahun ajaran berikutnya.
        </p>
      </div>

      {activeEnrollments.length === 0 ? (
        <Card>
          <div className="pt-6">
            <p className="text-center text-muted-foreground">
              Tidak ada data siswa aktif yang bisa didaftarkan ulang.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeEnrollments.map((enrollment) => (
            <Card key={enrollment.id}>
              <CardHeader>
                <CardTitle>{enrollment.studentData.fullName}</CardTitle>
                <div className="text-sm text-muted-foreground mt-2">
                  Kelas saat ini: {enrollment.class.name} <br />
                  Tahun Ajaran: {enrollment.academicYear.name}
                </div>
              </CardHeader>
              <div className="mt-4">
                <Link href={`/parent/academic/re-enrollment/${enrollment.id}`}>
                  <Button className="w-full">Mulai Daftar Ulang</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
