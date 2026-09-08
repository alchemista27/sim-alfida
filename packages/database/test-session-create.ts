import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    await prisma.session.create({
      data: {
        userId: '4d11be6a-c525-443f-9fde-fd6aa7c09cbe',
        token: 'test_token',
        expiresAt: new Date(),
        ipAddress: '127.0.0.1',
        userAgent: 'test agent',
        createdAt: new Date(),
        updatedAt: new Date()
      } as any
    });
    console.log("Success");
  } catch (err) {
    console.error(err);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
