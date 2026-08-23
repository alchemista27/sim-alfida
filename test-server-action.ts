import { getCurrentUser } from './src/actions/user';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

async function test() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const prisma = new PrismaClient();
  
  // mock the server environment
  const { data: { user } } = await supabase.auth.signInWithPassword({ email: 'bpi@alfida.com', password: 'Password123!' });
  
  let dbUser = await prisma.user.findUnique({ where: { id: user?.id }, include: { roles: true } });
  if (!dbUser && user?.email) {
    dbUser = await prisma.user.findUnique({ where: { email: user.email }, include: { roles: true } });
  }

  const result = {
    ...user,
    name: dbUser?.fullName || user?.user_metadata?.full_name || user?.email?.split("@")[0],
    roles: dbUser?.roles || [{ role: "orang_tua" }]
  };
  console.log(JSON.stringify(result.roles, null, 2));
}
test();
