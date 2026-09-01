import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionProgramController } from './execution-program.controller';

describe('ExecutionProgramController', () => {
  let controller: ExecutionProgramController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExecutionProgramController],
    }).compile();

    controller = module.get<ExecutionProgramController>(ExecutionProgramController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
