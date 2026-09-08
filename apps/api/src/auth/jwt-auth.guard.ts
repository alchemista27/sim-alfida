import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {

  constructor(private prisma: PrismaService) {


  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    let token = authHeader.split(' ')[1];

    // Better Auth sends signed cookies in the format: <token>.<signature>
    // We only need the raw <token> to query the Session table in the database
    const signatureStartPos = token.lastIndexOf(".");
    if (signatureStartPos > 0) {
      token = token.substring(0, signatureStartPos);
    }

    // Verify token online with Prisma Session table (Better Auth)
    const session = await this.prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          include: { roles: true }
        }
      }
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (!session.user) {
      throw new UnauthorizedException('User not found in database');
    }

    // Attach user to request
    request.user = session.user;
    return true;
  }
}
