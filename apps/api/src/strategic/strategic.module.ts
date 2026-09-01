import { Module } from '@nestjs/common';
import { StrategicDepartmentController } from './strategic-department/strategic-department.controller';
import { StrategicDepartmentService } from './strategic-department/strategic-department.service';
import { ExecutionProgramController } from './execution-program/execution-program.controller';
import { ExecutionProgramService } from './execution-program/execution-program.service';
import { ExecutionKpiController } from './execution-kpi/execution-kpi.controller';
import { ExecutionKpiService } from './execution-kpi/execution-kpi.service';
import { ExecutionMilestoneController } from './execution-milestone/execution-milestone.controller';
import { ExecutionMilestoneService } from './execution-milestone/execution-milestone.service';
import { ExecutionTaskController } from './execution-task/execution-task.controller';
import { ExecutionTaskService } from './execution-task/execution-task.service';
import { ExecutionLogController } from './execution-log/execution-log.controller';
import { ExecutionLogService } from './execution-log/execution-log.service';
import { ExecutionEvidenceController } from './execution-evidence/execution-evidence.controller';
import { ExecutionEvidenceService } from './execution-evidence/execution-evidence.service';

@Module({
  controllers: [StrategicDepartmentController, ExecutionProgramController, ExecutionKpiController, ExecutionMilestoneController, ExecutionTaskController, ExecutionLogController, ExecutionEvidenceController],
  providers: [StrategicDepartmentService, ExecutionProgramService, ExecutionKpiService, ExecutionMilestoneService, ExecutionTaskService, ExecutionLogService, ExecutionEvidenceService]
})
export class StrategicModule {}
