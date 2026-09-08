import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { SppService } from './spp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@sim/database';

@Controller('spp')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SppController {
  constructor(private readonly sppService: SppService) {}

  @Post('generate')
  @Roles(UserRole.super_admin, UserRole.admin_unit)
  async generateBulkInvoices(
    @Body() data: {
      unitId: string;
      academicYearId: string;
      month: number;
      year: number;
      amount: number;
      generatedBy: string;
    }
  ) {
    return this.sppService.generateBulkInvoices(data);
  }

  @Post('upload-proof')
  @Roles(UserRole.orang_tua)
  async uploadSppProof(@Body() body: any) {
    return this.sppService.uploadSppProof(body.invoiceId, body.proofUrl);
  }

  @Post('verify')
  @Roles(UserRole.super_admin, UserRole.admin_unit)
  async verifySppInvoice(@Body() body: any, @Req() req: any) {
    return this.sppService.verifySppInvoice(body.invoiceId, body.status, body.rejectionNote, req.user.id);
  }
}
