"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
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

export function useAuth() {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<KayengProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (data.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id,display_name,avatar_url,role,cefr_level,occupation,daily_goal_minutes,preferred_accent,learning_goal,onboarding_completed")
          .eq("id", data.user.id)
          .single();
        setProfile(profileData as KayengProfile | null);
      }
      setLoading(false);
    }
    load();
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setProfile(null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return { user, profile, loading, supabase };
}
