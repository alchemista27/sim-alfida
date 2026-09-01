import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionKpiService } from './execution-kpi.service';

describe('ExecutionKpiService', () => {
  let service: ExecutionKpiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExecutionKpiService],
    }).compile();

    service = module.get<ExecutionKpiService>(ExecutionKpiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
