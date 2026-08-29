import { Controller, Post, Body, UsePipes, UseGuards } from '@nestjs/common';
import { PpdbService } from './ppdb.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { verifyPaymentSchema, VerifyPaymentDto } from '@sim/shared';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@sim/database';

@Controller('ppdb')
export class PpdbController {
  constructor(private readonly ppdbService: PpdbService) {}

  @Post('verify-payment')
  @Roles(UserRole.admin_unit, UserRole.super_admin)
  @UseGuards(RolesGuard)
  @UsePipes(new ZodValidationPipe(verifyPaymentSchema))
  async verifyPayment(@Body() body: VerifyPaymentDto) {
    const { registrationId, isApproved, reason } = body;
    return this.ppdbService.verifyPayment(registrationId, isApproved, reason);
  }
}
