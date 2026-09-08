import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportType, UserRole } from '@sim/database';

@Injectable()
export class BpiService {
  constructor(private readonly prisma: PrismaService) {}

  // ================= ADMIN BPI =================
  async getLiqoGroups() {
    return this.prisma.liqoGroup.findMany({ include: { murobbi: { select: { id: true, fullName: true } }, _count: { select: { members: true } } }, orderBy: { createdAt: 'desc' } });
  }
  async upsertLiqoGroup(data: any) {
    if (data.id) {
      await this.prisma.liqoGroup.update({ where: { id: data.id }, data: { name: data.name, murobbiId: data.murobbiId, description: data.description } });
    } else {
      await this.prisma.liqoGroup.create({ data: { name: data.name, murobbiId: data.murobbiId, description: data.description } });
    }
    const roleExists = await this.prisma.userRoleAssignment.findFirst({ where: { userId: data.murobbiId, role: UserRole.murobbi } });
    if (!roleExists) {
      await this.prisma.userRoleAssignment.create({ data: { userId: data.murobbiId, role: UserRole.murobbi } });
    }
    return { success: true };
  }
  async getLiqoMembers(groupId: string) {
    return this.prisma.liqoMember.findMany({ where: { groupId }, include: { user: { select: { id: true, fullName: true, email: true } } }, orderBy: { joinedAt: 'desc' } });
  }
  async addLiqoMember(data: any) {
    const existing = await this.prisma.liqoMember.findFirst({ where: { userId: data.userId } });
    if (existing) throw new BadRequestException("Pegawai ini sudah menjadi anggota di kelompok Liqo lain.");
    return this.prisma.liqoMember.create({ data: { groupId: data.groupId, userId: data.userId } });
  }
  async removeLiqoMember(groupId: string, userId: string) {
    await this.prisma.liqoMember.deleteMany({ where: { groupId, userId } });
    return { success: true };
  }
  async getPotentialMurobbis() {
    const assignments = await this.prisma.userRoleAssignment.findMany({ where: { role: { in: [UserRole.murobbi, UserRole.guru, UserRole.admin_bidang] } }, include: { user: { select: { id: true, fullName: true } } } });
    const uniqueUsers = new Map<string, { id: string, fullName: string }>();
    for (const a of assignments) uniqueUsers.set(a.user.id, a.user);
    return Array.from(uniqueUsers.values());
  }
  async getPotentialMutarobbis() {
    const assignments = await this.prisma.userRoleAssignment.findMany({ where: { role: { in: [UserRole.guru, UserRole.karyawan] } }, include: { user: { select: { id: true, fullName: true, liqoMemberships: true } } } });
    const availableUsers = new Map<string, { id: string, fullName: string }>();
    for (const a of assignments) {
      if (a.user.liqoMemberships.length === 0) availableUsers.set(a.user.id, { id: a.user.id, fullName: a.user.fullName });
    }
    return Array.from(availableUsers.values());
  }
  async getLiqoAttendanceStats() {
    const groups = await this.prisma.liqoGroup.findMany({ include: { murobbi: { select: { fullName: true } }, _count: { select: { members: true, meetings: true } }, meetings: { include: { attendances: true } } } });
    return groups.map(group => {
      let totalPresent = 0; let totalRecords = 0;
      group.meetings.forEach(meeting => { meeting.attendances.forEach(att => { totalRecords++; if (att.status === 'present') totalPresent++; }); });
      return { id: group.id, name: group.name, murobbiName: group.murobbi.fullName, memberCount: group._count.members, meetingCount: group._count.meetings, attendanceRate: totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0 };
    });
  }
  async getGlobalMutabaahStats(startDate: string, endDate: string) {
    const result: any = await this.prisma.$queryRaw`SELECT COUNT(*)::int as "totalRecords", COALESCE(AVG(sholat_jamaah), 0) as "avgSholatJamaah", COALESCE((COUNT(*) FILTER (WHERE sholat_dhuha = true)::float / NULLIF(COUNT(*), 0)) * 100, 0) as "pctSholatDhuha", COALESCE((COUNT(*) FILTER (WHERE sholat_tahajud = true)::float / NULLIF(COUNT(*), 0)) * 100, 0) as "pctSholatTahajud", COALESCE(AVG(tilawah_pages), 0) as "avgTilawahPages", COALESCE((COUNT(*) FILTER (WHERE puasa_sunnah = true)::float / NULLIF(COUNT(*), 0)) * 100, 0) as "pctPuasaSunnah", COALESCE((COUNT(*) FILTER (WHERE infaq = true)::float / NULLIF(COUNT(*), 0)) * 100, 0) as "pctInfaq" FROM sim.mutabaah_records WHERE "date" >= ${new Date(startDate)} AND "date" <= ${new Date(endDate)}`;
    return result[0] || { totalRecords: 0, avgSholatJamaah: 0, pctSholatDhuha: 0, pctSholatTahajud: 0, avgTilawahPages: 0, pctPuasaSunnah: 0, pctInfaq: 0 };
  }

