import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AcademicService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Subject Management ---
  async createSubject(unitId: string, data: any) {
    return this.prisma.subject.create({
      data: {
        unitId,
        code: data.code,
        name: data.name,
        level: data.level,
        isActive: data.isActive,
      },
    });
  }

  async updateSubject(id: string, unitId: string, data: any) {
    const existing = await this.prisma.subject.findUnique({ where: { id } });
    if (!existing || existing.unitId !== unitId) {
      throw new NotFoundException('Mata pelajaran tidak ditemukan atau bukan milik unit Anda.');
    }

    return this.prisma.subject.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        level: data.level,
        isActive: data.isActive,
      },
    });
  }

  async deleteSubject(id: string, unitId: string) {
    const existing = await this.prisma.subject.findUnique({ where: { id } });
    if (!existing || existing.unitId !== unitId) {
      throw new NotFoundException('Mata pelajaran tidak ditemukan atau bukan milik unit Anda.');
    }

    try {
      await this.prisma.subject.delete({ where: { id } });
      return { success: true };
    } catch (error) {
      throw new ConflictException('Gagal menghapus mata pelajaran. Pastikan mapel ini belum digunakan (assigned).');
    }
  }

  // --- Teacher Assignment ---
  async assignTeacherToSubject(data: any, academicYearId: string) {
    const existing = await this.prisma.teacherAssignment.findUnique({
      where: {
        subjectId_teacherId_classId_academicYearId: {
          subjectId: data.subjectId,
          teacherId: data.teacherId,
          classId: data.classId,
          academicYearId: academicYearId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Guru ini sudah ditugaskan untuk mata pelajaran dan kelas tersebut.');
    }

    return this.prisma.teacherAssignment.create({
      data: {
        subjectId: data.subjectId,
        teacherId: data.teacherId,
        classId: data.classId,
        academicYearId: academicYearId,
      },
    });
  }

  async removeTeacherAssignment(id: string) {
    await this.prisma.teacherAssignment.delete({ where: { id } });
    return { success: true };
  }

  // --- Homeroom Assignment ---
  async assignHomeroomTeacher(data: any, academicYearId: string) {
    const existing = await this.prisma.homeroomAssignment.findUnique({
      where: {
        classId_academicYearId: {
          classId: data.classId,
          academicYearId: academicYearId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Kelas ini sudah memiliki wali kelas untuk tahun ajaran tersebut.');
    }

    return this.prisma.homeroomAssignment.create({
      data: {
        teacherId: data.teacherId,
        classId: data.classId,
        academicYearId: academicYearId,
      },
    });
  }

  async removeHomeroomAssignment(id: string) {
    await this.prisma.homeroomAssignment.delete({ where: { id } });
    return { success: true };
  }
}
