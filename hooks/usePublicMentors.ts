import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export interface PublicMentor {
  id: string;
  name: string;
  specialization: string | null;
  rating: number;
  sessions: number;
  photo_emoji: string;
  bio: string | null;
  experience: string | null;
  education: string | null;
  status: string;
  created_at: string;
}

function ok<T = any>(res: { data: any; error: any }): T[] {
  if (res.error || !res.data) return [];
  return res.data as T[];
}

export function usePublicMentors() {
  const [mentors, setMentors] = useState<PublicMentor[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      setMentors([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await supabase
      .from("mentor_applications")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    setMentors(ok<PublicMentor>(res));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { mentors, loading, refresh };
}
