import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SppService {
  constructor(private readonly prisma: PrismaService) {}

  async generateBulkInvoices(data: {
    unitId: string;
    academicYearId: string;
    month: number;
    year: number;
    amount: number;
    generatedBy: string;
  }) {
    const { unitId, academicYearId, month, year, amount, generatedBy } = data;

    // 1. Get active enrollments
    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: {
        academicYearId,
        status: 'active',
        class: {
          unitId
        }
      },
      select: { id: true }
    });

    if (!enrollments.length) {
      return { success: true, count: 0, message: "Tidak ada siswa aktif ditemukan" };
    }

    const enrollmentIds = enrollments.map(e => e.id);

    // 2. Check existing invoices
    const existingInvoices = await this.prisma.sppInvoice.findMany({
      where: {
        month,
        year,
        enrollmentId: { in: enrollmentIds }
      },
      select: { enrollmentId: true }
    });

    const existingIds = new Set(existingInvoices.map(i => i.enrollmentId));
    const newEnrollments = enrollmentIds.filter(id => !existingIds.has(id));

    if (!newEnrollments.length) {
      return { success: true, count: 0, message: "Semua tagihan sudah pernah dibuat." };
    }

    // 3. Bulk insert
    const inserts = newEnrollments.map(enrollmentId => ({
      enrollmentId,
      month,
      year,
      amount,
      status: 'unpaid',
      generatedBy
    }));

    const result = await this.prisma.sppInvoice.createMany({
      data: inserts as any // bypass strict typing on enums if needed
    });

    return { 
      success: true, 
      count: result.count, 
      message: `Berhasil membuat ${result.count} tagihan.` 
    };
  }

  async uploadSppProof(invoiceId: string, proofUrl: string) {
    return this.prisma.sppInvoice.update({
      where: { id: invoiceId },
      data: { proofUrl, status: 'uploaded', uploadedAt: new Date(), rejectionNote: null }
    });
  }

  async verifySppInvoice(invoiceId: string, status: string, rejectionNote: string | undefined, userId: string) {
    if (status === 'rejected' && (!rejectionNote || rejectionNote.trim() === '')) throw new BadRequestException("Catatan penolakan wajib diisi");
    return this.prisma.sppInvoice.update({
      where: { id: invoiceId },
      data: { status: status as any, verifiedAt: new Date(), verifiedBy: userId, rejectionNote: status === 'rejected' ? rejectionNote : null }
    });
  }
}
