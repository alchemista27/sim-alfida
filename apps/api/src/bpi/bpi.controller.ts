import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { BpiService } from './bpi.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, ReportType } from '@sim/database';

@Controller('bpi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BpiController {
  constructor(private readonly bpiService: BpiService) {}

  @Get('groups')
  @Roles(UserRole.super_admin, UserRole.admin_bidang)
  async getLiqoGroups() { return this.bpiService.getLiqoGroups(); }

  @Post('groups')
  @Roles(UserRole.super_admin, UserRole.admin_bidang)
  async upsertLiqoGroup(@Body() body: any) { return this.bpiService.upsertLiqoGroup(body); }

  @Get('groups/:id/members')
  @Roles(UserRole.super_admin, UserRole.admin_bidang)
  async getLiqoMembers(@Param('id') id: string) { return this.bpiService.getLiqoMembers(id); }

  @Post('groups/members')
  @Roles(UserRole.super_admin, UserRole.admin_bidang)
  async addLiqoMember(@Body() body: any) { return this.bpiService.addLiqoMember(body); }

  @Delete('groups/:groupId/members/:userId')
  @Roles(UserRole.super_admin, UserRole.admin_bidang)
  async removeLiqoMember(@Param('groupId') groupId: string, @Param('userId') userId: string) { return this.bpiService.removeLiqoMember(groupId, userId); }

  @Get('potential-murobbis')
  @Roles(UserRole.super_admin, UserRole.admin_bidang)
  async getPotentialMurobbis() { return this.bpiService.getPotentialMurobbis(); }

  @Get('potential-mutarobbis')
  @Roles(UserRole.super_admin, UserRole.admin_bidang)
  async getPotentialMutarobbis() { return this.bpiService.getPotentialMutarobbis(); }

  @Get('attendance-stats')
  @Roles(UserRole.super_admin, UserRole.admin_bidang)
  async getLiqoAttendanceStats() { return this.bpiService.getLiqoAttendanceStats(); }

  @Get('mutabaah-stats')
  @Roles(UserRole.super_admin, UserRole.admin_bidang)
  async getGlobalMutabaahStats(@Query('start') start: string, @Query('end') end: string) { return this.bpiService.getGlobalMutabaahStats(start, end); }

  // Murobbi routes
  @Get('murobbi/groups')
  @Roles(UserRole.murobbi)
  async getMyMurobbiGroups(@Req() req: any) { return this.bpiService.getMyMurobbiGroups(req.user.id); }

  @Put('groups/:groupId')
  @Roles(UserRole.murobbi, UserRole.super_admin, UserRole.admin_bidang)
  async updateGroupSchedule(@Param('groupId') groupId: string, @Body() body: any) { return this.bpiService.updateGroupSchedule(groupId, body); }

  @Post('murobbi/groups/:groupId/meetings')
  @Roles(UserRole.murobbi)
  async createLiqoMeeting(@Param('groupId') groupId: string, @Body() body: any, @Req() req: any) { return this.bpiService.createLiqoMeeting(req.user.id, groupId, body); }

  @Post('murobbi/groups/:groupId/attendance')
  @Roles(UserRole.murobbi)
  async saveLiqoAttendance(@Param('groupId') groupId: string, @Body() body: any, @Req() req: any) { return this.bpiService.saveLiqoAttendance(req.user.id, groupId, body); }

  @Get('murobbi/groups/:groupId/mutabaah')
  @Roles(UserRole.murobbi)
  async getGroupMutabaahStats(@Param('groupId') groupId: string, @Query('start') start: string, @Query('end') end: string, @Req() req: any) { return this.bpiService.getGroupMutabaahStats(req.user.id, groupId, start, end); }

  // Mutarobbi routes
  @Get('mutarobbi/group')
  @Roles(UserRole.guru, UserRole.karyawan)
  async getMyLiqoGroup(@Req() req: any) { return this.bpiService.getMyLiqoGroup(req.user.id); }

  @Post('mutarobbi/mutabaah')
  @Roles(UserRole.guru, UserRole.karyawan)
  async saveMutabaahRecord(@Body() body: any, @Req() req: any) { return this.bpiService.saveMutabaahRecord(req.user.id, body); }

  @Get('mutarobbi/mutabaah')
  @Roles(UserRole.guru, UserRole.karyawan)
  async getMyMutabaah(@Query('start') start: string, @Query('end') end: string, @Req() req: any) { return this.bpiService.getMyMutabaah(req.user.id, start, end); }

  // Reports
  @Get('reports')
  @Roles(UserRole.super_admin, UserRole.admin_bidang)
  async getActivityReports(@Query('dept') dept: string, @Query('type') type: ReportType, @Req() req: any) { return this.bpiService.getActivityReports(req.user, dept, type); }

  @Post('reports')
  @Roles(UserRole.super_admin, UserRole.admin_bidang)
  async createActivityReport(@Body() body: any, @Req() req: any) { return this.bpiService.createActivityReport(req.user.id, body); }

  @Delete('reports/:id')
  @Roles(UserRole.super_admin, UserRole.admin_bidang)
  async deleteActivityReport(@Param('id') id: string) { return this.bpiService.deleteActivityReport(id); }
}
