
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ExecutionLogService } from './execution-log.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateExecutionLogSchema, UpdateExecutionLogSchema, CreateExecutionLogDto, UpdateExecutionLogDto } from '../dto/log.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('strategic/execution-logs')
export class ExecutionLogController {
  constructor(private readonly service: ExecutionLogService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body(new ZodValidationPipe(CreateExecutionLogSchema)) dto: CreateExecutionLogDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateExecutionLogSchema)) dto: UpdateExecutionLogDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
