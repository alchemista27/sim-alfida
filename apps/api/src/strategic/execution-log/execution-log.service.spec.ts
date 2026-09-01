import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionLogService } from './execution-log.service';

describe('ExecutionLogService', () => {
  let service: ExecutionLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExecutionLogService],
    }).compile();

    service = module.get<ExecutionLogService>(ExecutionLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
