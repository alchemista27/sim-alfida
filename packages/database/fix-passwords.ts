import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const config = { N: 16384, r: 16, p: 1, dkLen: 64 };
function generateKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(
      password.normalize("NFKC"), salt, config.dkLen,
      { N: config.N, r: config.r, p: config.p, maxmem: 128 * config.N * config.r * 2 },
      (err, key) => err ? reject(err) : resolve(key)
    );
  });
}
async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = await generateKey(password, salt);
  return `${salt}:${key.toString("hex")}`;
}

const prisma = new PrismaClient();
async function main() {
  const accounts = await prisma.account.findMany();
  for (const acc of accounts) {
    let passwordToHash = "Password123!";
    if (acc.accountId === "4d11be6a-c525-443f-9fde-fd6aa7c09cbe" || acc.accountId.startsWith("admin")) { // superadmin
      passwordToHash = "4dmin4lfid4";
    }
    const newHash = await hashPassword(passwordToHash);
    await prisma.account.update({
      where: { id: acc.id },
      data: { password: newHash }
    });
  }
  console.log("Passwords fixed!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
