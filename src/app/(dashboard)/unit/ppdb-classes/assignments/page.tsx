import { prisma } from "@/lib/prisma";
import { ClassAssignmentClient } from "@/components/unit/class-assignment-client";
import { resolveUnitId } from "@/lib/unit-context";

export default async function ClassAssignmentsPage() {
  const unitId = await resolveUnitId();

  const activeYear = await prisma.academicYear.findFirst({
    where: { unitId, ppdbActive: true },
  });

  if (!activeYear) return <div className="p-6">Tahun ajaran tidak aktif.</div>;

  // Ambil kelas yang ada
  const classes = await prisma.class.findMany({
    where: { academicYearId: activeYear.id, unitId },
    orderBy: { name: "asc" },
  });

  // Ambil data siswa yang lulus (accepted) ATAU yang sudah dimasukkan ke kelas (enrolled) 
  // untuk menampilkannya di tabel
  const students = await prisma.registration.findMany({
    where: {
      academicYearId: activeYear.id,
      status: { in: ["accepted", "enrolled"] }
    },
    include: {
      studentData: true,
      observationBooking: {
        include: {
          result: true
        }
      },
      classAssignment: {
        include: {
          class: true
        }
      }
    },
    orderBy: [
      {
        observationBooking: {
          result: {
            rank: "asc"
          }
        }
      },
      {
        createdAt: "asc"
      }
    ]
  });

  const formattedStudents = students.map(s => ({
    id: s.id,
    registrationNumber: s.registrationNumber,
    name: s.studentData?.fullName || "-",
    score: s.observationBooking?.result?.score ? Number(s.observationBooking.result.score) : 0,
    rank: s.observationBooking?.result?.rank || 999,
    status: s.status,
    assignedClassId: s.classAssignment ? s.classAssignment.classId : null,
    assignedClassName: s.classAssignment ? s.classAssignment.class.name : null,
  }));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Kelas</h1>
          <p className="text-sm text-gray-500 mt-1">
            {students.filter(s => s.status === 'accepted').length} siswa lulus belum mendapat kelas, {students.filter(s => s.status === 'enrolled').length} sudah ditempatkan.
          </p>
        </div>
      </div>

      <div className="flex border-b border-border mb-6">
        <a href="/unit/ppdb-classes" className="px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium transition-colors">Daftar Kelas</a>
        <a href="/unit/ppdb-classes/assignments" className="px-6 py-3 border-b-2 border-tertiary text-tertiary font-medium">Penempatan Siswa</a>
      </div>
      
      <ClassAssignmentClient 
        students={JSON.parse(JSON.stringify(formattedStudents))} 
        classes={JSON.parse(JSON.stringify(classes))} 
      />
    </div>
  );
}
