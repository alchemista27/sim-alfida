import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
  Query,
} from '@nestjs/common';
import { AcademicService } from './academic.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  SubjectSchema,
  TeacherAssignmentSchema,
  HomeroomAssignmentSchema,
} from '@sim/shared';

@Controller('academic')
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  // --- Subject Management ---

  @Post('subjects')
  @UsePipes(new ZodValidationPipe(SubjectSchema))
  async createSubject(
    @Query('unitId') unitId: string, // Assuming unitId is passed in query for now
    @Body() body: any,
  ) {
    return this.academicService.createSubject(unitId, body);
  }

  @Put('subjects/:id')
  @UsePipes(new ZodValidationPipe(SubjectSchema))
  async updateSubject(
    @Param('id') id: string,
    @Query('unitId') unitId: string,
    @Body() body: any,
  ) {
    return this.academicService.updateSubject(id, unitId, body);
  }

  @Delete('subjects/:id')
  async deleteSubject(
    @Param('id') id: string,
    @Query('unitId') unitId: string,
  ) {
    return this.academicService.deleteSubject(id, unitId);
  }

  // --- Teacher Assignment ---

  @Post('teachers')
  @UsePipes(new ZodValidationPipe(TeacherAssignmentSchema))
  async assignTeacherToSubject(
    @Query('academicYearId') academicYearId: string,
    @Body() body: any,
  ) {
    return this.academicService.assignTeacherToSubject(body, academicYearId);
  }

  @Delete('teachers/:id')
  async removeTeacherAssignment(@Param('id') id: string) {
    return this.academicService.removeTeacherAssignment(id);
  }

  // --- Homeroom Assignment ---

  @Post('homerooms')
  @UsePipes(new ZodValidationPipe(HomeroomAssignmentSchema))
  async assignHomeroomTeacher(
    @Query('academicYearId') academicYearId: string,
    @Body() body: any,
  ) {
    return this.academicService.assignHomeroomTeacher(body, academicYearId);
  }

  @Delete('homerooms/:id')
  async removeHomeroomAssignment(@Param('id') id: string) {
    return this.academicService.removeHomeroomAssignment(id);
  }
}
