import { Module } from '@nestjs/common';
import { StrategicDepartmentController } from './strategic-department/strategic-department.controller';
import { StrategicDepartmentService } from './strategic-department/strategic-department.service';
import { ExecutionProgramController } from './execution-program/execution-program.controller';
import { ExecutionProgramService } from './execution-program/execution-program.service';
import { ExecutionKpiController } from './execution-kpi/execution-kpi.controller';
import { ExecutionKpiService } from './execution-kpi/execution-kpi.service';

@Module({
  controllers: [StrategicDepartmentController, ExecutionProgramController, ExecutionKpiController],
  providers: [StrategicDepartmentService, ExecutionProgramService, ExecutionKpiService]
})
export class StrategicModule {}
