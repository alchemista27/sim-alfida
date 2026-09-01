import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionEvidenceService } from './execution-evidence.service';

describe('ExecutionEvidenceService', () => {
  let service: ExecutionEvidenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExecutionEvidenceService],
    }).compile();

    service = module.get<ExecutionEvidenceService>(ExecutionEvidenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
