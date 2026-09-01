import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionProgramService } from './execution-program.service';

describe('ExecutionProgramService', () => {
  let service: ExecutionProgramService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExecutionProgramService],
    }).compile();

    service = module.get<ExecutionProgramService>(ExecutionProgramService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
