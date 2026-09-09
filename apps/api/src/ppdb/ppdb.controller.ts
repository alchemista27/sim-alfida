import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { PpdbService } from './ppdb.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@sim/database';

@Controller('ppdb')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PpdbController {
  constructor(private readonly ppdbService: PpdbService) {}

  @Post('verify-payment')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async verifyPayment(@Body() body: any) { return this.ppdbService.verifyPayment(body.registrationId, body.isApproved, body.reason); }

  @Put('registration/:id/status')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async updateRegistrationStatus(@Param('id') id: string, @Body() body: { status: string }) { return this.ppdbService.updateRegistrationStatus(id, body.status); }

  @Post('registration/batch-accept')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async batchAcceptStudents(@Body() body: any) { return this.ppdbService.batchAcceptStudents(body.registrationIds); }

  @Post('registration/batch-reject')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async batchRejectStudents(@Body() body: any) { return this.ppdbService.batchRejectStudents(body.registrationIds, body.reason); }

  @Post('schedules')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async createSchedule(@Body() body: any) { return this.ppdbService.createSchedule(body.academicYearId, body); }

  @Put('schedules/:id')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async updateSchedule(@Param('id') id: string, @Body() body: any) { return this.ppdbService.updateSchedule(id, body); }

  @Delete('schedules/:id')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async deleteSchedule(@Param('id') id: string) { return this.ppdbService.deleteSchedule(id); }

  @Post('schedules/book')
  @Roles(UserRole.orang_tua)
  async bookSchedule(@Body() body: any) { return this.ppdbService.bookSchedule(body.registrationId, body.scheduleId); }

  @Get('observers')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async getTeachersWithObserverStatus(@Req() req: any) {
    const adminRole = req.user.roles.find((r: any) => r.role === UserRole.admin_unit && r.unitId);
    if (!adminRole) throw new Error("Akses ditolak: Anda tidak memiliki unit.");
    return this.ppdbService.getTeachersWithObserverStatus(adminRole.unitId);
  }

  @Post('observers/toggle')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async toggleObserverRole(@Body() body: any, @Req() req: any) {
    const adminRole = req.user.roles.find((r: any) => r.role === UserRole.admin_unit && r.unitId);
    if (!adminRole) throw new Error("Akses ditolak: Anda tidak memiliki unit.");
    return this.ppdbService.toggleObserverRole(adminRole.unitId, body.userId, body.currentStatus);
  }

  @Post('observations/result')
  @Roles(UserRole.observer, UserRole.super_admin)
  async submitObservationResult(@Body() body: any) { return this.ppdbService.submitObservationResult(body); }

  @Get('parent/registration/active')
  @Roles(UserRole.orang_tua)
  async getActiveRegistration(@Req() req: any, @Query('id') id?: string) { 
    return this.ppdbService.getActiveRegistration(req.user.id, id); 
  }

  @Post('parent/registration')
  @Roles(UserRole.orang_tua)
  async createRegistration(@Body() body: any, @Req() req: any) { return this.ppdbService.createRegistration(req.user.id, body.unitId); }

  @Post('parent/payment/upload')
  @Roles(UserRole.orang_tua)
  async uploadPaymentReceipt(@Body() body: any) { return this.ppdbService.uploadPaymentReceipt(body.registrationId, body.proofUrl); }

  @Post('parent/student-data/:regId')
  @Roles(UserRole.orang_tua)
  async submitStudentForm(@Param('regId') regId: string, @Body() body: any) { return this.ppdbService.submitStudentForm(regId, body); }

  @Post('parent/parent-data/:regId')
  @Roles(UserRole.orang_tua)
  async submitParentForm(@Param('regId') regId: string, @Body() body: any) { return this.ppdbService.submitParentForm(regId, body); }

  @Post('documents/upsert')
  @Roles(UserRole.orang_tua)
  async upsertDocument(@Body() body: any) { return this.ppdbService.upsertDocument(body.registrationId, body); }

  @Post('documents/finalize/:regId')
  @Roles(UserRole.orang_tua)
  async finalizeDocumentUpload(@Param('regId') regId: string) { return this.ppdbService.finalizeDocumentUpload(regId); }

  @Post('documents/medical-done/:regId')
  @Roles(UserRole.orang_tua)
  async markMedicalDone(@Param('regId') regId: string) { return this.ppdbService.markMedicalDone(regId); }
}
