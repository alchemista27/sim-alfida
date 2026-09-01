import { Test, TestingModule } from '@nestjs/testing';
import { StrategicDepartmentController } from './strategic-department.controller';

describe('StrategicDepartmentController', () => {
  let controller: StrategicDepartmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StrategicDepartmentController],
    }).compile();

    controller = module.get<StrategicDepartmentController>(StrategicDepartmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
