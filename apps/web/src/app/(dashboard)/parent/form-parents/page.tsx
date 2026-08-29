import React from "react";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { getActiveRegistration } from "@/actions/parent";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { FormParentsClient } from "@/components/parent/form-parents-client";

export default async function ParentFormParentsPage() {
  await requireRole([UserRole.orang_tua]);
  const reg = await getActiveRegistration();

  if (!reg || reg.status !== "form_filling") {
    redirect("/parent/dashboard");
  }

  // Must have student data filled first
  if (!reg.studentData) {
    redirect("/parent/form-student");
  }

  let parentDataDefault = undefined;
  if (reg.parentData && reg.parentData.length > 0) {
    const father = reg.parentData.find(p => p.type === "father");
    const mother = reg.parentData.find(p => p.type === "mother");
    
    parentDataDefault = {
      father: father ? {
        ...father,
        birthDate: father.birthDate ? father.birthDate.toISOString().split("T")[0] : "",
        nik: father.nik ?? "",
      } : undefined,
      mother: mother ? {
        ...mother,
        birthDate: mother.birthDate ? mother.birthDate.toISOString().split("T")[0] : "",
        nik: mother.nik ?? "",
      } : undefined,
    };
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-primary">
          Formulir Data Orang Tua / Wali
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Lengkapi data ayah dan ibu (Tahap 2 dari 2).
        </p>
      </div>

      <Card className="p-8 border-border shadow-sm">
        <FormParentsClient 
          registrationId={reg.id} 
          defaultValues={parentDataDefault as any} 
        />
      </Card>
    </div>
  );
}
