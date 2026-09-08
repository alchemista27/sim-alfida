import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AcademicService {
  constructor(private readonly prisma: PrismaService) {}

  // ================= SUBJECTS =================
  async createSubject(unitId: string, data: any) {
    return this.prisma.subject.create({
      data: { unitId, code: data.code, name: data.name, level: data.level, isActive: data.isActive }
    });
  }
  async updateSubject(id: string, unitId: string, data: any) {
    const existing = await this.prisma.subject.findUnique({ where: { id } });
    if (!existing || existing.unitId !== unitId) throw new BadRequestException("Subject not found or unauthorized");
    return this.prisma.subject.update({
      where: { id },
      data: { code: data.code, name: data.name, level: data.level, isActive: data.isActive }
    });
  }
  async deleteSubject(id: string, unitId: string) {
    const existing = await this.prisma.subject.findUnique({ where: { id } });
    if (!existing || existing.unitId !== unitId) throw new BadRequestException("Subject not found or unauthorized");
    await this.prisma.subject.delete({ where: { id } });
    return { success: true };
  }

  // ================= ASSIGNMENTS =================
  async assignTeacherToSubject(data: any, academicYearId: string) {
    const existing = await this.prisma.teacherAssignment.findUnique({
      where: { subjectId_teacherId_classId_academicYearId: { subjectId: data.subjectId, teacherId: data.teacherId, classId: data.classId, academicYearId } }
    });
    if (existing) throw new ConflictException("Already assigned");
    return this.prisma.teacherAssignment.create({
      data: { subjectId: data.subjectId, teacherId: data.teacherId, classId: data.classId, academicYearId }
    });
  }
  async removeTeacherAssignment(id: string) {
    await this.prisma.teacherAssignment.delete({ where: { id } });
    return { success: true };
  }
  async assignHomeroomTeacher(data: any, academicYearId: string) {
    const existing = await this.prisma.homeroomAssignment.findUnique({
      where: { classId_academicYearId: { classId: data.classId, academicYearId } }
    });
    if (existing) throw new ConflictException("Already has homeroom teacher");
    return this.prisma.homeroomAssignment.create({
      data: { teacherId: data.teacherId, classId: data.classId, academicYearId }
    });
  }
  async removeHomeroomAssignment(id: string) {
    await this.prisma.homeroomAssignment.delete({ where: { id } });
    return { success: true };
  }

  // ================= CLASSES =================
  async createClass(data: any) {
    return this.prisma.class.create({ data: { unitId: data.unitId, academicYearId: data.academicYearId, name: data.name, capacity: data.capacity } });
  }
  async updateClass(id: string, data: any) {
    if (data.capacity !== undefined) {
      const current = await this.prisma.class.findUnique({ where: { id }, select: { assigned: true } });
      if (current && data.capacity < current.assigned) throw new BadRequestException("Capacity cannot be less than assigned");
    }
    return this.prisma.class.update({ where: { id }, data });
  }
  async deleteClass(id: string) {
    const current = await this.prisma.class.findUnique({ where: { id }, select: { assigned: true } });
    if (current && current.assigned > 0) throw new BadRequestException("Cannot delete class with students");
    await this.prisma.class.delete({ where: { id } });
    return { success: true };
  }
  async assignToClass(registrationId: string, classId: string) {
    return this.prisma.$transaction(async (tx) => {
      const reg = await tx.registration.findUnique({ where: { id: registrationId } });
      if (!reg || reg.status !== "accepted") throw new BadRequestException("Not accepted");
      const targetClass = await tx.class.findUnique({ where: { id: classId } });
      if (!targetClass || targetClass.assigned >= targetClass.capacity) throw new BadRequestException("Class full or not found");
      const assignment = await tx.classAssignment.create({ data: { registrationId, classId } });
      await tx.class.update({ where: { id: classId }, data: { assigned: { increment: 1 } } });
      await tx.registration.update({ where: { id: registrationId }, data: { status: "enrolled" } });
      return assignment;
    });
  }

  // ================= BATCH GRADES/ATTENDANCE =================
  async submitBatchAttendance(teacherId: string, data: any) {
    const targetDate = new Date(data.date);
    const payload = data.attendances.map((item: any) => ({
      enrollmentId: item.enrollmentId, subjectId: data.subjectId, teacherId, date: targetDate, status: item.status, notes: item.notes
    }));
    await this.prisma.$queryRaw`SELECT batch_upsert_attendance(${payload}::jsonb) as result`;
    return { success: true };
  }
  async submitBatchGrade(teacherId: string, academicYearId: string, data: any) {
    const payload = data.grades.map((item: any) => ({
      enrollmentId: item.enrollmentId, subjectId: data.subjectId, teacherId, academicYearId, type: data.type, label: data.label, score: item.score
    }));
    await this.prisma.$queryRaw`SELECT batch_upsert_grades(${payload}::jsonb) as result`;
    return { success: true };
  }

  // ================= PROMOTIONS =================
  async processPromotions(userId: string, data: any) {
    const payload = data.decisions.map((d: any) => ({
      enrollmentId: d.enrollmentId, decision: d.decision, decidedBy: userId
    }));
    await this.prisma.$queryRaw`SELECT batch_upsert_promotions(${payload}::jsonb) as result`;
    return { success: true };
  }

  // ================= LHBS =================
  async generateLhbsReport(teacherId: string, data: any) {
    const enrollment = await this.prisma.studentEnrollment.findUnique({ where: { id: data.enrollmentId }, include: { class: true } });
    if (!enrollment) throw new BadRequestException("Student not found");
    const gradesRpcResult: any = await this.prisma.$queryRaw`SELECT calculate_lhbs_grades(${data.enrollmentId}::uuid, ${data.semester}::text) as grades`;
    const gradesSnapshot = gradesRpcResult[0]?.grades || [];
    gradesSnapshot.sort((a: any, b: any) => a.subjectName.localeCompare(b.subjectName));
    const extraSemester = data.semester === "mid" ? "ganjil" : "genap";
    const extraGrades = await this.prisma.extracurricularGrade.findMany({ where: { enrollmentId: data.enrollmentId, semester: extraSemester as any }, include: { member: { include: { extracurricular: true } } } });
    const extraSnapshot = extraGrades.map(eg => ({ extraName: eg.member.extracurricular.name, score: eg.score, notes: eg.notes }));
    const attendances = await this.prisma.attendance.findMany({ where: { enrollmentId: data.enrollmentId } });
    const attendanceSum = { present: 0, sick: 0, permitted: 0, absent: 0 };
    for (const a of attendances) { if (a.status === 'present') attendanceSum.present++; else if (a.status === 'sick') attendanceSum.sick++; else if (a.status === 'permitted') attendanceSum.permitted++; else if (a.status === 'absent') attendanceSum.absent++; }
    
    const existing = await this.prisma.lhbsReport.findUnique({ where: { enrollmentId_semester_academicYearId: { enrollmentId: data.enrollmentId, semester: data.semester as any, academicYearId: enrollment.academicYearId } } });
    if (existing) {
      await this.prisma.lhbsReport.update({ where: { id: existing.id }, data: { gradesSnapshot, extraSnapshot, attendanceSum, notes: data.notes, issuedAt: new Date() } });
    } else {
      await this.prisma.lhbsReport.create({ data: { enrollmentId: data.enrollmentId, semester: data.semester as any, academicYearId: enrollment.academicYearId, gradesSnapshot, extraSnapshot, attendanceSum, notes: data.notes } });
    }
    return { success: true };
  }

  // ================= SCHEDULES =================
  async upsertClassSchedule(data: any) {
    if (data.id) return this.prisma.classSchedule.update({ where: { id: data.id }, data: { classId: data.classId, subjectId: data.subjectId, teacherId: data.teacherId, day: data.day as any, startTime: data.startTime, endTime: data.endTime } });
    return this.prisma.classSchedule.create({ data: { classId: data.classId, subjectId: data.subjectId, teacherId: data.teacherId, day: data.day as any, startTime: data.startTime, endTime: data.endTime } });
  }
  async deleteClassSchedule(id: string) {
    await this.prisma.classSchedule.delete({ where: { id } });
    return { success: true };
  }

  // ================= JOURNALS =================
  async upsertTeachingJournal(teacherId: string, data: any) {
    if (data.id) return this.prisma.teachingJournal.update({ where: { id: data.id }, data: { date: new Date(data.date), material: data.material, method: data.method, reflection: data.reflection } });
    return this.prisma.teachingJournal.create({ data: { classId: data.classId, subjectId: data.subjectId, teacherId, date: new Date(data.date), material: data.material, method: data.method, reflection: data.reflection } });
  }
  async deleteTeachingJournal(id: string) {
    await this.prisma.teachingJournal.delete({ where: { id } });
    return { success: true };
  }

  // ================= LESSON PLANS =================
  async upsertLessonPlan(teacherId: string, data: any) {
    if (data.id) return this.prisma.lessonPlan.update({ where: { id: data.id }, data: { type: data.type as any, title: data.title, content: data.content } });
    return this.prisma.lessonPlan.create({ data: { subjectId: data.subjectId, academicYearId: data.academicYearId, teacherId, type: data.type as any, title: data.title, content: data.content } });
  }
  async deleteLessonPlan(id: string) {
    await this.prisma.lessonPlan.delete({ where: { id } });
    return { success: true };
  }

  // ================= EXTRACURRICULAR =================
  async joinExtracurricular(parentId: string, enrollmentId: string, extraId: string, academicYearId: string) {
    return this.prisma.extracurricularMember.create({ data: { extraId, enrollmentId, academicYearId } });
  }
  async leaveExtracurricular(parentId: string, memberId: string) {
    await this.prisma.extracurricularMember.delete({ where: { id: memberId } });
    return { success: true };
  }
  async upsertExtracurricular(unitId: string, data: any) {
    if (data.id) return this.prisma.extracurricular.update({ where: { id: data.id }, data: { name: data.name, description: data.description } });
    return this.prisma.extracurricular.create({ data: { unitId, name: data.name, description: data.description } });
  }
  async assignCoach(extraId: string, userId: string, academicYearId: string) {
    return this.prisma.extracurricularCoach.create({ data: { extraId, coachId: userId, academicYearId } });
  }
  async removeCoach(id: string) {
    await this.prisma.extracurricularCoach.delete({ where: { id } });
    return { success: true };
  }
  async upsertExtraSchedule(extraId: string, data: any) {
    if (data.id) return this.prisma.extracurricularSchedule.update({ where: { id: data.id }, data: { day: data.day as any, startTime: data.startTime, endTime: data.endTime, location: data.location } });
    return this.prisma.extracurricularSchedule.create({ data: { extraId, day: data.day as any, startTime: data.startTime, endTime: data.endTime, location: data.location } });
  }
  async deleteExtraSchedule(id: string) {
    await this.prisma.extracurricularSchedule.delete({ where: { id } });
    return { success: true };
  }
  async upsertExtraJournal(coachId: string, extraId: string, data: any) {
    if (data.id) return this.prisma.extracurricularJournal.update({ where: { id: data.id }, data: { date: new Date(data.date), activity: data.activity, attendance: data.attendanceCount, notes: data.notes } });
    return this.prisma.extracurricularJournal.create({ data: { extraId, coachId, date: new Date(data.date), activity: data.activity, attendance: data.attendanceCount, notes: data.notes } });
  }
  async deleteExtraJournal(id: string) {
    await this.prisma.extracurricularJournal.delete({ where: { id } });
    return { success: true };
  }
  async upsertExtraGrade(extraId: string, data: any) {
    const member = await this.prisma.extracurricularMember.findFirst({ where: { extraId, enrollmentId: data.enrollmentId } });
    if (!member) throw new BadRequestException("Bukan anggota ekstrakurikuler");
    return this.prisma.extracurricularGrade.upsert({
      where: { memberId_semester: { memberId: member.id, semester: data.semester as any } },
      update: { score: data.score as any, notes: data.notes },
      create: { memberId: member.id, enrollmentId: data.enrollmentId, semester: data.semester as any, score: data.score as any, notes: data.notes }
    });
  }
}
