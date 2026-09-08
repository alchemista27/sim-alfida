import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrationStatus, UserRole } from '@sim/database';

@Injectable()
export class PpdbService {
  constructor(private readonly prisma: PrismaService) {}

  // ================= VERIFICATION & STATUS =================
  async verifyPayment(registrationId: string, isApproved: boolean, reason?: string) {
    const newStatus = isApproved ? RegistrationStatus.payment_verified : RegistrationStatus.pending_payment;
    return this.prisma.$transaction([
      this.prisma.registration.update({ where: { id: registrationId }, data: { status: newStatus } }),
      this.prisma.payment.update({ where: { registrationId }, data: { status: isApproved ? "verified" : "rejected", verifiedAt: isApproved ? new Date() : null } }),
    ]);
  }

  async updateRegistrationStatus(registrationId: string, status: string) {
    await this.prisma.registration.update({ where: { id: registrationId }, data: { status: status as any } });
    return { success: true };
  }

  async batchAcceptStudents(registrationIds: string[]) {
    await this.prisma.registration.updateMany({
      where: { id: { in: registrationIds } },
      data: { status: RegistrationStatus.accepted }
    });
    return { success: true };
  }

  async batchRejectStudents(registrationIds: string[], reason: string = "Tidak memenuhi standar kelulusan observasi") {
    await this.prisma.registration.updateMany({
      where: { id: { in: registrationIds } },
      data: { status: RegistrationStatus.rejected, rejectionReason: reason }
    });
    return { success: true };
  }

  // ================= OBSERVATION SCHEDULE & BOOKING =================
  async createSchedule(academicYearId: string, data: any) {
    return this.prisma.observationSchedule.create({
      data: { academicYearId, date: new Date(data.date), startTime: data.startTime, endTime: data.endTime, quota: data.quota, booked: 0 }
    });
  }

  async updateSchedule(id: string, data: any) {
    if (data.quota !== undefined) {
      const current = await this.prisma.observationSchedule.findUnique({ where: { id }, select: { booked: true } });
      if (current && data.quota < current.booked) throw new BadRequestException("Kuota tidak boleh lebih kecil dari jumlah yang sudah mendaftar");
    }
    const updateData: any = { ...data };
    if (data.date) updateData.date = new Date(data.date);
    return this.prisma.observationSchedule.update({ where: { id }, data: updateData });
  }

  async deleteSchedule(id: string) {
    const current = await this.prisma.observationSchedule.findUnique({ where: { id }, select: { booked: true } });
    if (current && current.booked > 0) throw new BadRequestException("Jadwal tidak bisa dihapus karena sudah ada pendaftar");
    await this.prisma.observationSchedule.delete({ where: { id } });
    return { success: true };
  }

  async bookSchedule(registrationId: string, scheduleId: string) {
    return this.prisma.$transaction(async (tx) => {
      const schedule = await tx.observationSchedule.findUnique({ where: { id: scheduleId } });
      if (!schedule) throw new BadRequestException("Jadwal tidak ditemukan");
      if (schedule.booked >= schedule.quota) throw new BadRequestException("Kuota jadwal ini sudah penuh");
      
      const registration = await tx.registration.findUnique({ where: { id: registrationId } });
      if (!registration) throw new BadRequestException("Data pendaftaran tidak ditemukan");

      const booking = await tx.observationBooking.create({ data: { registrationId, observationScheduleId: scheduleId } });
      await tx.observationSchedule.update({ where: { id: scheduleId }, data: { booked: { increment: 1 } } });
      await tx.registration.update({ where: { id: registrationId }, data: { status: "observation_scheduled" } });
      return booking;
    });
  }

  async getTeachersWithObserverStatus(unitId: string) {
    const guruAssignments = await this.prisma.userRoleAssignment.findMany({
      where: { unitId, role: UserRole.guru },
      include: { user: { include: { roles: { where: { unitId, role: UserRole.observer } } } } },
      orderBy: { user: { fullName: 'asc' } }
    });
    return guruAssignments.map(a => ({ id: a.user.id, fullName: a.user.fullName, email: a.user.email, phone: a.user.phone, isObserver: a.user.roles.length > 0 }));
  }

  async toggleObserverRole(unitId: string, userId: string, currentStatus: boolean) {
    if (currentStatus) {
      await this.prisma.userRoleAssignment.deleteMany({ where: { userId, unitId, role: UserRole.observer } });
    } else {
      await this.prisma.userRoleAssignment.create({ data: { userId, unitId, role: UserRole.observer } });
    }
    return { success: true };
  }

