
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { ExecutionKpiService } from './execution-kpi.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateExecutionKPISchema, UpdateExecutionKPISchema, CreateExecutionKPIDto, UpdateExecutionKPIDto } from '../dto/kpi.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('strategic/kpis')
export class ExecutionKpiController {
  constructor(private readonly service: ExecutionKpiService) {}

  @Get()
  findAll(@Query('programId') programId?: string) { 
    if (programId) return this.service.findByProgram(programId);
    return this.service.findAll(); 
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body(new ZodValidationPipe(CreateExecutionKPISchema)) dto: CreateExecutionKPIDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateExecutionKPISchema)) dto: UpdateExecutionKPIDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
