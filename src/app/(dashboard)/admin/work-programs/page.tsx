import { getWorkPrograms } from "@/actions/work-programs";
import { prisma } from "@/lib/prisma";
import { WorkProgramClient } from "./work-program-client";

export default async function WorkProgramsPage() {
  const workPrograms = await getWorkPrograms();
  const departments = await prisma.department.findMany({ select: { id: true, name: true } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Program Kerja Bidang</h1>
        <p className="text-sm text-gray-500">Kelola daftar program kerja dan pantau status pelaksanaannya.</p>
      </div>
      <WorkProgramClient initialWorkPrograms={workPrograms} departments={departments} />
    </div>
  );
}
