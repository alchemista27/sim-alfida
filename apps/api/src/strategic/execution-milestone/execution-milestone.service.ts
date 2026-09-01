
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExecutionMilestoneService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.executionMilestone.findMany();
  }

  async findOne(id: string) {
    return this.prisma.executionMilestone.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.executionMilestone.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.executionMilestone.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.executionMilestone.delete({ where: { id } });
  }
}