  async submitObservationResult(data: any) {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.observationBooking.findUnique({ where: { id: data.observationBookingId }, include: { registration: true } });
      if (!booking) throw new BadRequestException("Data booking observasi tidak ditemukan");
      
      const result = await tx.observationResult.upsert({
        where: { observationBookingId: data.observationBookingId },
        create: { observationBookingId: data.observationBookingId, observerId: data.observerId, score: data.score, notes: data.notes },
        update: { observerId: data.observerId, score: data.score, notes: data.notes },
      });
      
      await tx.registration.update({ where: { id: booking.registrationId }, data: { status: "observation_done" } });
      
      await tx.$executeRaw`
        WITH RankedResults AS (
          SELECT r.id, ROW_NUMBER() OVER (ORDER BY r.score DESC) as new_rank
          FROM sim.observation_results r
          JOIN sim.observation_bookings b ON r.observation_booking_id = b.id
          JOIN sim.registrations p ON b.registration_id = p.id
          WHERE p.academic_year_id = ${booking.registration.academicYearId}::uuid
        )
        UPDATE sim.observation_results
        SET rank = RankedResults.new_rank
        FROM RankedResults
        WHERE sim.observation_results.id = RankedResults.id
      `;
      
      return { ...result, score: Number(result.score.toString()) };
    });
  }

  // ================= PARENT & REGISTRATION =================
  async getActiveRegistration(parentId: string) {
    return this.prisma.registration.findFirst({
      where: { parentId },
      include: {
        academicYear: { include: { unit: true } },
        studentData: true,
        parentData: true,
        payment: true,
        observationBooking: { include: { schedule: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createRegistration(parentId: string, unitId: string) {
    const activeAY = await this.prisma.academicYear.findFirst({ where: { unitId, ppdbActive: true }, include: { unit: true } });
    if (!activeAY) throw new BadRequestException("Tidak ada pendaftaran PPDB yang aktif di unit ini.");

    const existing = await this.prisma.registration.findFirst({ where: { parentId, status: { notIn: [RegistrationStatus.rejected] } } });
    if (existing) throw new BadRequestException("Anda sudah memiliki pendaftaran yang sedang berjalan.");

    const count = await this.prisma.registration.count({ where: { academicYearId: activeAY.id } });
    const seq = String(count + 1).padStart(4, "0");
    const yearStr = activeAY.name.split("/")[0] || String(new Date().getFullYear());
    const slugUpper = activeAY.unit.slug.toUpperCase().substring(0, 8);
    const regNum = `PPDB-${slugUpper}-${yearStr}-${seq}`;

    const reg = await this.prisma.registration.create({
      data: { parentId, academicYearId: activeAY.id, registrationNumber: regNum, status: RegistrationStatus.pending_payment },
    });

    await this.prisma.academicYear.update({ where: { id: activeAY.id }, data: { registered: { increment: 1 } } });
    return reg;
  }

  async uploadPaymentReceipt(registrationId: string, proofUrl: string) {
    await this.prisma.$transaction([
      this.prisma.registration.update({ where: { id: registrationId }, data: { status: RegistrationStatus.payment_uploaded } }),
      this.prisma.payment.upsert({
        where: { registrationId },
        update: { proofUrl, amount: 250000, uploadedAt: new Date(), status: "pending" },
        create: { registrationId, amount: 250000, proofUrl, status: "pending" },
      }),
    ]);
    return { success: true };
  }

  async submitStudentForm(registrationId: string, data: any) {
    const reg = await this.prisma.registration.findFirst({ where: { id: registrationId } });
    if (!reg) throw new BadRequestException("Not found");
    await this.prisma.studentData.upsert({
      where: { registrationId },
      update: { ...data, birthDate: new Date(data.birthDate) },
      create: { ...data, birthDate: new Date(data.birthDate), registrationId },
    });
    if (reg.status === RegistrationStatus.payment_verified) {
      await this.prisma.registration.update({ where: { id: registrationId }, data: { status: RegistrationStatus.form_filling } });
    }
    return { success: true };
  }

  async submitParentForm(registrationId: string, data: any) {
    await this.prisma.$transaction([
      this.prisma.parentData.deleteMany({ where: { registrationId } }),
      this.prisma.parentData.createMany({
        data: [
          { ...data.father, type: "father", birthDate: new Date(data.father.birthDate), registrationId },
          { ...data.mother, type: "mother", birthDate: new Date(data.mother.birthDate), registrationId },
        ],
      }),
    ]);
    const hasStudentData = await this.prisma.studentData.findUnique({ where: { registrationId } });
    if (hasStudentData) {
      await this.prisma.registration.update({ where: { id: registrationId }, data: { status: RegistrationStatus.documents_uploaded } });
    }
    return { success: true };
  }

  // ================= DOCUMENTS =================
  async upsertDocument(registrationId: string, data: any) {
    const existingDoc = await this.prisma.document.findFirst({ where: { registrationId, type: data.type as any } });
    if (existingDoc) {
      await this.prisma.document.update({
        where: { id: existingDoc.id },
        data: { fileUrl: data.fileUrl, fileName: data.fileName, fileSize: data.fileSize, mimeType: data.mimeType }
      });
    } else {
      await this.prisma.document.create({
        data: { registrationId, type: data.type as any, fileUrl: data.fileUrl, fileName: data.fileName, fileSize: data.fileSize, mimeType: data.mimeType }
      });
    }
    return { success: true };
  }

  async finalizeDocumentUpload(registrationId: string) {
    const docsCount = await this.prisma.document.count({ where: { registrationId } });
    if (docsCount >= 5) {
      await this.prisma.registration.update({ where: { id: registrationId }, data: { status: RegistrationStatus.medical_pending } });
    }
    return { success: true };
  }

  async markMedicalDone(registrationId: string) {
    await this.prisma.registration.update({ where: { id: registrationId }, data: { status: RegistrationStatus.verification } });
    return { success: true };
  }
}
