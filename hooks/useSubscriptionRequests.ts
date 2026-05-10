import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AuthUser } from '$contexts/AuthContext';
import { isSupabaseConfigured, supabase } from '$lib/supabase';
import { rowsOrEmpty } from '$lib/supabaseHelpers';
import type { SubscriptionPlan } from '$lib/subscriptionCatalog';
import type { Child } from '$types/child';

export type SubscriptionRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type SubscriptionRequest = {
  id: string;
  created_at: string;
  updated_at: string;
  student_id: string;
  student_name: string;
  parent_id: string | null;
  requested_plan_id: string | null;
  requested_plan_title: string;
  requested_plan_role: 'youth' | 'parent';
  price_kzt: number;
  billing_period: string;
  status: SubscriptionRequestStatus;
  approved_at: string | null;
  rejected_at: string | null;
  cancelled_at: string | null;
};

type RequestPlanResult = {
  ok: boolean;
  error?: string;
};

const LOCAL_SUBSCRIPTION_REQUESTS_KEY = 'um_dev_subscription_requests';

const SUBSCRIPTION_REQUEST_SELECT = `
  id,
  created_at,
  updated_at,
  student_id,
  student_name,
  parent_id,
  requested_plan_id,
  requested_plan_title,
  requested_plan_role,
  price_kzt,
  billing_period,
  status,
  approved_at,
  rejected_at,
  cancelled_at
`;

