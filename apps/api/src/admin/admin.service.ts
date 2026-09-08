import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@sim/database';
import * as crypto from 'crypto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ================= USERS =================
  private async hashPassword(password: string): Promise<string> {
    const config = { N: 16384, r: 16, p: 1, dkLen: 64 };
    const salt = crypto.randomBytes(16).toString("hex");
    return new Promise((resolve, reject) => {
      crypto.scrypt(
        password.normalize("NFKC"), salt, config.dkLen,
        { N: config.N, r: config.r, p: config.p, maxmem: 128 * config.N * config.r * 2 },
        (err, key) => err ? reject(err) : resolve(`${salt}:${key.toString("hex")}`)
      );
    });
  }

  private mapRole(roleStr: string): UserRole {
    const r = roleStr.toLowerCase();
    if (r.includes('super')) return UserRole.super_admin;
    if (r.includes('admin') || r.includes('tu') || r.includes('staf')) return UserRole.admin_unit;
    if (r.includes('guru') || r.includes('pengajar')) return UserRole.guru;
    if (r.includes('karyawan')) return UserRole.karyawan;
    if (r.includes('ppdb')) return UserRole.tim_ppdb;
    if (r.includes('observer')) return UserRole.observer;
    return UserRole.orang_tua;
  }

  async batchImportUsers(usersData: any[]) {
    if (!usersData || usersData.length === 0) throw new BadRequestException("Data kosong.");
    
    const payload = usersData.filter(row => row.email).map(row => ({
      id: row.id || undefined,
      email: row.email,
      password: row.password || 'password123',
      username: row.username,
      fullName: row.first_name || row.last_name 
        ? `${row.first_name || ''} ${row.last_name || ''}`.trim() 
        : row.username || 'Pegawai',
      first_name: row.first_name,
      last_name: row.last_name,
      groups: row.groups ? String(row.groups).split(';').map((g: string) => g.trim()) : [],
      roles: row.roles ? String(row.roles).split(';').map((r: string) => this.mapRole(r.trim())) : ['karyawan']
    }));

    if (payload.length === 0) throw new BadRequestException("Tidak ada data dengan email valid.");

    const result: any = await this.prisma.$queryRaw`SELECT batch_import_users_rpc(${JSON.stringify(payload)}::jsonb) as res`;
    const rpcData = result[0]?.res;

    const emails = payload.map(p => p.email);
    const importedUsers = await this.prisma.user.findMany({ where: { email: { in: emails } }, select: { id: true, email: true } });
    const userMap = new Map(importedUsers.map(u => [u.email, u.id]));

    const rolesToCreate: { userId: string, role: UserRole }[] = [];
    for (const p of payload) {
      const uid = userMap.get(p.email);
      if (uid) {
        for (const role of p.roles) {
          rolesToCreate.push({ userId: uid, role: role as UserRole });
        }
      }
    }

    if (rolesToCreate.length > 0) {
      await this.prisma.userRoleAssignment.createMany({ data: rolesToCreate, skipDuplicates: true });
    }
    return { success: true, imported: rpcData?.count || 0 };
  }

  async updateUserRoles(userId: string, roles: UserRole[], groups: string[]) {
    // Hapus role yang sudah tidak dipilih (termasuk spesifik unit)
    await this.prisma.userRoleAssignment.deleteMany({
      where: { userId, role: { notIn: roles } }
    });

    // Cari role yang masih ada
    const existing = await this.prisma.userRoleAssignment.findMany({
      where: { userId, role: { in: roles } }
    });
    const existingRoles = new Set(existing.map(a => a.role));
    
    // Tambahkan role dasar (unitId: null) untuk role yang baru dipilih
    const rolesToAdd = roles.filter(r => !existingRoles.has(r));

    const tx = [];
    if (rolesToAdd.length > 0) {
      tx.push(this.prisma.userRoleAssignment.createMany({
        data: rolesToAdd.map(r => ({ userId, role: r }))
      }));
    }
    tx.push(this.prisma.user.update({ where: { id: userId }, data: { groups } }));

    await this.prisma.$transaction(tx);
    return { success: true };
  }

  async createUserManual(data: any) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new BadRequestException("Email sudah terdaftar.");

    const userId = crypto.randomUUID();
    const hashedPassword = await this.hashPassword(data.password || 'password123');

    await this.prisma.$transaction([
      this.prisma.user.create({
        data: {
          id: userId, email: data.email, fullName: data.fullName, username: data.username || undefined,
          name: data.fullName, passwordHash: 'credential', isActive: true, groups: data.groups,
        }
      }),
      this.prisma.account.create({
        data: { id: crypto.randomUUID(), userId, accountId: userId, providerId: 'credential', password: hashedPassword }
      }),
      ...(data.roles.length > 0 ? [ this.prisma.userRoleAssignment.createMany({ data: data.roles.map((r:UserRole) => ({ userId, role: r })) }) ] : [])
    ]);
    return { success: true };
  }

  async deleteUser(userId: string) {
    await this.prisma.$transaction([
      this.prisma.account.deleteMany({ where: { userId } }),
      this.prisma.session.deleteMany({ where: { userId } }),
      this.prisma.userRoleAssignment.deleteMany({ where: { userId } }),
      this.prisma.user.delete({ where: { id: userId } })
    ]);
    return { success: true };
  }

  async searchUsers(query: string) {
    if (!query || query.length < 1) return [];
    return this.prisma.user.findMany({
      where: { OR: [ { fullName: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } } ] },
      take: 10, select: { id: true, fullName: true, email: true }
    });
  }

  // ================= UNITS =================
  async createUnit(data: any) {
    return this.prisma.unit.create({
      data: { name: data.name, slug: data.slug, level: data.level, isActive: data.isActive, unitSettings: { create: { principalName: `Kepala Sekolah ${data.name}` } } }
    });
  }

  async updateUnit(id: string, data: any) {
    return this.prisma.unit.update({ where: { id }, data: { name: data.name, level: data.level, isActive: data.isActive } });
  }

  async assignAdminUnit(userId: string, unitId: string, isNondik: boolean = false) {
    const role = isNondik ? UserRole.admin_unit_nondik : UserRole.admin_unit;
    return this.prisma.userRoleAssignment.upsert({
      where: { userId_role_unitId: { userId, role, unitId } },
      update: {}, create: { userId, role, unitId }
    });
  }

  async removeAdminUnit(userId: string, unitId: string, isNondik: boolean = false) {
    const role = isNondik ? UserRole.admin_unit_nondik : UserRole.admin_unit;
    await this.prisma.userRoleAssignment.deleteMany({ where: { userId, role, unitId } });
    return { success: true };
  }

  async deleteUnit(unitId: string) {
    const hasActiveData = await this.prisma.registration.count({ where: { academicYear: { unitId } } });
    if (hasActiveData > 0) throw new BadRequestException("Unit masih memiliki data pendaftaran aktif. Hapus atau pindahkan data terlebih dahulu.");
    
    await this.prisma.$transaction([
      this.prisma.unitSettings.deleteMany({ where: { unitId } }),
      this.prisma.userRoleAssignment.deleteMany({ where: { unitId } }),
      this.prisma.academicYear.deleteMany({ where: { unitId } }),
      this.prisma.unit.delete({ where: { id: unitId } })
    ]);
    return { success: true };
  }

  async updateUnitSettings(unitId: string, data: any) {
    return this.prisma.unitSettings.update({ where: { unitId }, data });
  }

  async createAcademicYear(unitId: string, data: any) {
    if (data.ppdbActive) await this.prisma.academicYear.updateMany({ where: { unitId }, data: { ppdbActive: false } });
    return this.prisma.academicYear.create({
      data: { unitId, name: data.name, startDate: new Date(data.startDate), endDate: new Date(data.endDate), quota: data.quota, ppdbActive: data.ppdbActive, registered: 0 }
    });
  }

  async togglePpdbActive(unitId: string, academicYearId: string, activate: boolean) {
    if (activate) await this.prisma.academicYear.updateMany({ where: { unitId }, data: { ppdbActive: false } });
    return this.prisma.academicYear.update({ where: { id: academicYearId }, data: { ppdbActive: activate } });
  }

  // ================= FOUNDATION =================
  async getFoundationSettings() {
    let settings = await this.prisma.foundationSettings.findFirst();
    if (!settings) settings = await this.prisma.foundationSettings.create({ data: { foundationName: "Yayasan Alfida" } });
    return settings;
  }

  async updateFoundationSettings(id: string, data: any) {
    return this.prisma.foundationSettings.update({ where: { id }, data });
  }
}
