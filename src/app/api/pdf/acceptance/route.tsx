import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { AcceptanceLetterDocument } from "@/lib/pdf/acceptance-letter";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  if (reg.status !== "accepted" && reg.status !== "enrolled") {
    return new NextResponse("Pendaftaran belum dinyatakan lulus", { status: 400 });
  }

  const props = {
    unit: {
      name: reg.academicYear.unit.name,
      logoUrl: reg.academicYear.unit.unitSettings?.logoUrl || null,
      principalName: reg.academicYear.unit.unitSettings?.principalName || "Kepala Sekolah",
      principalNip: reg.academicYear.unit.unitSettings?.principalNip || null,
    },
    student: {
      name: reg.studentData?.fullName || "-",
      nisn: reg.studentData?.nisn || null,
      registrationNumber: reg.registrationNumber,
    },
    date: new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }),
  };

  const stream = await renderToStream(<AcceptanceLetterDocument {...props} />);
  
  const headers = new Headers();
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Disposition", `attachment; filename="Surat_Kelulusan_${reg.registrationNumber}.pdf"`);

  return new NextResponse(stream as any, { headers });
}
