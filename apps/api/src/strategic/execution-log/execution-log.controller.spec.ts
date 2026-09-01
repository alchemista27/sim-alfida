import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionLogController } from './execution-log.controller';

describe('ExecutionLogController', () => {
  let controller: ExecutionLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExecutionLogController],
    }).compile();

    controller = module.get<ExecutionLogController>(ExecutionLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
