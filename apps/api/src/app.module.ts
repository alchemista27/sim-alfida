import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AcademicModule } from './academic/academic.module';
import { PpdbModule } from './ppdb/ppdb.module';
import { HrModule } from './hr/hr.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AcademicModule,
    PpdbModule,
    HrModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
