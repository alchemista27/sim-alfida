import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionEvidenceController } from './execution-evidence.controller';

describe('ExecutionEvidenceController', () => {
  let controller: ExecutionEvidenceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExecutionEvidenceController],
    }).compile();

    controller = module.get<ExecutionEvidenceController>(ExecutionEvidenceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
