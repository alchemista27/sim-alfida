import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionTaskController } from './execution-task.controller';

describe('ExecutionTaskController', () => {
  let controller: ExecutionTaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExecutionTaskController],
    }).compile();

    controller = module.get<ExecutionTaskController>(ExecutionTaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
