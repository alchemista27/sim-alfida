import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AcademicModule } from './academic/academic.module';
import { PpdbModule } from './ppdb/ppdb.module';
import { HrModule } from './hr/hr.module';
import { SppModule } from "./spp/spp.module";
import { StrategicModule } from './strategic/strategic.module';
import { AdminModule } from './admin/admin.module';
import { BpiModule } from './bpi/bpi.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AcademicModule,
    PpdbModule,
    HrModule,
    SppModule,
    StrategicModule,
    AdminModule,
    BpiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
