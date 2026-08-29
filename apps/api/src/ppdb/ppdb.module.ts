import { Module } from '@nestjs/common';
import { PpdbController } from './ppdb.controller';
import { PpdbService } from './ppdb.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PpdbController],
  providers: [PpdbService],
  exports: [PpdbService],
})
export class PpdbModule {}
