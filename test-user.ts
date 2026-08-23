import { prisma } from "./src/lib/prisma";
async function test() {
  const email = "bpi@alfida.com";
  let dbUser = await prisma.user.findUnique({
    where: { email },
    include: { roles: true }
  });
  console.log("DB User:", JSON.stringify(dbUser, null, 2));
}
test();
