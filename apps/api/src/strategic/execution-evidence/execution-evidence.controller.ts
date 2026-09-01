
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ExecutionEvidenceService } from './execution-evidence.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateExecutionEvidenceSchema, UpdateExecutionEvidenceSchema, CreateExecutionEvidenceDto, UpdateExecutionEvidenceDto } from '../dto/evidence.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('strategic/execution-evidences')
export class ExecutionEvidenceController {
  constructor(private readonly service: ExecutionEvidenceService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body(new ZodValidationPipe(CreateExecutionEvidenceSchema)) dto: CreateExecutionEvidenceDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateExecutionEvidenceSchema)) dto: UpdateExecutionEvidenceDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
