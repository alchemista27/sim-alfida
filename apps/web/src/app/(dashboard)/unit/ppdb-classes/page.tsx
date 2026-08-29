import { prisma } from "@/lib/prisma";
import { ClassManagementClient } from "@/components/unit/class-management-client";
import { resolveUnitId } from "@/lib/unit-context";

export default async function ClassesPage() {
  const unitId = await resolveUnitId();

  const activeYear = await prisma.academicYear.findFirst({
    where: { unitId, ppdbActive: true },
  });

  if (!activeYear) return <div className="p-6">Tahun ajaran tidak aktif.</div>;

  const classes = await prisma.class.findMany({
    where: { academicYearId: activeYear.id, unitId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Kelas</h1>
          <p className="text-sm text-gray-500 mt-1">Tahun Ajaran: {activeYear.name}</p>
        </div>
      </div>

      <div className="flex border-b border-border mb-6">
        <a href="/unit/ppdb-classes" className="px-6 py-3 border-b-2 border-tertiary text-tertiary font-medium">Daftar Kelas</a>
        <a href="/unit/ppdb-classes/assignments" className="px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium transition-colors">Penempatan Siswa</a>
      </div>
      
      {/* Client component */}
      <ClassManagementClient 
        classes={JSON.parse(JSON.stringify(classes))} 
        academicYearId={activeYear.id} 
        unitId={unitId}
      />
    </div>
  );
}
