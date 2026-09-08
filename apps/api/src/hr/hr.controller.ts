import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { HrService } from './hr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, LeaveStatus } from '@sim/database';

@Controller('hr')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HrController {
  constructor(private hrService: HrService) {}

  @Get('staff')
  @Roles(UserRole.super_admin, UserRole.admin_bidang, UserRole.admin_unit, UserRole.admin_unit_nondik)
  async getStaffAssignments() { return this.hrService.getStaffAssignments(); }

  @Post('staff/assign')
  @Roles(UserRole.super_admin, UserRole.admin_bidang, UserRole.admin_unit, UserRole.admin_unit_nondik)
  async assignStaffToUnit(@Body() data: any) { return this.hrService.assignStaffToUnit(data); }

  @Post('staff/create')
  @Roles(UserRole.super_admin, UserRole.admin_bidang, UserRole.admin_unit, UserRole.admin_unit_nondik)
  async createStaffUser(@Body() data: any) { return this.hrService.createStaffUser(data); }

  @Delete('staff/assignment/:id')
  @Roles(UserRole.super_admin, UserRole.admin_bidang, UserRole.admin_unit, UserRole.admin_unit_nondik)
  async removeStaffAssignment(@Param('id') id: string) { return this.hrService.removeStaffAssignment(id); }

  @Get('departments')
  @Roles(UserRole.super_admin, UserRole.admin_bidang)
  async getDepartments() { return this.hrService.getDepartments(); }

  @Post('departments')
  @Roles(UserRole.super_admin)
  async upsertDepartment(@Body() data: any) { return this.hrService.upsertDepartment(data); }

  @Delete('departments/:id')
  @Roles(UserRole.super_admin)
  async deleteDepartment(@Param('id') id: string) { return this.hrService.deleteDepartment(id); }

  @Post('departments/assign-admin')
  @Roles(UserRole.super_admin)
  async assignDepartmentAdmin(@Body() data: any) { return this.hrService.assignDepartmentAdmin(data); }

  @Delete('departments/:deptId/admin/:userId')
  @Roles(UserRole.super_admin)
  async removeDepartmentAdmin(@Param('deptId') deptId: string, @Param('userId') userId: string) { return this.hrService.removeDepartmentAdmin(deptId, userId); }

  @Get('dashboard/demographics')
  @Roles(UserRole.super_admin, UserRole.admin_bidang)
  async getStaffDemographics() { return this.hrService.getStaffDemographics(); }

  @Get('dashboard/attendance-recap')
  @Roles(UserRole.super_admin, UserRole.admin_bidang, UserRole.admin_unit, UserRole.admin_unit_nondik)
  async getAttendanceRecap(@Query('start') start: string, @Query('end') end: string, @Query('unitId') unitId: string, @Req() req: any) {
    return this.hrService.getAttendanceRecap(start, end, unitId, req.user);
  }

  @Get('leave')
  @Roles(UserRole.super_admin, UserRole.admin_bidang, UserRole.admin_unit, UserRole.admin_unit_nondik)
  async getLeaveRequests(@Query('status') status?: LeaveStatus, @Query('year') year?: string) { return this.hrService.getLeaveRequests(status, year ? parseInt(year) : undefined); }

  @Post('leave/:id/approve')
  @Roles(UserRole.super_admin, UserRole.admin_bidang, UserRole.admin_unit, UserRole.admin_unit_nondik)
  async approveLeaveRequest(@Param('id') id: string, @Req() req: any) { return this.hrService.approveLeaveRequest(id, req.user.id); }

  @Post('leave/:id/reject')
  @Roles(UserRole.super_admin, UserRole.admin_bidang, UserRole.admin_unit, UserRole.admin_unit_nondik)
  async rejectLeaveRequest(@Param('id') id: string, @Req() req: any) { return this.hrService.rejectLeaveRequest(id, req.user.id); }

  @Post('leave/my')
  @Roles(UserRole.guru, UserRole.karyawan)
  async createLeaveRequest(@Body() data: any, @Req() req: any) { return this.hrService.createLeaveRequest(req.user.id, data); }

  @Get('leave/my')
  @Roles(UserRole.guru, UserRole.karyawan)
  async getMyLeaveRequests(@Req() req: any) { return this.hrService.getMyLeaveRequests(req.user.id); }

  @Post('attendance/check-in')
  @Roles(UserRole.guru, UserRole.karyawan)
  async checkIn(@Body() data: any, @Req() req: any) { return this.hrService.checkIn(req.user.id, data); }

  @Post('attendance/check-out')
  @Roles(UserRole.guru, UserRole.karyawan)
  async checkOut(@Body() data: any, @Req() req: any) { return this.hrService.checkOut(req.user.id, data); }

  @Get('attendance/my-history')
  @Roles(UserRole.guru, UserRole.karyawan)
  async getMyAttendanceHistory(@Query('month') month: string, @Query('year') year: string, @Req() req: any) { return this.hrService.getMyAttendanceHistory(req.user.id, parseInt(month), parseInt(year)); }

  @Get('config/gps')
  @Roles(UserRole.super_admin, UserRole.admin_bidang, UserRole.admin_unit, UserRole.admin_unit_nondik)
  async getGpsConfigs() { return this.hrService.getGpsConfigs(); }

  @Post('config/gps')
  @Roles(UserRole.super_admin, UserRole.admin_bidang, UserRole.admin_unit, UserRole.admin_unit_nondik)
  async upsertGpsConfig(@Body() data: any) { return this.hrService.upsertGpsConfig(data); }

  @Get('config/holidays')
  @Roles(UserRole.super_admin, UserRole.admin_bidang, UserRole.admin_unit, UserRole.admin_unit_nondik)
  async getHolidays(@Query('month') month: string, @Query('year') year: string, @Query('unitId') unitId?: string) { return this.hrService.getHolidays(parseInt(month), parseInt(year), unitId); }

  @Post('config/holidays')
  @Roles(UserRole.super_admin, UserRole.admin_bidang, UserRole.admin_unit, UserRole.admin_unit_nondik)
  async upsertHoliday(@Body() data: any) { return this.hrService.upsertHoliday(data); }

  @Delete('config/holidays/:id')
  @Roles(UserRole.super_admin, UserRole.admin_bidang, UserRole.admin_unit, UserRole.admin_unit_nondik)
  async deleteHoliday(@Param('id') id: string) { return this.hrService.deleteHoliday(id); }

  @Get('attendance-overview')
  @Roles(UserRole.super_admin)
  async getAttendanceOverview() { return this.hrService.getAttendanceOverview(); }
}
