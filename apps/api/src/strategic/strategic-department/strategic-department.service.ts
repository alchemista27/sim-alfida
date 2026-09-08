
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from '../dto/department.dto';

@Injectable()
export class StrategicDepartmentService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.department.findMany({
      include: { parent: true, leader: true, unit: true },
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.department.findUnique({
      where: { id },
      include: { children: true, leader: true, unit: true, parent: true }
    });
  }

  async create(data: CreateDepartmentDto) {
    return this.prisma.department.create({ data: data as any });
  }

  async update(id: string, data: UpdateDepartmentDto) {
    return this.prisma.department.update({ where: { id }, data: data as any });
  }

  async remove(id: string) {
    return this.prisma.department.delete({ where: { id } });
  }

  async getDepartmentOverview() {
    const workPrograms = await this.prisma.workProgram.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    let planned = 0, ongoing = 0, completed = 0;
    workPrograms.forEach((wp: any) => {
      if (wp.status === 'planned') planned = wp._count.id;
      if (wp.status === 'ongoing') ongoing = wp._count.id;
      if (wp.status === 'completed') completed = wp._count.id;
    });
    const totalReports = await this.prisma.activityReport.count();
    return { planned, ongoing, completed, totalReports };
  }
}
