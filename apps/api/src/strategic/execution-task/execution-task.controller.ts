
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ExecutionTaskService } from './execution-task.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateExecutionTaskSchema, UpdateExecutionTaskSchema, CreateExecutionTaskDto, UpdateExecutionTaskDto } from '../dto/task.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('strategic/execution-tasks')
export class ExecutionTaskController {
  constructor(private readonly service: ExecutionTaskService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body(new ZodValidationPipe(CreateExecutionTaskSchema)) dto: CreateExecutionTaskDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateExecutionTaskSchema)) dto: UpdateExecutionTaskDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
