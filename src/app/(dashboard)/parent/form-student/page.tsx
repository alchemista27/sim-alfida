import React from "react";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/generated/client";
import { getActiveRegistration } from "@/actions/parent";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { FormStudentClient } from "@/components/parent/form-student-client";

export default async function ParentFormStudentPage() {
  await requireRole([UserRole.orang_tua]);
  const reg = await getActiveRegistration();

  if (!reg || (reg.status !== "form_filling" && reg.status !== "payment_verified")) {
    redirect("/parent/dashboard");
  }

  // Convert dates to string for form defaults
  const studentData = reg.studentData ? {
    fullName: reg.studentData.fullName,
    nickname: reg.studentData.nickname,
    gender: reg.studentData.gender,
    birthPlace: reg.studentData.birthPlace,
    birthDate: reg.studentData.birthDate.toISOString().split("T")[0],
    religion: reg.studentData.religion,
    nisn: reg.studentData.nisn ?? undefined,
    siblingsCount: reg.studentData.siblingsCount,
    address: reg.studentData.address,
    transportation: reg.studentData.transportation ?? undefined,
  } : undefined;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-primary">
          Formulir Data Calon Siswa
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Lengkapi data diri calon siswa (Tahap 1 dari 2).
        </p>
      </div>

      <Card className="p-8 border-border shadow-sm">
        <FormStudentClient 
          registrationId={reg.id} 
          defaultValues={studentData as any} 
        />
      </Card>
    </div>
  );
}
