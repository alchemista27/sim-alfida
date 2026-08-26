import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/generated/client";
import { createClient } from "@/lib/supabase/server";
import { UnitSppClient } from "./client";

export const metadata = {
  title: "Kelola SPP | SIM-Alfida",
};

export default async function UnitSppPage() {
  await requireRole([UserRole.admin_unit]);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>Unauthorized</div>;
  
  const userRole = await prisma.userRoleAssignment.findFirst({
      where: { userId: user.id, role: 'admin_unit' }
  });

  if (!userRole?.unitId) return <div>Akses ditolak: Anda bukan Admin Unit.</div>;
  
  const activeYear = await prisma.academicYear.findFirst({
    orderBy: { startDate: 'desc' }
  });

  if (!activeYear) {
    return <div className="p-6">Tidak ada Tahun Ajaran aktif.</div>;
  }

  // Fetch all invoices for students in this unit for current academic year
  const invoices = await prisma.sppInvoice.findMany({
    where: {
      enrollment: {
        class: { unitId: userRole.unitId },
        academicYearId: activeYear.id
      }
    },
    include: {
      enrollment: {
        include: {
          studentData: { select: { fullName: true } },
          class: { select: { name: true } }
        }
      }
    },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
      { enrollment: { class: { name: 'asc' } } },
      { enrollment: { studentData: { fullName: 'asc' } } }
    ]
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen SPP</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola tagihan dan verifikasi bukti pembayaran SPP bulanan siswa.</p>
      </div>

      <UnitSppClient 
        invoices={invoices} 
        unitId={userRole.unitId} 
        academicYearId={activeYear.id} 
      />
    </div>
  );
}
