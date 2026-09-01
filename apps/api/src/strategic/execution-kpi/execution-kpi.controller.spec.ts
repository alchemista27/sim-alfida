import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionKpiController } from './execution-kpi.controller';

describe('ExecutionKpiController', () => {
  let controller: ExecutionKpiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExecutionKpiController],
    }).compile();

    controller = module.get<ExecutionKpiController>(ExecutionKpiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
