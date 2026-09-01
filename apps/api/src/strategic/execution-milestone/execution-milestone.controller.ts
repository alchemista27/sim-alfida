
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ExecutionMilestoneService } from './execution-milestone.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateExecutionMilestoneSchema, UpdateExecutionMilestoneSchema, CreateExecutionMilestoneDto, UpdateExecutionMilestoneDto } from '../dto/milestone.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('strategic/execution-milestones')
export class ExecutionMilestoneController {
  constructor(private readonly service: ExecutionMilestoneService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body(new ZodValidationPipe(CreateExecutionMilestoneSchema)) dto: CreateExecutionMilestoneDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateExecutionMilestoneSchema)) dto: UpdateExecutionMilestoneDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
