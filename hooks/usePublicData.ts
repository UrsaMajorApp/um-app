/**
 * usePublicData — hooks for the parent/youth-facing course catalog.
 *
 * These queries hit org_courses joined with organizations without requiring
 * an authenticated session (public-read RLS policy on both tables).
 * Run COURSES_MIGRATION.sql first to enable those policies.
 */
import { useCallback, useEffect, useState } from 'react';
import { useDevDataVersion } from '$lib/devDataEvents';
import { isUuid } from '$lib/idUtils';
import { isSupabaseConfigured, supabase } from '$lib/supabase';
import { rowsOrEmpty } from '$lib/supabaseHelpers';
import type { OrgCourse, OrgGroup } from '$hooks/useOrgData';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PublicCourse extends OrgCourse {
  /** Organisation display name, resolved from the join */
  org_name: string;
}

type PublicCourseRow = OrgCourse & {
  organizations?: {
    name?: string | null;
  } | null;
};

// Gradient palette indexed by position so cards look varied but consistent
const GRADIENTS: [string, string][] = [
  ['#6C5CE7', '#8B7FE8'],
  ['#00B4DB', '#0083B0'],
  ['#11998e', '#38ef7d'],
  ['#f7971e', '#ffd200'],
  ['#f953c6', '#b91d73'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
];

export function courseGradient(index: number): [string, string] {
  return GRADIENTS[index % GRADIENTS.length];
}

// Maps talent-score dimensions → skills stored in org_courses.skills[]
export const SCORE_TO_SKILLS: Record<string, string[]> = {
  logical: ['Логика', 'Код', 'Математика', 'Крит. мышление'],
  creative: ['Креативность', 'Дизайн'],
  social: ['Команда', 'Коммуникация', 'Лидерство'],
  physical: ['Команда'],
  linguistic: ['Языки', 'Коммуникация'],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapRow(row: PublicCourseRow): PublicCourse {
  const { organizations, ...course } = row;
  return {
    ...course,
    org_name: organizations?.name ?? '',
  };
}

// ── usePublicCourses ──────────────────────────────────────────────────────────

export function usePublicCourses() {
  const devDataVersion = useDevDataVersion();
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      setCourses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await supabase
      .from('org_courses')
      .select('*, organizations(name)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (res.error || !res.data) {
      setCourses([]);
      setLoading(false);
      return;
    }
    setCourses((res.data as PublicCourseRow[]).map(mapRow));
    setLoading(false);
  }, []);

  useEffect(() => {
    void devDataVersion;
    refresh();
  }, [refresh, devDataVersion]);

  return { courses, loading, refresh };
}

// ── usePublicCourseById ───────────────────────────────────────────────────────

export function usePublicCourseById(id: string | undefined) {
  const devDataVersion = useDevDataVersion();
  const [course, setCourse] = useState<PublicCourse | null>(null);
  const [groups, setGroups] = useState<OrgGroup[]>([]);
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [trialSlots, setTrialSlots] = useState<TrialLessonSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void devDataVersion;
    if (!supabase || !isSupabaseConfigured || !id) {
      setLoading(false);
      return;
    }

    Promise.all([
      supabase.from('org_courses').select('*, organizations(name)').eq('id', id).maybeSingle(),
      supabase.from('org_groups').select('*').eq('course_id', id).eq('active', true),
      supabase
        .from('course_reviews')
        .select('id, course_id, author_display_name, rating, body, created_at')
        .eq('course_id', id)
        .eq('status', 'published')
        .order('created_at', { ascending: false }),
      supabase
        .from('trial_lesson_slots')
        .select('id, course_id, day_label, time_label, display_order')
        .eq('course_id', id)
        .eq('active', true)
        .order('display_order', { ascending: true }),
    ]).then(([courseRes, groupsRes, reviewsRes, slotsRes]) => {
      setCourse(courseRes.data ? mapRow(courseRes.data) : null);
      setGroups(rowsOrEmpty<OrgGroup>(groupsRes));
      setReviews(rowsOrEmpty<CourseReview>(reviewsRes));
      setTrialSlots(rowsOrEmpty<TrialLessonSlot>(slotsRes));
      setLoading(false);
    });
  }, [id, devDataVersion]);

  return { course, groups, reviews, trialSlots, loading };
}

export interface CourseReview {
  id: string;
  course_id: string;
  author_display_name: string | null;
  rating: number;
  body: string;
  created_at: string;
}

export interface TrialLessonSlot {
  id: string;
  course_id: string;
  day_label: string;
  time_label: string;
  display_order: number;
}

// ── applyToCourse ─────────────────────────────────────────────────────────────

export async function applyToCourse(params: {
  orgId: string;
  courseTitle: string;
  childProfileId?: string;
  childName: string;
  childAge?: number | null;
  parentUserId?: string;
  parentName?: string;
  groupId?: string | null;
  groupName?: string | null;
  groupSchedule?: string | null;
}): Promise<{ error: string | null }> {
  if (!supabase || !isSupabaseConfigured) return { error: 'Not configured' };
  const childProfileId = isUuid(params.childProfileId) ? params.childProfileId : null;
  const res = await supabase.from('org_applications').insert({
    org_id: params.orgId,
    parent_user_id: params.parentUserId ?? null,
    child_profile_id: childProfileId,
    group_id: params.groupId ?? null,
    group_name: params.groupName ?? null,
    group_schedule: params.groupSchedule ?? null,
    club: params.courseTitle,
    child_name: params.childName,
    child_age: params.childAge ?? null,
    parent_name: params.parentName ?? null,
    applied_date: new Date().toISOString().split('T')[0],
    status: 'awaiting_payment',
  });
  return { error: res.error?.message ?? null };
}

// ── checkEnrollment ───────────────────────────────────────────────────────────

export async function checkEnrollment(params: {
  childProfileId?: string;
  childName: string;
  courseTitle: string;
  parentUserId?: string;
}): Promise<{ enrolled: boolean }> {
  if (!supabase || !isSupabaseConfigured) return { enrolled: false };

  let query = supabase
    .from('org_applications')
    .select('id')
    .eq('child_name', params.childName)
    .eq('club', params.courseTitle)
    .neq('status', 'rejected')
    .limit(1);

  if (isUuid(params.childProfileId)) {
    query = query.eq('child_profile_id', params.childProfileId);
  }

  if (params.parentUserId) {
    query = query.eq('parent_user_id', params.parentUserId);
  }

  const res = await query;

  return { enrolled: (res.data?.length ?? 0) > 0 };
}

// ── applyToTrialLesson ────────────────────────────────────────────────────────

export async function applyToTrialLesson(params: {
  childId?: string;
  childName: string;
  childAge?: number | null;
  parentId?: string;
  parentName?: string;
  orgId: string;
  courseId: string;
  courseTitle: string;
  requestedSlots: Array<{ day: string; time: string }>;
  selectedSlot: { day: string; time: string };
}): Promise<{ error: string | null }> {
  if (!supabase || !isSupabaseConfigured) return { error: 'Not configured' };
  const childId = isUuid(params.childId) ? params.childId : null;

  const res = await supabase.from('trial_lesson_requests').insert({
    child_id: childId,
    child_name: params.childName,
    child_age: params.childAge ?? null,
    parent_id: params.parentId ?? null,
    parent_name: params.parentName ?? null,
    org_id: params.orgId,
    course_id: params.courseId,
    course_title: params.courseTitle,
    requested_slots: params.requestedSlots,
    confirmed_slot: params.selectedSlot,
    status: 'pending',
  });

  return { error: res.error?.message ?? null };
}
