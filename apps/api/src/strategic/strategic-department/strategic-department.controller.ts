
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { StrategicDepartmentService } from './strategic-department.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateDepartmentSchema, UpdateDepartmentSchema, CreateDepartmentDto, UpdateDepartmentDto } from '../dto/department.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('strategic/departments')
export class StrategicDepartmentController {
  constructor(private readonly service: StrategicDepartmentService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body(new ZodValidationPipe(CreateDepartmentSchema)) dto: CreateDepartmentDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateDepartmentSchema)) dto: UpdateDepartmentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }

  @Get('overview')
  getDepartmentOverview() { return this.service.getDepartmentOverview(); }
}
