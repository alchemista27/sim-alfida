import React from "react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { ParentDashboardClient } from "./academic-client";

export default async function ParentDashboardPage() {
  const user = await requireRole([UserRole.orang_tua]);
  
  // Ambil semua pendaftaran yang belum berstatus 'enrolled' (Masih PPDB)
  const ppdbRegistrations = await prisma.registration.findMany({
    where: { 
      parentId: user.id,
      status: { notIn: ['enrolled'] }
    },
    include: {
      academicYear: { include: { unit: true } },
      studentData: true,
      payment: true,
      observationBooking: { include: { schedule: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Ambil semua enrollment (Siswa Aktif)
  const enrollments = await prisma.studentEnrollment.findMany({
    where: {
      parentId: user.id,
      status: 'active'
    },
    include: {
      studentData: true,
      class: { 
        include: { 
          unit: true,
          classSchedules: {
            where: { day: getDayOfWeekEnum(new Date().getDay()) },
            include: { subject: true }
          }
        } 
      },
      academicYear: true,
      sppInvoices: {
        where: { status: 'unpaid' }
      }
    }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <p className="text-xs text-tertiary font-semibold uppercase tracking-wider mb-1">
          Portal Orang Tua
        </p>
        <h1 className="font-heading font-bold text-2xl text-primary">Dashboard Utama</h1>
      </div>

      <ParentDashboardClient 
        ppdbRegistrations={ppdbRegistrations} 
        enrollments={enrollments} 
      />
    </div>
  );
}

function getDayOfWeekEnum(dayIndex: number) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[dayIndex] as any;
}
