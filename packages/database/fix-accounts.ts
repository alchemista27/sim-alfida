import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    await prisma.account.updateMany({
      where: { userId: user.id, providerId: 'credential' },
      data: { accountId: user.id }
    });
  }
  console.log("Fixed accountIds.");
}
main().catch(console.error).finally(() => prisma.$disconnect());
