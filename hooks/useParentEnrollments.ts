// useParentEnrollments: загружает записи ребенка на кружки для parent-профиля.
import { useCallback, useEffect, useState } from 'react';
import { useDevDataVersion } from '$lib/devDataEvents';
import { isUuid } from '$lib/idUtils';
import { isSupabaseConfigured, supabase } from '$lib/supabase';
import { rowsOrEmpty } from '$lib/supabaseHelpers';

export type ParentEnrollmentChild = {
  id: string;
  name?: string | null;
};

export type ParentEnrollment = {
  id: string;
  club: string | null;
  group_name: string | null;
  group_schedule: string | null;
  status: 'paid' | 'awaiting_payment' | 'activated' | 'completed' | 'rejected';
  created_at: string;
};

async function fetchParentEnrollments(userId: string, child: ParentEnrollmentChild) {
  if (!supabase) return [];

  let query = supabase
    .from('org_applications')
    .select('id, club, group_name, group_schedule, status, created_at')
    .eq('parent_user_id', userId)
    .neq('status', 'rejected')
    .order('created_at', { ascending: false });

  if (isUuid(child.id)) {
    query = query.eq('child_profile_id', child.id);
  } else if (child.name) {
    query = query.eq('child_name', child.name);
  }

  const res = await query;
  return rowsOrEmpty<ParentEnrollment>(res);
}

export function useParentEnrollments(
  userId: string | undefined,
  child: ParentEnrollmentChild | undefined,
) {
  const devDataVersion = useDevDataVersion();
  const childId = child?.id;
  const childName = child?.name;
  const [enrollments, setEnrollments] = useState<ParentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !userId || !childId) {
      setEnrollments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const rows = await fetchParentEnrollments(userId, { id: childId, name: childName });
    setEnrollments(rows);
    setLoading(false);
  }, [childId, childName, userId]);

  useEffect(() => {
    void devDataVersion;
    refresh();
  }, [refresh, devDataVersion]);

  return { enrollments, loading, refresh };
}
