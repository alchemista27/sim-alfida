import { Test, TestingModule } from '@nestjs/testing';
import { StrategicDepartmentService } from './strategic-department.service';

describe('StrategicDepartmentService', () => {
  let service: StrategicDepartmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StrategicDepartmentService],
    }).compile();

    service = module.get<StrategicDepartmentService>(StrategicDepartmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
