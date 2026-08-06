import React from "react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { createRegistrationAction, getActiveRegistration } from "@/actions/parent";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { redirect } from "next/navigation";

export default async function ParentSelectUnitPage() {
  await requireRole([UserRole.orang_tua]);

  // If already registered, redirect to dashboard
  const existingReg = await getActiveRegistration();
  if (existingReg) {
    redirect("/parent/dashboard");
  }

  // Fetch units that have an active PPDB academic year
  const units = await prisma.unit.findMany({
    where: {
      isActive: true,
      academicYears: { some: { ppdbActive: true } },
    },
    include: {
      academicYears: { where: { ppdbActive: true }, take: 1 },
    },
    orderBy: { level: "asc" },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <p className="text-xs text-tertiary font-semibold uppercase tracking-wider mb-1">
          Pendaftaran PPDB
        </p>
        <h1 className="font-heading font-bold text-2xl text-primary">
          Pilih Unit Pendidikan
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Pilih unit pendidikan yang tersedia untuk memulai proses pendaftaran.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => {
          const ay = unit.academicYears[0];
          const isFull = ay.registered >= ay.quota;

          return (
            <Card key={unit.id} className="p-6 border-border flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-teal-50 text-tertiary rounded-xl flex items-center justify-center">
                  <Icon name="school" className="text-2xl" />
                </div>
                <Badge variant={isFull ? "red" : "green"}>
                  {isFull ? "Kuota Penuh" : "Buka"}
                </Badge>
              </div>
              
              <div className="mb-4 flex-grow">
                <h3 className="font-heading font-bold text-lg text-primary leading-tight">
                  {unit.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 uppercase tracking-wide font-medium">
                  Jenjang {unit.level}
                </p>
              </div>

              <div className="bg-neutral/50 rounded-lg p-3 text-sm mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">Tahun Ajaran</span>
                  <span className="font-medium text-primary">{ay.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sisa Kuota</span>
                  <span className={`font-medium ${isFull ? 'text-red-500' : 'text-primary'}`}>
                    {Math.max(0, ay.quota - ay.registered)} / {ay.quota}
                  </span>
                </div>
              </div>

              <form action={async () => {
                "use server";
                await createRegistrationAction(unit.id);
              }}>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full"
                  disabled={isFull}
                >
                  {isFull ? "Penuh" : "Daftar Sekarang"}
                </Button>
              </form>
            </Card>
          );
        })}
        {units.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-300 rounded-xl bg-neutral/30">
            <Icon name="block" className="text-4xl text-gray-300 mb-3 block mx-auto" />
            <p className="font-medium text-gray-600">Saat ini tidak ada PPDB yang dibuka.</p>
          </div>
        )}
      </div>
    </div>
  );
}
