import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@sim/database';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ================= USERS =================
  @Post('users/batch-import')
  @Roles(UserRole.super_admin)
  async batchImportUsers(@Body() body: any) {
    return this.adminService.batchImportUsers(body.usersData);
  }

  @Post('users/:id/roles')
  @Roles(UserRole.super_admin)
  async updateUserRoles(@Param('id') id: string, @Body() body: { roles: UserRole[], groups: string[] }) {
    return this.adminService.updateUserRoles(id, body.roles, body.groups);
  }

  @Post('users/manual')
  @Roles(UserRole.super_admin)
  async createUserManual(@Body() body: any) {
    return this.adminService.createUserManual(body);
  }

  @Put('users/:id/password')
  @Roles(UserRole.super_admin)
  async resetUserPassword(@Param('id') id: string, @Body() body: any) {
    return this.adminService.resetUserPassword(id, body.newPassword);
  }

  @Delete('users/:id')
  @Roles(UserRole.super_admin)
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('users/search')
  @Roles(UserRole.super_admin, UserRole.admin_unit) // Allows both
  async searchUsers(@Query('q') query: string) {
    return this.adminService.searchUsers(query);
  }

  // ================= UNITS =================
  @Post('units')
  @Roles(UserRole.super_admin)
  async createUnit(@Body() body: any) {
    return this.adminService.createUnit(body);
  }

  @Put('units/:id')
  @Roles(UserRole.super_admin)
  async updateUnit(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateUnit(id, body);
  }

  @Delete('units/:id')
  @Roles(UserRole.super_admin)
  async deleteUnit(@Param('id') id: string) {
    return this.adminService.deleteUnit(id);
  }

  @Post('units/assign-admin')
  @Roles(UserRole.super_admin)
  async assignAdminUnit(@Body() body: { userId: string, unitId: string, isNondik?: boolean }) {
    return this.adminService.assignAdminUnit(body.userId, body.unitId, body.isNondik);
  }

  @Delete('units/:unitId/admin/:userId')
  @Roles(UserRole.super_admin)
  async removeAdminUnit(@Param('unitId') unitId: string, @Param('userId') userId: string, @Query('isNondik') isNondik?: string) {
    return this.adminService.removeAdminUnit(userId, unitId, isNondik === 'true');
  }

  @Put('units/:id/settings')
  @Roles(UserRole.super_admin, UserRole.admin_unit)
  async updateUnitSettings(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateUnitSettings(id, body);
  }

  @Post('units/:id/academic-years')
  @Roles(UserRole.super_admin, UserRole.admin_unit)
  async createAcademicYear(@Param('id') id: string, @Body() body: any) {
    return this.adminService.createAcademicYear(id, body);
  }

  @Put('units/:id/academic-years/:ayId/toggle')
  @Roles(UserRole.super_admin, UserRole.admin_unit)
  async togglePpdbActive(@Param('id') id: string, @Param('ayId') ayId: string, @Body() body: { activate: boolean }) {
    return this.adminService.togglePpdbActive(id, ayId, body.activate);
  }

  // ================= FOUNDATION =================
  @Get('foundation-settings')
  @Roles(UserRole.super_admin)
  async getFoundationSettings() {
    return this.adminService.getFoundationSettings();
  }

  @Put('foundation-settings/:id')
  @Roles(UserRole.super_admin)
  async updateFoundationSettings(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateFoundationSettings(id, body);
  }
}
