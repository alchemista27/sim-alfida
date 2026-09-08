import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({ where: { email: "admin@alfida.com" }});
  console.log("User:", user?.id);
  const accounts = await prisma.account.findMany({ where: { userId: user?.id }});
  console.log("Accounts:", accounts);
}
main().catch(console.error).finally(() => prisma.$disconnect());
