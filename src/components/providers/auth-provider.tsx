"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface AuthContextType {
  user: any | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

const AuthContext = createContext<AuthContextType>({ user: null, status: "loading" });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    const supabase = createClient();
    
    // Initial fetch
    supabase.auth.getUser().then(({ data: { user } }) => {
      // In a real app we'd fetch Prisma user roles here via a separate API endpoint, 
      // but for this UI test we'll mock roles based on user existence
      if (user) {
        setUser({ ...user, name: user.user_metadata?.full_name || user.email?.split("@")[0], roles: [{ role: "orang_tua" }] });
        setStatus("authenticated");
      } else {
        setUser(null);
        setStatus("unauthenticated");
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({ ...session.user, name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0], roles: [{ role: "orang_tua" }] });
        setStatus("authenticated");
      } else {
        setUser(null);
        setStatus("unauthenticated");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, status }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
