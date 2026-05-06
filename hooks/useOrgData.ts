import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '$contexts/AuthContext';
import { useDevDataVersion } from '$lib/devDataEvents';
import { isSupabaseConfigured, supabase } from '$lib/supabase';
import { resolveOwnedOrgId, rowsOrEmpty } from '$lib/supabaseHelpers';

export interface OrgStaffMember {
  id: string;
  org_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  specialization: string | null;
  rating: number;
  status: 'active' | 'invited' | 'inactive';
  created_at: string;
}

export interface OrgCourse {
  id: string;
  org_id: string;
  title: string;
  description: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  icon: string;
  skills: string[];
  status: 'draft' | 'active' | 'archived';
  age_min: number | null;
  age_max: number | null;
  created_at: string;
  updated_at: string;
}

export interface OrgGroup {
  id: string;
  org_id: string;
  name: string;
  course: string | null;
  course_id: string | null;
  schedule: string | null;
  capacity: number;
  enrolled: number;
  active: boolean;
  created_at: string;
}

export interface OrgApplication {
  id: string;
  org_id: string;
  child_name: string;
  child_age: number | null;
  parent_name: string | null;
  club: string | null;
  applied_date: string | null;
  status: 'paid' | 'awaiting_payment' | 'activated' | 'completed' | 'rejected';
  created_at: string;
}

export interface OrgTask {
  id: string;
  org_id: string;
  title: string;
  club: string | null;
  due_date: string | null;
  total_students: number;
  completed_students: number;
  xp_reward: number;
  created_at: string;
}

// ─── useOrgStaff ──────────────────────────────────────────────
export function useOrgStaff() {
  const { user } = useAuth();
  const devDataVersion = useDevDataVersion();
  const [staff, setStaff] = useState<OrgStaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setStaff([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const orgId = await resolveOwnedOrgId(user.id);
    if (!orgId) {
      setStaff([]);
      setLoading(false);
      return;
    }
    const res = await supabase
      .from('org_staff')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: true });
    setStaff(rowsOrEmpty<OrgStaffMember>(res));
    setLoading(false);
  }, [user?.id, devDataVersion]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { staff, loading, refresh };
}

// ─── useOrgGroups ─────────────────────────────────────────────
export function useOrgGroups() {
  const { user } = useAuth();
  const devDataVersion = useDevDataVersion();
  const [groups, setGroups] = useState<OrgGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setGroups([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const orgId = await resolveOwnedOrgId(user.id);
    if (!orgId) {
      setGroups([]);
      setLoading(false);
      return;
    }
    const res = await supabase
      .from('org_groups')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: true });
    setGroups(rowsOrEmpty<OrgGroup>(res));
    setLoading(false);
  }, [user?.id, devDataVersion]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { groups, loading, refresh };
}

// ─── useOrgApplications ───────────────────────────────────────
export function useOrgApplications() {
  const { user } = useAuth();
  const devDataVersion = useDevDataVersion();
  const [apps, setApps] = useState<OrgApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setApps([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const orgId = await resolveOwnedOrgId(user.id);
    if (!orgId) {
      setApps([]);
      setLoading(false);
      return;
    }
    const res = await supabase
      .from('org_applications')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });
    setApps(rowsOrEmpty<OrgApplication>(res));
    setLoading(false);
  }, [user?.id, devDataVersion]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const approve = async (id: string) => {
    if (!supabase) return;
    await supabase.from('org_applications').update({ status: 'activated' }).eq('id', id);
    refresh();
  };

  const reject = async (id: string) => {
    if (!supabase) return;
    await supabase.from('org_applications').update({ status: 'rejected' }).eq('id', id);
    refresh();
  };

  return { apps, loading, refresh, approve, reject };
}

// ─── useOrgTasks ──────────────────────────────────────────────
export function useOrgTasks() {
  const { user } = useAuth();
  const devDataVersion = useDevDataVersion();
  const [tasks, setTasks] = useState<OrgTask[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const orgId = await resolveOwnedOrgId(user.id);
    if (!orgId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    const res = await supabase
      .from('org_tasks')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });
    setTasks(rowsOrEmpty<OrgTask>(res));
    setLoading(false);
  }, [user?.id, devDataVersion]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tasks, loading, refresh };
}

// ─── useOrgProfile ────────────────────────────────────────────
export type OrgStatus = 'new' | 'ready_for_review' | 'verified' | 'rejected' | 'pending';

export function useOrgProfile() {
  const { user } = useAuth();
  const devDataVersion = useDevDataVersion();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    id: string | null;
    name: string;
    status: string;
    bin: string;
    license_url: string | null;
    registration_url: string | null;
  }>({
    id: null,
    name: '',
    status: 'new',
    bin: '',
    license_url: null,
    registration_url: null,
  });

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('organizations')
      .select('id, name, status, bin, license_url, registration_url')
      .eq('owner_user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (data) {
      setProfile({
        id: data.id,
        name: data.name ?? '',
        status: data.status || 'new',
        bin: data.bin || '',
        license_url: data.license_url,
        registration_url: data.registration_url,
      });
    }
    setLoading(false);
  }, [user?.id, devDataVersion]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...profile, loading, refresh };
}

// ─── useOrgStats ──────────────────────────────────────────────
export interface OrgStats {
  groupCount: number;
  studentCount: number;
  pendingCount: number;
  staffCount: number;
}

type OrgStatsApplicationRow = {
  id: string;
  status: OrgApplication['status'];
};

