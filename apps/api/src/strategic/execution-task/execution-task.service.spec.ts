import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionTaskService } from './execution-task.service';

describe('ExecutionTaskService', () => {
  let service: ExecutionTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExecutionTaskService],
    }).compile();

    service = module.get<ExecutionTaskService>(ExecutionTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
