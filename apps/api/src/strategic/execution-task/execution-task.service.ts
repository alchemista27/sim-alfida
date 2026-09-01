
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExecutionTaskService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.executionTask.findMany();
  }

  async findOne(id: string) {
    return this.prisma.executionTask.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.executionTask.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.executionTask.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.executionTask.delete({ where: { id } });
  }
}
