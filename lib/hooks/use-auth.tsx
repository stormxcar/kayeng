"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type KayengProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: "learner" | "teacher" | "content_editor" | "reviewer" | "support" | "admin";
  cefr_level: string;
  occupation: string | null;
  daily_goal_minutes: number;
  preferred_accent: "american" | "british";
  learning_goal: string | null;
  onboarding_completed: boolean;
};

type AuthContextValue = {
  user: User | null;
  profile: KayengProfile | null;
  loading: boolean;
  supabase: SupabaseClient;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<KayengProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id,display_name,avatar_url,role,cefr_level,occupation,daily_goal_minutes,preferred_accent,learning_goal,onboarding_completed")
      .eq("id", userId)
      .single();
    setProfile(data as KayengProfile | null);
  }, [supabase]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (data.user) await loadProfile(data.user.id);
      setLoading(false);
    }
    void load();
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) await loadProfile(nextUser.id);
      else setProfile(null);
      setLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, [loadProfile, supabase]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    profile,
    loading,
    supabase,
    refreshProfile: async () => {
      if (user) await loadProfile(user.id);
    },
  }), [loadProfile, loading, profile, supabase, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
