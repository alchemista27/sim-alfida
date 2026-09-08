import { Controller, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AcademicService } from './academic.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@sim/database';

@Controller('academic')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  @Post('subjects')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async createSubject(@Body() body: any, @Req() req: any) {
    const unitId = req.user.roles.find((r: any) => r.role === UserRole.admin_unit && r.unitId)?.unitId;
    return this.academicService.createSubject(unitId, body);
  }

  @Put('subjects/:id')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async updateSubject(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const unitId = req.user.roles.find((r: any) => r.role === UserRole.admin_unit && r.unitId)?.unitId;
    return this.academicService.updateSubject(id, unitId, body);
  }

  @Delete('subjects/:id')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async deleteSubject(@Param('id') id: string, @Req() req: any) {
    const unitId = req.user.roles.find((r: any) => r.role === UserRole.admin_unit && r.unitId)?.unitId;
    return this.academicService.deleteSubject(id, unitId);
  }

  @Post('teachers')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async assignTeacherToSubject(@Query('academicYearId') ayId: string, @Body() body: any) { return this.academicService.assignTeacherToSubject(body, ayId); }

  @Delete('teachers/:id')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async removeTeacherAssignment(@Param('id') id: string) { return this.academicService.removeTeacherAssignment(id); }

  @Post('homerooms')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async assignHomeroomTeacher(@Query('academicYearId') ayId: string, @Body() body: any) { return this.academicService.assignHomeroomTeacher(body, ayId); }

  @Delete('homerooms/:id')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async removeHomeroomAssignment(@Param('id') id: string) { return this.academicService.removeHomeroomAssignment(id); }

  @Post('classes')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async createClass(@Body() body: any) { return this.academicService.createClass(body); }

  @Put('classes/:id')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async updateClass(@Param('id') id: string, @Body() body: any) { return this.academicService.updateClass(id, body); }

  @Delete('classes/:id')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async deleteClass(@Param('id') id: string) { return this.academicService.deleteClass(id); }

  @Post('classes/assign')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async assignToClass(@Body() body: any) { return this.academicService.assignToClass(body.registrationId, body.classId); }

  @Post('attendance/batch')
  @Roles(UserRole.guru, UserRole.admin_unit, UserRole.super_admin)
  async submitBatchAttendance(@Body() body: any, @Req() req: any) { return this.academicService.submitBatchAttendance(req.user.id, body); }

  @Post('grades/batch')
  @Roles(UserRole.guru, UserRole.admin_unit, UserRole.super_admin)
  async submitBatchGrade(@Query('academicYearId') ayId: string, @Body() body: any, @Req() req: any) { return this.academicService.submitBatchGrade(req.user.id, ayId, body); }

  @Post('promotions')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async processPromotions(@Body() body: any, @Req() req: any) { return this.academicService.processPromotions(req.user.id, body); }

  @Post('lhbs/generate')
  @Roles(UserRole.guru, UserRole.admin_unit, UserRole.super_admin)
  async generateLhbsReport(@Body() body: any, @Req() req: any) { return this.academicService.generateLhbsReport(req.user.id, body); }

  @Post('schedules')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async upsertClassSchedule(@Body() body: any) { return this.academicService.upsertClassSchedule(body); }

  @Delete('schedules/:id')
  @Roles(UserRole.guru, UserRole.admin_unit, UserRole.super_admin)
  async deleteClassSchedule(@Param('id') id: string) { return this.academicService.deleteClassSchedule(id); }

  @Post('journals')
  @Roles(UserRole.guru, UserRole.admin_unit)
  async upsertTeachingJournal(@Body() body: any, @Req() req: any) { return this.academicService.upsertTeachingJournal(req.user.id, body); }

  @Delete('journals/:id')
  @Roles(UserRole.guru, UserRole.admin_unit)
  async deleteTeachingJournal(@Param('id') id: string) { return this.academicService.deleteTeachingJournal(id); }

  @Post('lesson-plans')
  @Roles(UserRole.guru, UserRole.admin_unit)
  async upsertLessonPlan(@Body() body: any, @Req() req: any) { return this.academicService.upsertLessonPlan(req.user.id, body); }

  @Delete('lesson-plans/:id')
  @Roles(UserRole.guru, UserRole.admin_unit)
  async deleteLessonPlan(@Param('id') id: string) { return this.academicService.deleteLessonPlan(id); }

  @Post('extracurricular/join')
  @Roles(UserRole.orang_tua)
  async joinExtracurricular(@Body() body: any, @Req() req: any) { return this.academicService.joinExtracurricular(req.user.id, body.enrollmentId, body.extraId, body.academicYearId); }

  @Delete('extracurricular/leave/:memberId')
  @Roles(UserRole.orang_tua)
  async leaveExtracurricular(@Param('memberId') memberId: string, @Req() req: any) { return this.academicService.leaveExtracurricular(req.user.id, memberId); }
  @Post('extracurricular')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async upsertExtracurricular(@Body() body: any, @Req() req: any) {
    const unitId = req.user.roles.find((r: any) => r.role === UserRole.admin_unit && r.unitId)?.unitId;
    return this.academicService.upsertExtracurricular(unitId, body);
  }
  @Post('extracurricular/:id/coaches')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async assignCoach(@Param('id') id: string, @Body() body: any) { return this.academicService.assignCoach(id, body.userId, body.academicYearId); }
  @Delete('extracurricular/coaches/:id')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async removeCoach(@Param('id') id: string) { return this.academicService.removeCoach(id); }
  @Post('extracurricular/:id/schedules')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async upsertExtraSchedule(@Param('id') id: string, @Body() body: any) { return this.academicService.upsertExtraSchedule(id, body); }
  @Delete('extracurricular/schedules/:id')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  async deleteExtraSchedule(@Param('id') id: string) { return this.academicService.deleteExtraSchedule(id); }
  @Post('extracurricular/:id/journals')
  @Roles(UserRole.guru, UserRole.karyawan)
  async upsertExtraJournal(@Param('id') id: string, @Body() body: any, @Req() req: any) { return this.academicService.upsertExtraJournal(req.user.id, id, body); }
  @Delete('extracurricular/journals/:id')
  @Roles(UserRole.guru, UserRole.karyawan)
  async deleteExtraJournal(@Param('id') id: string) { return this.academicService.deleteExtraJournal(id); }
  @Post('extracurricular/:id/grades')
  @Roles(UserRole.guru, UserRole.karyawan)
  async upsertExtraGrade(@Param('id') id: string, @Body() body: any) { return this.academicService.upsertExtraGrade(id, body); }
}
