const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.$queryRaw`SELECT schema_name FROM information_schema.schemata`;
  console.log(result.map(r => r.schema_name).join('\n'));
}
main();