  // ================= MUROBBI =================
  async getMyMurobbiGroups(murobbiId: string) {
    return this.prisma.liqoGroup.findMany({ where: { murobbiId }, include: { members: { include: { user: { select: { fullName: true, id: true } } } }, meetings: { orderBy: { date: 'desc' }, take: 10, include: { _count: { select: { attendances: true } } } } } });
  }
  async updateGroupSchedule(groupId: string, data: any) {
    return this.prisma.liqoGroup.update({ where: { id: groupId }, data });
  }
  async createLiqoMeeting(murobbiId: string, groupId: string, data: any) {
    return this.prisma.liqoMeeting.create({ data: { groupId, date: new Date(data.date), materialTitle: data.materialTitle, summary: data.summary } });
  }
  async saveLiqoAttendance(murobbiId: string, groupId: string, data: any) {
    await this.prisma.$transaction(
      data.attendances.map((att: any) => 
        this.prisma.liqoAttendance.upsert({
          where: { meetingId_userId: { meetingId: data.meetingId, userId: att.userId } },
          update: { status: att.status as any, notes: att.notes },
          create: { meetingId: data.meetingId, userId: att.userId, status: att.status as any, notes: att.notes }
        })
      )
    );
    return { success: true };
  }
  async getGroupMutabaahStats(murobbiId: string, groupId: string, startDate: string, endDate: string) {
    const group = await this.prisma.liqoGroup.findUnique({
      where: { id: groupId },
      include: { members: { include: { user: { include: { mutabaahRecords: { where: { date: { gte: new Date(startDate), lte: new Date(endDate) } }, orderBy: { date: 'asc' } } } } } } }
    });
    return group?.members.map(m => ({ userId: m.userId, fullName: m.user.fullName, records: m.user.mutabaahRecords })) || [];
  }

  // ================= MUTAROBBI (STAFF) =================
  async getMyLiqoGroup(userId: string) {
    const membership = await this.prisma.liqoMember.findFirst({
      where: { userId },
      include: { group: { include: { murobbi: { select: { fullName: true } }, meetings: { orderBy: { date: 'desc' }, include: { attendances: { where: { userId } } } } } } }
    });
    return membership?.group || null;
  }
  async saveMutabaahRecord(userId: string, data: any) {
    const dateStr = new Date(data.date).toISOString().split("T")[0];
    const normalizedDate = new Date(`${dateStr}T00:00:00Z`);
    await this.prisma.mutabaahRecord.upsert({
      where: { userId_date: { userId, date: normalizedDate } },
      update: { sholatJamaah: data.sholatJamaah, sholatRawatib: data.sholatRawatib, sholatDhuha: data.sholatDhuha, sholatTahajud: data.sholatTahajud, tilawahPages: data.tilawahPages, puasaSunnah: data.puasaSunnah, infaq: data.infaq },
      create: { userId, date: normalizedDate, sholatJamaah: data.sholatJamaah, sholatRawatib: data.sholatRawatib, sholatDhuha: data.sholatDhuha, sholatTahajud: data.sholatTahajud, tilawahPages: data.tilawahPages, puasaSunnah: data.puasaSunnah, infaq: data.infaq }
    });
    return { success: true };
  }
  async getMyMutabaah(userId: string, startDate: string, endDate: string) {
    return this.prisma.mutabaahRecord.findMany({ where: { userId, date: { gte: new Date(startDate), lte: new Date(endDate) } }, orderBy: { date: 'asc' } });
  }

  // ================= ACTIVITY REPORTS =================
  async getActivityReports(user: any, departmentId?: string, type?: ReportType) {
    let allowedDepartmentIds: string[] = [];
    if (user.roles.some((r: any) => r.role === UserRole.super_admin)) {
      if (departmentId) allowedDepartmentIds = [departmentId];
      else allowedDepartmentIds = (await this.prisma.department.findMany({ select: { id: true } })).map(d => d.id);
    } else if (user.roles.some((r: any) => r.role === UserRole.admin_bidang)) {
      const userDepts = await this.prisma.departmentAdmin.findMany({ where: { userId: user.id }, select: { departmentId: true } });
      allowedDepartmentIds = userDepts.map(d => d.departmentId);
      if (departmentId && allowedDepartmentIds.includes(departmentId)) allowedDepartmentIds = [departmentId];
      else if (departmentId) throw new BadRequestException("Unauthorized access to department");
    }
    return this.prisma.activityReport.findMany({
      where: { departmentId: { in: allowedDepartmentIds }, ...(type && { type }) },
      include: { department: { select: { name: true } }, submittedBy: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" }
    });
  }
  async createActivityReport(userId: string, data: any) {
    return this.prisma.activityReport.create({ data: { ...data, submittedById: userId } });
  }
  async deleteActivityReport(id: string) {
    await this.prisma.activityReport.delete({ where: { id } });
    return { success: true };
  }
}
