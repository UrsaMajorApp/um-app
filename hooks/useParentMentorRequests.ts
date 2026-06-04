// useParentMentorRequests: создает и читает заявки родителя на сопровождение у ментора.
import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '$lib/supabase';
import { rowsOrEmpty } from '$lib/supabaseHelpers';

export type ParentMentorRequestStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

export type ParentMentorRequestChild = {
  id: string;
  name?: string | null;
};

export type ParentMentorRequest = {
  id: string;
  parent_user_id: string;
  child_profile_id: string | null;
  child_name: string;
  mentor_application_id: string;
  status: ParentMentorRequestStatus;
  preferred_slots: string[];
  message: string | null;
  created_at: string;
  updated_at: string;
};

type RequestMentorParams = {
  userId: string;
  child: ParentMentorRequestChild;
  mentorApplicationId: string;
  preferredSlots?: string[];
  message?: string;
};

const ACTIVE_STATUSES: ParentMentorRequestStatus[] = ['pending', 'confirmed'];

function formatSupabaseError(error: { message?: string } | null) {
  return error?.message || 'Supabase request failed.';
}

async function fetchParentMentorRequests(userId: string, child: ParentMentorRequestChild) {
  if (!supabase) return [];

  let query = supabase
    .from('parent_mentor_requests')
    .select(
      'id, parent_user_id, child_profile_id, child_name, mentor_application_id, status, preferred_slots, message, created_at, updated_at',
    )
    .eq('parent_user_id', userId)
    .in('status', ACTIVE_STATUSES)
    .order('created_at', { ascending: false });

  if (child.id) {
    query = query.eq('child_profile_id', child.id);
  } else if (child.name) {
    query = query.eq('child_name', child.name);
  }

  const res = await query;
  return rowsOrEmpty<ParentMentorRequest>(res);
}

export async function requestParentMentor(params: RequestMentorParams) {
  if (!supabase || !isSupabaseConfigured) return { request: null, error: 'Supabase not configured' };

  const childProfileId = params.child.id?.trim() || null;
  const childName = params.child.name?.trim() || 'Ребенок';

  let existingQuery = supabase
    .from('parent_mentor_requests')
    .select(
      'id, parent_user_id, child_profile_id, child_name, mentor_application_id, status, preferred_slots, message, created_at, updated_at',
    )
    .eq('parent_user_id', params.userId)
    .eq('mentor_application_id', params.mentorApplicationId)
    .in('status', ACTIVE_STATUSES)
    .limit(1);

  existingQuery = childProfileId
    ? existingQuery.eq('child_profile_id', childProfileId)
    : existingQuery.eq('child_name', childName);

  const existing = await existingQuery.maybeSingle();
  if (existing.error) return { request: null, error: formatSupabaseError(existing.error) };
  if (existing.data) return { request: existing.data as ParentMentorRequest, error: null };

  const { data, error } = await supabase
    .from('parent_mentor_requests')
    .insert({
      parent_user_id: params.userId,
      child_profile_id: childProfileId,
      child_name: childName,
      mentor_application_id: params.mentorApplicationId,
      preferred_slots: params.preferredSlots ?? ['Будни после 18:00', 'Суббота до 13:00'],
      message:
        params.message ??
        `Хотим записаться на вводную встречу с ментором для ${childName}.`,
    })
    .select(
      'id, parent_user_id, child_profile_id, child_name, mentor_application_id, status, preferred_slots, message, created_at, updated_at',
    )
    .single();

  return {
    request: data as ParentMentorRequest | null,
    error: error ? formatSupabaseError(error) : null,
  };
}

export function useParentMentorRequests(
  userId: string | undefined,
  child: ParentMentorRequestChild | undefined,
) {
  const childId = child?.id;
  const childName = child?.name;
  const [requests, setRequests] = useState<ParentMentorRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !userId || !childId) {
      setRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const rows = await fetchParentMentorRequests(userId, { id: childId, name: childName });
    setRequests(rows);
    setLoading(false);
  }, [childId, childName, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { requests, loading, refresh };
}