function sortNewestFirst(requests: SubscriptionRequest[]) {
  return [...requests].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

function uniqueById(requests: SubscriptionRequest[]) {
  return Array.from(new Map(requests.map((request) => [request.id, request])).values());
}

async function loadLocalRequests(): Promise<SubscriptionRequest[]> {
  const raw = await AsyncStorage.getItem(LOCAL_SUBSCRIPTION_REQUESTS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveLocalRequests(requests: SubscriptionRequest[]) {
  await AsyncStorage.setItem(LOCAL_SUBSCRIPTION_REQUESTS_KEY, JSON.stringify(requests));
}

function resolveParentId(activeChild: Child | undefined) {
  if (!activeChild?.parentId || activeChild.parentId === 'pending') return null;
  return activeChild.parentId;
}

function buildStudentName(user: AuthUser) {
  return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`;
}

function buildLocalRequest(params: {
  user: AuthUser;
  activeChild: Child | undefined;
  plan: SubscriptionPlan;
}): SubscriptionRequest {
  const now = new Date().toISOString();

  return {
    id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    created_at: now,
    updated_at: now,
    student_id: params.user.id,
    student_name: buildStudentName(params.user),
    parent_id: resolveParentId(params.activeChild),
    requested_plan_id: params.plan.id,
    requested_plan_title: params.plan.title,
    requested_plan_role: 'youth',
    price_kzt: params.plan.price_kzt,
    billing_period: params.plan.billing_period,
    status: 'pending',
    approved_at: null,
    rejected_at: null,
    cancelled_at: null,
  };
}

async function saveLocalRequest(request: SubscriptionRequest) {
  const existing = await loadLocalRequests();
  await saveLocalRequests(sortNewestFirst(uniqueById([request, ...existing])));
}

async function updateLocalRequestStatus(
  requestId: string,
  status: SubscriptionRequestStatus,
): Promise<boolean> {
  const existing = await loadLocalRequests();
  const now = new Date().toISOString();
  let changed = false;

  const updated = existing.map((request) => {
    if (request.id !== requestId) return request;
    changed = true;
    return {
      ...request,
      status,
      updated_at: now,
      approved_at: status === 'approved' ? now : request.approved_at,
      rejected_at: status === 'rejected' ? now : request.rejected_at,
      cancelled_at: status === 'cancelled' ? now : request.cancelled_at,
    };
  });

  if (changed) await saveLocalRequests(updated);
  return changed;
}

async function fetchYouthRemoteRequests(userId: string) {
  if (!supabase || !isSupabaseConfigured) return [];

  const res = await supabase
    .from('subscription_requests')
    .select(SUBSCRIPTION_REQUEST_SELECT)
    .eq('student_id', userId)
    .order('created_at', { ascending: false });

  if (res.error) {
    console.error('Error fetching youth subscription requests:', res.error.message);
  }

  return rowsOrEmpty<SubscriptionRequest>(res);
}

async function fetchParentRemoteRequests(userId: string) {
  if (!supabase || !isSupabaseConfigured) return [];

  const res = await supabase
    .from('subscription_requests')
    .select(SUBSCRIPTION_REQUEST_SELECT)
    .eq('parent_id', userId)
    .order('created_at', { ascending: false });

  if (res.error) {
    console.error('Error fetching parent subscription requests:', res.error.message);
  }

  return rowsOrEmpty<SubscriptionRequest>(res);
}

export async function updateSubscriptionRequestStatus(
  requestId: string | null | undefined,
  status: SubscriptionRequestStatus,
) {
  if (!requestId) return;

  const now = new Date().toISOString();
  const patch = {
    status,
    updated_at: now,
    approved_at: status === 'approved' ? now : null,
    rejected_at: status === 'rejected' ? now : null,
    cancelled_at: status === 'cancelled' ? now : null,
  };

  if (supabase && isSupabaseConfigured && !requestId.startsWith('local-')) {
    const { error } = await supabase
      .from('subscription_requests')
      .update(patch)
      .eq('id', requestId);
    if (error) {
      console.error('Error updating subscription request:', error.message);
    }
  }

  await updateLocalRequestStatus(requestId, status);
}

export function useYouthSubscriptionRequests(params: {
  user: AuthUser | null;
  activeChild: Child | undefined;
}) {
  const { user, activeChild } = params;
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setRequests([]);
      return;
    }

    setLoading(true);
    try {
      const [remoteRequests, localRequests] = await Promise.all([
        fetchYouthRemoteRequests(user.id),
        loadLocalRequests(),
      ]);
      const matchingLocal = localRequests.filter((request) => request.student_id === user.id);
      setRequests(sortNewestFirst(uniqueById([...remoteRequests, ...matchingLocal])));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const pendingPlanIds = useMemo(
    () =>
      requests
        .filter((request) => request.status === 'pending')
        .map((request) => request.requested_plan_id)
        .filter((planId): planId is string => Boolean(planId)),
    [requests],
  );

  const requestPlan = useCallback(
    async (plan: SubscriptionPlan): Promise<RequestPlanResult> => {
      if (!user?.id) return { ok: false, error: 'Не удалось определить пользователя.' };

      const localRequest = buildLocalRequest({ user, activeChild, plan });

      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('subscription_requests')
          .insert({
            student_id: localRequest.student_id,
            student_name: localRequest.student_name,
            parent_id: localRequest.parent_id,
            requested_plan_id: localRequest.requested_plan_id,
            requested_plan_title: localRequest.requested_plan_title,
            requested_plan_role: localRequest.requested_plan_role,
            price_kzt: localRequest.price_kzt,
            billing_period: localRequest.billing_period,
            status: 'pending',
            notification_sent: false,
          })
          .select(SUBSCRIPTION_REQUEST_SELECT)
          .single();

        if (!error && data) {
          setRequests((prev) =>
            sortNewestFirst(uniqueById([data as SubscriptionRequest, ...prev])),
          );
          return { ok: true };
        }

        if (!__DEV__) {
          return { ok: false, error: error?.message || 'Не удалось отправить запрос.' };
        }

        console.warn('Falling back to local subscription request:', error?.message);
      }

      await saveLocalRequest(localRequest);
      setRequests((prev) => sortNewestFirst(uniqueById([localRequest, ...prev])));
      return { ok: true };
    },
    [activeChild, user],
  );

  return {
    requests,
    loading,
    pendingPlanIds,
    requestPlan,
    refresh,
  };
}

export function useParentSubscriptionRequests(user: AuthUser | null) {
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setRequests([]);
      return;
    }

    setLoading(true);
    try {
      const [remoteRequests, localRequests] = await Promise.all([
        fetchParentRemoteRequests(user.id),
        loadLocalRequests(),
      ]);
      const matchingLocal = localRequests.filter(
        (request) => request.parent_id === user.id || request.parent_id === null,
      );
      setRequests(sortNewestFirst(uniqueById([...remoteRequests, ...matchingLocal])));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setRequestStatus = useCallback(
    async (requestId: string, status: SubscriptionRequestStatus) => {
      await updateSubscriptionRequestStatus(requestId, status);
      await refresh();
    },
    [refresh],
  );

  return {
    requests,
    loading,
    refresh,
    setRequestStatus,
  };
}
