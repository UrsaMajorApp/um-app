// usePublicMentors: загружает список публичных менторов для выбора родителем.
import { useCallback, useEffect, useState } from 'react';
import { useDevDataVersion } from '$lib/devDataEvents';
import { isSupabaseConfigured, supabase } from '$lib/supabase';
import { rowsOrEmpty } from '$lib/supabaseHelpers';

export interface PublicMentor {
  id: string;
  name: string;
  specialization: string | null;
  rating: number;
  sessions: number;
  photo_emoji: string;
  photo_url: string | null;
  bio: string | null;
  experience: string | null;
  education: string | null;
  status: string;
  created_at: string;
}

export function usePublicMentors() {
  const devDataVersion = useDevDataVersion();
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
      .from('public_mentors')
      .select(
        'id, name, specialization, rating, sessions, photo_emoji, photo_url, bio, experience, education, status, created_at',
      )
      .order('created_at', { ascending: false });
    setMentors(rowsOrEmpty<PublicMentor>(res));
    setLoading(false);
  }, []);

  useEffect(() => {
    void devDataVersion;
    refresh();
  }, [refresh, devDataVersion]);

  return { mentors, loading, refresh };
}
