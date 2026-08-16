"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/actions/user";

interface AuthContextType {
  user: any | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

const AuthContext = createContext<AuthContextType>({ user: null, status: "loading" });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  const fetchUser = async () => {
    try {
      const userData = await getCurrentUser();
      if (userData) {
        setUser(userData);
        setStatus("authenticated");
      } else {
        setUser(null);
        setStatus("unauthenticated");
      }
    } catch (error) {
      console.error("Failed to fetch user roles:", error);
      setUser(null);
      setStatus("unauthenticated");
    }
  };

  useEffect(() => {
    const supabase = createClient();
    
    // Initial fetch
    fetchUser();

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Refetch user to get proper roles from DB
        fetchUser();
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
