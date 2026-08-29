import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrationStatus } from '@sim/database';

@Injectable()
export class PpdbService {
  constructor(private readonly prisma: PrismaService) {}

  async verifyPayment(registrationId: string, isApproved: boolean, reason?: string) {
    const newStatus = isApproved ? RegistrationStatus.payment_verified : RegistrationStatus.pending_payment;
    
    return this.prisma.$transaction([
      this.prisma.registration.update({
        where: { id: registrationId },
        data: { status: newStatus },
      }),
      this.prisma.payment.update({
        where: { registrationId },
        data: { 
          status: isApproved ? "verified" : "rejected",
          verifiedAt: isApproved ? new Date() : null,
        },
      }),
    ]);
  }
}
