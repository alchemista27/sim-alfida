import { Module } from '@nestjs/common';
import { SppService } from './spp.service';
import { SppController } from './spp.controller';

@Module({
  providers: [SppService],
  controllers: [SppController],
})
export class SppModule {}
