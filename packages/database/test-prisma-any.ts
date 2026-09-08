import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const ids = ['4d11be6a-c525-443f-9fde-fd6aa7c09cbe'];
  // Using ANY($1::uuid[])
  const res = await prisma.$queryRaw`
    SELECT id FROM shared.users WHERE id = ANY(${ids}::uuid[])
  `;
  console.log(res);
}
main().catch(console.error).finally(() => prisma.$disconnect());
