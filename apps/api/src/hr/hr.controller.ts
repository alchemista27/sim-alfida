import { Controller, Get, Post, Delete, Body, Param, UseGuards, UsePipes } from '@nestjs/common';
import { HrService } from './hr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@sim/database';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AssignStaffSchema, AssignStaffInput } from '@sim/shared';

@Controller('hr')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Get('staff')
  @Roles(UserRole.super_admin, UserRole.admin_kepegawaian, UserRole.admin_unit, UserRole.admin_unit_nondik)
  async getStaffAssignments() {
    return this.hrService.getStaffAssignments();
  }

  @Post('staff/assign')
  @Roles(UserRole.super_admin, UserRole.admin_kepegawaian, UserRole.admin_unit, UserRole.admin_unit_nondik)
  @UsePipes(new ZodValidationPipe(AssignStaffSchema))
  async assignStaffToUnit(@Body() data: AssignStaffInput) {
    return this.hrService.assignStaffToUnit(data);
  }

  @Post('staff/create')
  @Roles(UserRole.super_admin, UserRole.admin_kepegawaian, UserRole.admin_unit, UserRole.admin_unit_nondik)
  async createStaffUser(@Body() data: { fullName: string; email: string; unitId: string; role: 'guru' | 'karyawan' }) {
    return this.hrService.createStaffUser(data);
  }

  @Delete('staff/assignment/:id')
  @Roles(UserRole.super_admin, UserRole.admin_kepegawaian, UserRole.admin_unit, UserRole.admin_unit_nondik)
  async removeStaffAssignment(@Param('id') id: string) {
    return this.hrService.removeStaffAssignment(id);
  }
}
