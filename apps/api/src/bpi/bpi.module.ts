import { Module } from '@nestjs/common';
import { BpiService } from './bpi.service';
import { BpiController } from './bpi.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BpiService],
  controllers: [BpiController],
  exports: [BpiService],
})
export class BpiModule {}
