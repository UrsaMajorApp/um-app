import { useCallback, useEffect, useState } from 'react';
import { isUuid } from '$lib/idUtils';
import { isSupabaseConfigured, supabase } from '$lib/supabase';
import { rowsOrEmpty } from '$lib/supabaseHelpers';

export type ParentCalendarChild = {
  id: string;
  name?: string | null;
};

export type ParentCalendarEnrollment = {
  id: string;
  club: string | null;
  group_name: string | null;
  group_schedule: string | null;
};

async function fetchParentCalendarEnrollments(userId: string, activeChild: ParentCalendarChild) {
  if (!supabase) return [];

  let query = supabase
    .from('org_applications')
    .select('id, club, group_name, group_schedule')
    .eq('parent_user_id', userId)
    .in('status', ['activated', 'completed'])
    .order('created_at', { ascending: false });

  if (isUuid(activeChild.id)) {
    query = query.eq('child_profile_id', activeChild.id);
  }

  const res = await query;
  return rowsOrEmpty<ParentCalendarEnrollment>(res);
}

export function useParentCalendar(
  userId: string | undefined,
  activeChild: ParentCalendarChild | undefined,
) {
  const [enrollments, setEnrollments] = useState<ParentCalendarEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !userId || !activeChild?.name) {
      setEnrollments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const rows = await fetchParentCalendarEnrollments(userId, activeChild);
    setEnrollments(rows);
    setLoading(false);
  }, [activeChild?.id, activeChild?.name, userId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!supabase || !isSupabaseConfigured || !userId || !activeChild?.name) {
        setEnrollments([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const rows = await fetchParentCalendarEnrollments(userId, activeChild);
      if (cancelled) return;

      setEnrollments(rows);
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [activeChild?.id, activeChild?.name, userId]);

  return { enrollments, loading, refresh };
}
