
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExecutionLogService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.executionRealizationLog.findMany();
  }

  async findOne(id: string) {
    return this.prisma.executionRealizationLog.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.executionRealizationLog.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.executionRealizationLog.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.executionRealizationLog.delete({ where: { id } });
  }
}
