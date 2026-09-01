import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionMilestoneService } from './execution-milestone.service';

describe('ExecutionMilestoneService', () => {
  let service: ExecutionMilestoneService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExecutionMilestoneService],
    }).compile();

    service = module.get<ExecutionMilestoneService>(ExecutionMilestoneService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
