import * as crypto from 'crypto';
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignStaffInput, AssignDepartmentAdminInput, GpsConfigInput, HolidayInput, GpsCheckInOutInput, LeaveRequestInput } from '@sim/shared';
import { UserRole, LeaveStatus, LeaveType, GpsAttendanceStatus } from '@sim/database';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

@Injectable()
export class HrService {
  constructor(private readonly prisma: PrismaService) {}

  // ================= STAFF =================
  async getStaffAssignments() {
    return this.prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: { not: 'orang_tua' }
          }
        }
      },
      include: { roles: { include: { unit: true } } },
      orderBy: { fullName: 'asc' },
    });
  }

  async assignStaffToUnit(data: AssignStaffInput) {
    const existingRole = await this.prisma.userRoleAssignment.findFirst({
      where: { userId: data.userId, role: data.role as any, unitId: data.unitId },
    });
    if (!existingRole) {
      await this.prisma.userRoleAssignment.create({
        data: { userId: data.userId, role: data.role as any, unitId: data.unitId },
      });
    }
    return { success: true };
  }

  async createStaffUser(data: { fullName: string; email: string; unitId: string; role: 'guru' | 'karyawan' }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    let userId: string;

    if (!existing) {
      const config = { N: 16384, r: 16, p: 1, dkLen: 64 };
      const salt = crypto.randomBytes(16).toString("hex");
      const hashedPassword = await new Promise<string>((resolve, reject) => {
        crypto.scrypt("Password123!".normalize("NFKC"), salt, config.dkLen,
          { N: config.N, r: config.r, p: config.p, maxmem: 128 * config.N * config.r * 2 },
          (err, key) => err ? reject(err) : resolve(`${salt}:${key.toString("hex")}`)
        );
      });
      
      const generatedUserId = crypto.randomUUID();
      const user = await this.prisma.user.create({
        data: {
          id: generatedUserId, name: data.fullName, fullName: data.fullName, email: data.email,
          passwordHash: 'credential', isActive: true, leaveQuota: 12, groups: [],
          accounts: { create: { id: crypto.randomUUID(), accountId: generatedUserId, providerId: 'credential', password: hashedPassword } }
        },
      });
      userId = user.id;
    } else {
      userId = existing.id;
    }

    await this.prisma.userRoleAssignment.create({
      data: { userId: userId, unitId: data.unitId, role: data.role === 'guru' ? UserRole.guru : UserRole.karyawan },
    });
    return { success: true };
  }

  async removeStaffAssignment(assignmentId: string) {
    await this.prisma.userRoleAssignment.delete({ where: { id: assignmentId } });
    return { success: true };
  }

  // ================= DEPARTMENTS =================
  async getDepartments() {
    return this.prisma.department.findMany({
      include: { unit: true, admins: { include: { user: { select: { id: true, fullName: true, email: true } } } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async upsertDepartment(data: any) {
    if (data.id) {
      return this.prisma.department.update({ where: { id: data.id }, data: { name: data.name, description: data.description, unitId: data.unitId, isActive: data.isActive } });
    }
    return this.prisma.department.create({ data: { name: data.name, description: data.description, unitId: data.unitId, isActive: data.isActive } });
  }

  async deleteDepartment(id: string) {
    await this.prisma.department.delete({ where: { id } });
    return { success: true };
  }

  async assignDepartmentAdmin(data: AssignDepartmentAdminInput) {
    const existingRole = await this.prisma.userRoleAssignment.findFirst({ where: { userId: data.userId, role: UserRole.admin_bidang } });
    if (!existingRole) {
      await this.prisma.userRoleAssignment.create({ data: { userId: data.userId, role: UserRole.admin_bidang } });
    }
    await this.prisma.departmentAdmin.upsert({
      where: { departmentId_userId: { departmentId: data.departmentId, userId: data.userId } },
      update: {}, create: { departmentId: data.departmentId, userId: data.userId }
    });
    return { success: true };
  }

  async removeDepartmentAdmin(departmentId: string, userId: string) {
    await this.prisma.departmentAdmin.delete({ where: { departmentId_userId: { departmentId, userId } } });
    return { success: true };
  }

  // ================= HR DASHBOARD =================
  async getStaffDemographics() {
    const [totalUsers, rolesCount, unitBreakdown, units] = await Promise.all([
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.userRoleAssignment.groupBy({ by: ['role'], _count: { userId: true } }),
      this.prisma.userRoleAssignment.groupBy({ by: ['unitId'], _count: { userId: true }, where: { unitId: { not: null } } }),
      this.prisma.unit.findMany({ select: { id: true, name: true } })
    ]);
    const formattedUnitBreakdown = unitBreakdown.map(u => ({ unitName: units.find(un => un.id === u.unitId)?.name || 'Unknown Unit', count: u._count.userId }));
    return { totalUsers, rolesCount, formattedUnitBreakdown };
  }

  async getAttendanceRecap(startDate: string, endDate: string, unitId: string | undefined, currentUser: any) {
    const isGlobalAdmin = currentUser.roles.some((r: any) => r.role === "super_admin" || r.role === "admin_kepegawaian");
    const adminUnitIds = currentUser.roles.filter((r: any) => (r.role === "admin_unit" || r.role === "admin_unit_nondik") && r.unitId).map((r: any) => r.unitId);
    let userWhere: any = {};
    if (!isGlobalAdmin) {
      if (adminUnitIds.length === 0) return [];
      userWhere = { roles: { some: { unitId: { in: adminUnitIds } } } };
    } else if (unitId) {
      userWhere = { roles: { some: { unitId } } };
    }
    const users = await this.prisma.user.findMany({ where: { isActive: true, ...userWhere }, select: { id: true } });
    if (users.length === 0) return [];
    const userIds = users.map(u => u.id);
    const recap = await this.prisma.$queryRaw<any[]>`
      SELECT u.id as "userId", u.full_name as "fullName",
        COUNT(a.id) FILTER (WHERE a.status = 'present')::int as present,
        COUNT(a.id) FILTER (WHERE a.status = 'late')::int as late,
        COALESCE((SELECT SUM((LEAST(l.end_date, ${new Date(endDate)}::date) - GREATEST(l.start_date, ${new Date(startDate)}::date)) + 1)
          FROM sim.leave_requests l WHERE l.user_id = u.id AND l.status = 'approved' AND l.start_date <= ${new Date(endDate)}::date AND l.end_date >= ${new Date(startDate)}::date), 0)::int as leave,
        0 as absent
      FROM shared.users u
      LEFT JOIN sim.gps_attendances a ON a.user_id = u.id AND a.date >= ${new Date(startDate)}::date AND a.date <= ${new Date(endDate)}::date
      WHERE u.id = ANY(${userIds}::uuid[])
      GROUP BY u.id, u.full_name
    `;
    return recap;
  }

  // ================= LEAVE =================
  async getLeaveRequests(status?: LeaveStatus, year?: number) {
    let whereClause: any = {};
    if (status) whereClause.status = status;
    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      whereClause.startDate = { gte: startOfYear, lte: endOfYear };
    }
    return this.prisma.leaveRequest.findMany({ where: whereClause, include: { user: { select: { id: true, fullName: true, email: true, leaveQuota: true } }, approvedBy: { select: { fullName: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async approveLeaveRequest(leaveId: string, approverId: string) {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id: leaveId } });
    if (!leave) throw new BadRequestException("Leave request not found");
    if (leave.status !== LeaveStatus.pending) throw new BadRequestException("Leave request already processed");
    const days = Math.ceil((leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 3600 * 24)) + 1;
    if (leave.type === LeaveType.cuti) {
      await this.prisma.$transaction([
        this.prisma.user.update({ where: { id: leave.userId }, data: { leaveQuota: { decrement: days } } }),
        this.prisma.leaveRequest.update({ where: { id: leaveId }, data: { status: LeaveStatus.approved, approvedById: approverId } })
      ]);
    } else {
      await this.prisma.leaveRequest.update({ where: { id: leaveId }, data: { status: LeaveStatus.approved, approvedById: approverId } });
    }
    return { success: true };
  }

  async rejectLeaveRequest(leaveId: string, approverId: string) {
    await this.prisma.leaveRequest.update({ where: { id: leaveId }, data: { status: LeaveStatus.rejected, approvedById: approverId } });
    return { success: true };
  }

  async createLeaveRequest(userId: string, data: any) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
    if (data.type === LeaveType.cuti) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.leaveQuota < days) throw new BadRequestException(`Jatah cuti tidak mencukupi. Sisa: ${user?.leaveQuota || 0}, Diminta: ${days}`);
    }
    return this.prisma.leaveRequest.create({ data: { userId, type: data.type as any, startDate: start, endDate: end, reason: data.reason, attachmentUrl: data.documentUrl, status: LeaveStatus.pending } });
  }

  async getMyLeaveRequests(userId: string) {
    return this.prisma.leaveRequest.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, include: { approvedBy: { select: { fullName: true } } } });
  }

  // ================= ATTENDANCE =================
  async getTodayAttendanceContext(userId: string) {
    const assignment = await this.prisma.userRoleAssignment.findFirst({ where: { userId, role: { in: [UserRole.guru, UserRole.karyawan] } }, include: { unit: { include: { gpsAttendanceConfig: true } } } });
    if (!assignment || !assignment.unit) throw new BadRequestException("Anda belum ditugaskan ke Unit Pendidikan/Kantor manapun.");
    const unit = assignment.unit;
    const config = unit.gpsAttendanceConfig;
    if (!config) throw new BadRequestException(`Konfigurasi GPS untuk unit ${unit.name} belum diatur.`);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const holiday = await this.prisma.holiday.findFirst({ where: { date: today, OR: [{ unitId: null }, { unitId: unit.id }] } });
    const attendance = await this.prisma.gpsAttendance.findUnique({ where: { userId_date: { userId, date: today } } });
    return { unitId: unit.id, unitName: unit.name, config, holiday, attendance };
  }

  async checkIn(userId: string, data: GpsCheckInOutInput) {
    const context = await this.getTodayAttendanceContext(userId);
    if (context.holiday) throw new BadRequestException("Hari ini adalah hari libur, tidak perlu melakukan absensi.");
    if (context.attendance?.checkInTime) throw new BadRequestException("Anda sudah melakukan check in hari ini.");
    const distance = calculateDistance(data.latitude, data.longitude, context.config.latitude, context.config.longitude);
    if (distance > context.config.radiusMeters) throw new BadRequestException(`Anda berada di luar jangkauan radius. Jarak: ${Math.round(distance)}m`);
    const now = new Date();
    const cutoff = new Date(); cutoff.setHours(7, 15, 0, 0);
    const status = now > cutoff ? GpsAttendanceStatus.late : GpsAttendanceStatus.present;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return this.prisma.gpsAttendance.create({ data: { userId, unitId: context.unitId, date: today, checkInTime: now, latitude: data.latitude, longitude: data.longitude, status } });
  }

  async checkOut(userId: string, data: GpsCheckInOutInput) {
    const context = await this.getTodayAttendanceContext(userId);
    if (!context.attendance?.checkInTime) throw new BadRequestException("Anda belum melakukan check in hari ini.");
    if (context.attendance.checkOutTime) throw new BadRequestException("Anda sudah melakukan check out hari ini.");
    const distance = calculateDistance(data.latitude, data.longitude, context.config.latitude, context.config.longitude);
    if (distance > context.config.radiusMeters) throw new BadRequestException(`Anda berada di luar jangkauan radius. Jarak: ${Math.round(distance)}m`);
    return this.prisma.gpsAttendance.update({ where: { id: context.attendance.id }, data: { checkOutTime: new Date() } });
  }

  async getMyAttendanceHistory(userId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return this.prisma.gpsAttendance.findMany({ where: { userId, date: { gte: startDate, lte: endDate } }, orderBy: { date: 'desc' } });
  }

  // ================= CONFIG =================
  async getGpsConfigs() { return this.prisma.gpsAttendanceConfig.findMany({ include: { unit: true } }); }
  async upsertGpsConfig(data: any) {
    return this.prisma.gpsAttendanceConfig.upsert({
      where: { unitId: data.unitId },
      update: { latitude: data.latitude, longitude: data.longitude, radiusMeters: data.radiusMeters },
      create: { unitId: data.unitId, latitude: data.latitude, longitude: data.longitude, radiusMeters: data.radiusMeters }
    });
  }
  async getHolidays(month: number, year: number, unitId?: string) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const whereClause: any = { date: { gte: startDate, lte: endDate } };
    if (unitId) whereClause.OR = [{ unitId: null }, { unitId }];
    return this.prisma.holiday.findMany({ where: whereClause, orderBy: { date: 'asc' }, include: { unit: true } });
  }
  async upsertHoliday(data: any) {
    if (data.id) return this.prisma.holiday.update({ where: { id: data.id }, data: { date: new Date(data.date), name: data.name, description: data.description, unitId: data.unitId } });
    return this.prisma.holiday.create({ data: { date: new Date(data.date), name: data.name, description: data.description, unitId: data.unitId } });
  }
  async deleteHoliday(id: string) {
    return this.prisma.holiday.delete({ where: { id } });
  }

  async getAttendanceOverview() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendances = await this.prisma.gpsAttendance.groupBy({
      by: ['status'],
      where: { date: { gte: today, lt: tomorrow } },
      _count: { id: true }
    });

    let present = 0, late = 0, absent = 0;
    attendances.forEach((a: any) => {
      if (a.status === 'present') present = a._count.id;
      if (a.status === 'late') late = a._count.id;
      if (a.status === 'absent') absent = a._count.id;
    });

    const activeLeaves = await this.prisma.leaveRequest.count({
      where: { status: 'approved' as any, startDate: { lte: today }, endDate: { gte: today } }
    });

    return { present, late, absent, activeLeaves };
  }
}