export function useOrgStats() {
  const { user } = useAuth();
  const devDataVersion = useDevDataVersion();
  const [stats, setStats] = useState<OrgStats>({
    groupCount: 0,
    studentCount: 0,
    pendingCount: 0,
    staffCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const orgId = await resolveOwnedOrgId(user.id);
    if (!orgId) {
      setLoading(false);
      return;
    }
    const [groups, apps, staff] = await Promise.all([
      supabase
        .from('org_groups')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('active', true),
      supabase.from('org_applications').select('id, status').eq('org_id', orgId),
      supabase
        .from('org_staff')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'active'),
    ]);
    const allApps = rowsOrEmpty<OrgStatsApplicationRow>(apps);
    setStats({
      groupCount: groups.count ?? 0,
      studentCount: allApps.filter((a) => ['paid', 'activated'].includes(a.status)).length,
      pendingCount: allApps.filter((a) => a.status === 'awaiting_payment').length,
      staffCount: staff.count ?? 0,
    });
    setLoading(false);
  }, [user?.id, devDataVersion]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, loading, refresh };
}

// ─── useOrgGroupById ─────────────────────────────────────────
export function useOrgGroupById(id: string | undefined) {
  const devDataVersion = useDevDataVersion();
  const [group, setGroup] = useState<OrgGroup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured || !id) {
      setLoading(false);
      return;
    }
    supabase
      .from('org_groups')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then((res) => {
        setGroup(res.data ?? null);
        setLoading(false);
      });
  }, [id, devDataVersion]);

  return { group, loading };
}

// ─── useOrgStaffById ─────────────────────────────────────────
export function useOrgStaffById(id: string | undefined) {
  const devDataVersion = useDevDataVersion();
  const [member, setMember] = useState<OrgStaffMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured || !id) {
      setLoading(false);
      return;
    }
    supabase
      .from('org_staff')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then((res) => {
        setMember(res.data ?? null);
        setLoading(false);
      });
  }, [id, devDataVersion]);

  return { member, loading };
}

// ─── useOrgSchedule ───────────────────────────────────────────
export interface OrgScheduleItem {
  id: string;
  org_id: string;
  time_label: string;
  subject: string;
  group_name: string;
  teacher_name: string;
  room: string;
  color: string;
  day_of_week: number;
}

// ─── useOrgCourses ────────────────────────────────────────────
type CourseInput = {
  title: string;
  description?: string;
  level: string;
  price: number;
  icon: string;
  skills: string[];
  status: string;
};

export function useOrgCourses() {
  const { user } = useAuth();
  const devDataVersion = useDevDataVersion();
  const [courses, setCourses] = useState<OrgCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setCourses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const orgId = await resolveOwnedOrgId(user.id);
    if (!orgId) {
      setCourses([]);
      setLoading(false);
      return;
    }
    const res = await supabase
      .from('org_courses')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: true });
    setCourses(rowsOrEmpty<OrgCourse>(res));
    setLoading(false);
  }, [user?.id, devDataVersion]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createCourse = useCallback(
    async (data: CourseInput): Promise<{ data: OrgCourse | null; error: string | null }> => {
      if (!supabase || !isSupabaseConfigured || !user?.id)
        return { data: null, error: 'Not configured' };
      const orgId = await resolveOwnedOrgId(user.id);
      if (!orgId) return { data: null, error: 'Organisation not found' };
      const res = await supabase
        .from('org_courses')
        .insert({ ...data, org_id: orgId })
        .select()
        .single();
      if (res.error) return { data: null, error: res.error.message };
      refresh();
      return { data: res.data as OrgCourse, error: null };
    },
    [user?.id, refresh],
  );

  const updateCourse = useCallback(
    async (id: string, data: Partial<CourseInput>): Promise<{ error: string | null }> => {
      if (!supabase) return { error: 'Not configured' };
      const res = await supabase
        .from('org_courses')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (res.error) return { error: res.error.message };
      refresh();
      return { error: null };
    },
    [refresh],
  );

  const deleteCourse = useCallback(
    async (id: string): Promise<{ error: string | null }> => {
      if (!supabase) return { error: 'Not configured' };
      const res = await supabase.from('org_courses').delete().eq('id', id);
      if (res.error) return { error: res.error.message };
      refresh();
      return { error: null };
    },
    [refresh],
  );

  return {
    courses,
    loading,
    refresh,
    createCourse,
    updateCourse,
    deleteCourse,
  };
}

// ─── useOrgCourseById ─────────────────────────────────────────
export function useOrgCourseById(id: string | undefined) {
  const devDataVersion = useDevDataVersion();
  const [course, setCourse] = useState<OrgCourse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!supabase || !isSupabaseConfigured || !id) {
      setLoading(false);
      return;
    }
    supabase
      .from('org_courses')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then((res) => {
        setCourse(res.data ?? null);
        setLoading(false);
      });
  }, [id, devDataVersion]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { course, loading, refresh };
}

// ─── useOrgSchedule ───────────────────────────────────────────
export function useOrgSchedule(dayOfWeek?: number) {
  const { user } = useAuth();
  const devDataVersion = useDevDataVersion();
  const [items, setItems] = useState<OrgScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const orgId = await resolveOwnedOrgId(user.id);
    if (!orgId) {
      setItems([]);
      setLoading(false);
      return;
    }
    let q = supabase
      .from('org_schedule_items')
      .select('*')
      .eq('org_id', orgId)
      .order('time_label', { ascending: true });
    if (dayOfWeek !== undefined) q = q.eq('day_of_week', dayOfWeek);
    const res = await q;
    setItems(rowsOrEmpty<OrgScheduleItem>(res));
    setLoading(false);
  }, [user?.id, dayOfWeek, devDataVersion]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, refresh };
}
