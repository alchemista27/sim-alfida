
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExecutionProgramDto, UpdateExecutionProgramDto } from '../dto/program.dto';

@Injectable()
export class ExecutionProgramService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.workProgram.findMany({
      include: { department: true, user: true, coordinator: true, kpis: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.workProgram.findUnique({
      where: { id },
      include: { department: true, user: true, coordinator: true, kpis: true }
    });
  }

  async create(data: CreateExecutionProgramDto) {
    return this.prisma.workProgram.create({ data: data as any });
  }

  async update(id: string, data: UpdateExecutionProgramDto) {
    return this.prisma.workProgram.update({ where: { id }, data: data as any });
  }

  async remove(id: string) {
    return this.prisma.workProgram.delete({ where: { id } });
  }
}
