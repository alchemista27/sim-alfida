import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignStaffInput } from '@sim/shared';
import { UserRole } from '@sim/database';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class HrService {
  constructor(private readonly prisma: PrismaService) {}

  async getStaffAssignments() {
    return this.prisma.user.findMany({
      include: {
        roles: {
          include: {
            unit: true,
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async assignStaffToUnit(data: AssignStaffInput) {
    const existingRole = await this.prisma.userRoleAssignment.findFirst({
      where: {
        userId: data.userId,
        role: data.role,
        unitId: data.unitId,
      },
    });

    if (!existingRole) {
      await this.prisma.userRoleAssignment.create({
        data: {
          userId: data.userId,
          role: data.role,
          unitId: data.unitId,
        },
      });
    }

    return { success: true };
  }

  async createStaffUser(data: { fullName: string; email: string; unitId: string; role: 'guru' | 'karyawan' }) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not configured.');
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: 'Password123!',
      options: {
        data: { full_name: data.fullName },
      },
    });

    if (authError) throw new BadRequestException(authError.message);
    if (!authData.user) throw new BadRequestException('Gagal membuat pengguna di sistem.');

    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    let userId = authData.user.id;
    if (!existing) {
      await this.prisma.user.create({
        data: {
          id: userId,
          fullName: data.fullName,
          email: data.email,
          passwordHash: 'managed_by_supabase',
        },
      });
    } else {
      userId = existing.id;
    }

    await this.prisma.userRoleAssignment.create({
      data: {
        userId: userId,
        unitId: data.unitId,
        role: data.role === 'guru' ? UserRole.guru : UserRole.karyawan,
      },
    });

    return { success: true };
  }

  async removeStaffAssignment(assignmentId: string) {
    await this.prisma.userRoleAssignment.delete({
      where: { id: assignmentId },
    });
    return { success: true };
  }
}
