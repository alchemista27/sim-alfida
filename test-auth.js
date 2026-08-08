const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "admin@alfida.com",
    password: "Password123!",
  });
  console.log("Error:", error);
  console.log("Data:", data.user ? "User logged in!" : "No user");
}
test();
