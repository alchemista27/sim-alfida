import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: any) {
    const user = req.user;
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles
    };
  }

  @Post('update-email')
  @UseGuards(JwtAuthGuard)
  async updateEmail(@Req() req: any, @Body() body: { email: string }) {
    return this.prisma.user.update({
      where: { id: req.user.id },
      data: { email: body.email }
    });
  }
}
