import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { ParentSppClient } from "./client";

export const metadata = {
  title: "Pembayaran SPP | SIM-Alfida",
};

export default async function ParentSppPage() {
  await requireRole([UserRole.orang_tua]);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>Unauthorized</div>;
  
  const activeYear = await prisma.academicYear.findFirst({
    orderBy: { startDate: 'desc' }
  });

  if (!activeYear) {
    return <div className="p-6">Tidak ada Tahun Ajaran aktif.</div>;
  }

  // Fetch all active enrollments for this parent
  const enrollments = await prisma.studentEnrollment.findMany({
    where: {
      parentId: user.id,
      academicYearId: activeYear.id,
      status: 'active'
    },
    select: { id: true, studentData: { select: { fullName: true } }, class: { select: { name: true } } }
  });

  if (enrollments.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="p-6 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg">
          Tidak ada data siswa aktif yang terhubung dengan akun Anda pada tahun ajaran ini.
        </div>
      </div>
    );
  }

  const enrollmentIds = enrollments.map(e => e.id);

  // Fetch all invoices for these enrollments
  const invoices = await prisma.sppInvoice.findMany({
    where: {
      enrollmentId: { in: enrollmentIds }
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
      { month: 'desc' }
    ]
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pembayaran SPP</h1>
        <p className="text-sm text-gray-500 mt-1">Pantau tagihan bulanan dan unggah bukti transfer pembayaran Anda di sini.</p>
      </div>

      <ParentSppClient 
        invoices={invoices} 
        enrollments={enrollments}
      />
    </div>
  );
}
