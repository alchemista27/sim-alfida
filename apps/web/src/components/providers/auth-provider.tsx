"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { getCurrentUser } from "@/actions/user";

interface AuthContextType {
  user: any | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

const AuthContext = createContext<AuthContextType>({ user: null, status: "loading" });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  const { data: session, isPending } = authClient.useSession();

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
    if (isPending) {
      setStatus("loading");
      return;
    }
    
    if (session?.user) {
      fetchUser();
    } else {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, [session, isPending]);

  return <AuthContext.Provider value={{ user, status }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
