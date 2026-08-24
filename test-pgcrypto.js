const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const res = await prisma.$queryRaw\`SELECT crypt('testpass', gen_salt('bf')) as hash\`;
    console.log(res);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
