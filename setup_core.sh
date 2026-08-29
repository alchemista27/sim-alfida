#!/bin/bash
set -e

echo "1. Installing NestJS Auth Dependencies..."
pnpm --filter @sim/api add @nestjs/passport passport passport-jwt
pnpm --filter @sim/api add -D @types/passport-jwt

echo "2. Creating Directories..."
mkdir -p apps/api/src/prisma
mkdir -p apps/api/src/auth
mkdir -p apps/api/src/common/pipes
mkdir -p apps/api/src/common/decorators
mkdir -p apps/api/src/common/guards
mkdir -p apps/api/src/ppdb
mkdir -p apps/api/src/academic
mkdir -p apps/api/src/hr
mkdir -p apps/api/src/file

echo "3. Creating Prisma Service..."
cat << 'INNER_EOF' > apps/api/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@sim/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
INNER_EOF

cat << 'INNER_EOF' > apps/api/src/prisma/prisma.module.ts
import { Global, Module } from '@common';
import { PrismaService } from './prisma.service';

// Change @common to '@nestjs/common'
INNER_EOF
sed -i "s/@common/'@nestjs\/common'/g" apps/api/src/prisma/prisma.module.ts

cat << 'INNER_EOF' > apps/api/src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
INNER_EOF

echo "4. Creating Zod Validation Pipe..."
cat << 'INNER_EOF' > apps/api/src/common/pipes/zod-validation.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.format(),
      });
    }
    return result.data;
  }
}
INNER_EOF

echo "5. Creating Auth Module (Supabase JWT)..."
cat << 'INNER_EOF' > apps/api/src/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SUPABASE_JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long',
    });
  }

  async validate(payload: any) {
    // payload.sub is the Supabase User ID (UUID)
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        roles: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
INNER_EOF

cat << 'INNER_EOF' > apps/api/src/auth/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
INNER_EOF

cat << 'INNER_EOF' > apps/api/src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@sim/database';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
INNER_EOF

cat << 'INNER_EOF' > apps/api/src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@sim/database';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.roles) return false;
    
    // Check if user has at least one of the required roles
    return user.roles.some((roleAssignment: any) => requiredRoles.includes(roleAssignment.role));
  }
}
INNER_EOF

cat << 'INNER_EOF' > apps/api/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [PassportModule],
  providers: [JwtStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
INNER_EOF

echo "6. Updating AppModule..."
cat << 'INNER_EOF' > apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
INNER_EOF

echo "Done Setup Core"
