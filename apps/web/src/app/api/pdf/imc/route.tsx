import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { ImcLetterDocument } from "@/lib/pdf/imc-letter";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";


export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  const user = session?.user;

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const regId = searchParams.get("id");

  if (!regId) return new NextResponse("ID Pendaftaran wajib diisi", { status: 400 });

  const reg = await prisma.registration.findUnique({
    where: { id: regId },
    include: {
      studentData: true,
      academicYear: {
        include: {
          unit: {
            include: { unitSettings: true }
          }
        }
      }
    }
  });

  if (!reg || reg.parentId !== user.id) {
    return new NextResponse("Pendaftaran tidak ditemukan atau bukan milik Anda", { status: 404 });
  }

  const data = {
    unitName: reg.academicYear.unit.name,
    unitLogo: reg.academicYear.unit.unitSettings?.logoUrl || null,
    signature: reg.academicYear.unit.unitSettings?.principalSignatureUrl || null,
    principalName: reg.academicYear.unit.unitSettings?.principalName || "Kepala Sekolah",
    registrationNumber: reg.registrationNumber,
    studentName: reg.studentData?.fullName || "-",
    birthPlace: reg.studentData?.birthPlace || "-",
    birthDate: reg.studentData?.birthDate ? new Date(reg.studentData.birthDate).toLocaleDateString("id-ID") : "-",
    dateStr: `Alfida, ${new Date().toLocaleDateString("id-ID")}`
  };

  const stream = await renderToStream(<ImcLetterDocument data={data} />);
  
  const headers = new Headers();
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Disposition", `attachment; filename="Surat_Pengantar_IMC_${reg.registrationNumber}.pdf"`);

  return new NextResponse(stream as any, { headers });
}
