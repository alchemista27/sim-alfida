import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionMilestoneController } from './execution-milestone.controller';

describe('ExecutionMilestoneController', () => {
  let controller: ExecutionMilestoneController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExecutionMilestoneController],
    }).compile();

    controller = module.get<ExecutionMilestoneController>(ExecutionMilestoneController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
