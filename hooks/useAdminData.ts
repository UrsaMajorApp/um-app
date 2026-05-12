// useAdminData: загружает families, mentor applications, organizations, payments, tickets и AI rules для админки.
import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '$lib/supabase';
import { rowsOrEmpty } from '$lib/supabaseHelpers';

export interface AdminFamily {
  id: string;
  parentName: string;
  children: number;
  plan: 'Basic' | 'Pro';
  status: 'Active' | 'Inactive';
}

export interface MentorApp {
  id: string;
  user_id: string | null;
  name: string;
  specialization: string | null;
  email: string | null;
  phone: string | null;
  experience: string | null;
  education: string | null;
  bio: string | null;
  photo_emoji: string;
  status: 'pending' | 'approved' | 'rejected';
  rating: number;
  sessions: number;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  category: string | null;
  status: 'new' | 'pending' | 'ready_for_review' | 'verified' | 'rejected';
  rating: number;
  active_students: number;
  commission_pct: number;
  owner_user_id: string | null;
}

export interface Transaction {
  id: string;
  external_ref: string | null;
  parent_name: string;
  org_name: string;
  amount: number;
  org_amount: number;
  platform_amount: number;
  status: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  kind: 'complaint' | 'feedback';
  reporter_name: string;
  target: string | null;
  body: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface AIRule {
  id: string;
  name: string;
  condition: string;
  recommendation_title: string;
  recommendation_body: string | null;
  enabled: boolean;
}

export interface AdminStats {
  pendingMentors: number;
  totalMentors: number;
  activeSessions: number;
  revenue: number;
  gmv: number;
  proSubscribers: number;
  totalSubscribers: number;
}

type AdminParentRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

type ParentTariffRow = {
  user_id: string;
  tariff: string | null;
};

type ChildParentRow = {
  parent_user_id: string;
};

type UserNameRow = AdminParentRow;

type OrgNameRow = {
  id: string;
  name: string;
};

type TransactionRow = {
  id: string;
  external_ref: string | null;
  parent_user_id: string | null;
  org_id: string | null;
  amount: number | string;
  org_amount: number | string;
  platform_amount: number | string;
  status: string;
  created_at: string;
};

type TicketRow = {
  id: string;
  kind: Ticket['kind'];
  reporter_user_id: string | null;
  target: string | null;
  body: string;
  status: Ticket['status'];
  created_at: string;
};

export function useFamilies() {
  const [data, setData] = useState<AdminFamily[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    // Данные семьи собираются из нескольких таблиц: профиль родителя,
    // тариф и количество детей. Promise.all ускоряет загрузку админки.
    const [parents, tariffs, children] = await Promise.all([
      supabase.from('um_user_profiles').select('id, first_name, last_name').eq('role', 'parent'),
      supabase.from('parent_profiles').select('user_id, tariff'),
      supabase.from('child_profiles').select('parent_user_id'),
    ]);
    const tariffMap = new Map<string, string>(
      rowsOrEmpty<ParentTariffRow>(tariffs).map((t) => [t.user_id, t.tariff ?? 'basic']),
    );
    const childCount = new Map<string, number>();
    for (const c of rowsOrEmpty<ChildParentRow>(children)) {
      childCount.set(c.parent_user_id, (childCount.get(c.parent_user_id) ?? 0) + 1);
    }
    setData(
      rowsOrEmpty<AdminParentRow>(parents).map((p) => ({
        id: p.id,
        parentName: `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—',
        children: childCount.get(p.id) ?? 0,
        plan: tariffMap.get(p.id) === 'pro' ? 'Pro' : 'Basic',
        status: 'Active' as const,
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);
  return { data, loading, refresh };
}

export function useMentorApps() {
  const [data, setData] = useState<MentorApp[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await supabase
      .from('mentor_applications')
      .select('*')
      .order('created_at', { ascending: false });
    setData(rowsOrEmpty<MentorApp>(res));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const approve = async (id: string) => {
    if (!supabase) return;
    // Одобрение ментора меняет статус заявки; UI обновляется через refresh().
    await supabase
      .from('mentor_applications')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', id);
    refresh();
  };
  const reject = async (id: string, reason?: string) => {
    if (!supabase) return;
    await supabase
      .from('mentor_applications')
      .update({
        status: 'rejected',
        rejection_reason: reason ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);
    refresh();
  };

  return { data, loading, refresh, approve, reject };
}

export function useOrganizations() {
  const [data, setData] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await supabase
      .from('organizations')
      .select('*, owner_user_id')
      .order('created_at', { ascending: false });
    setData(rowsOrEmpty<Organization>(res));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const verify = async (id: string) => {
    if (!supabase) return;
    // Верификация организации открывает ей доступ к рабочим сценариям кабинета.
    await supabase.from('organizations').update({ status: 'verified' }).eq('id', id);
    refresh();
  };
  const reject = async (id: string) => {
    if (!supabase) return;
    await supabase.from('organizations').update({ status: 'rejected' }).eq('id', id);
    refresh();
  };
  const setCommission = async (id: string, pct: number) => {
    if (!supabase) return;
    await supabase.from('organizations').update({ commission_pct: pct }).eq('id', id);
    refresh();
  };

  return { data, loading, refresh, verify, reject, setCommission };
}

export function useTransactions() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [txRes, parentsRes, orgsRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase.from('um_user_profiles').select('id, first_name, last_name'),
      supabase.from('organizations').select('id, name'),
    ]);
    const parentMap = new Map<string, string>(
      rowsOrEmpty<UserNameRow>(parentsRes).map((p) => [
        p.id,
        `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || '—',
      ]),
    );
    const orgMap = new Map<string, string>(
      rowsOrEmpty<OrgNameRow>(orgsRes).map((o) => [o.id, o.name]),
    );
    setData(
      rowsOrEmpty<TransactionRow>(txRes).map((t) => ({
        id: t.id,
        external_ref: t.external_ref,
        parent_name: parentMap.get(t.parent_user_id ?? '') ?? '—',
        org_name: orgMap.get(t.org_id ?? '') ?? '—',
        amount: Number(t.amount),
        org_amount: Number(t.org_amount),
        platform_amount: Number(t.platform_amount),
        status: t.status,
        created_at: t.created_at,
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);
  return { data, loading, refresh };
}

export function useTickets() {
  const [data, setData] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [ticketRes, usersRes] = await Promise.all([
      supabase.from('tickets').select('*').order('created_at', { ascending: false }),
      supabase.from('um_user_profiles').select('id, first_name, last_name'),
    ]);
    const userMap = new Map<string, string>(
      rowsOrEmpty<UserNameRow>(usersRes).map((u) => [
        u.id,
        `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || '—',
      ]),
    );
    setData(
      rowsOrEmpty<TicketRow>(ticketRes).map((t) => ({
        id: t.id,
        kind: t.kind,
        reporter_name: userMap.get(t.reporter_user_id ?? '') ?? 'Аноним',
        target: t.target,
        body: t.body,
        status: t.status,
        created_at: t.created_at,
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const takeInProgress = async (id: string) => {
    if (!supabase) return;
    await supabase.from('tickets').update({ status: 'in_progress' }).eq('id', id);
    refresh();
  };
  const resolve = async (id: string) => {
    if (!supabase) return;
    await supabase
      .from('tickets')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', id);
    refresh();
  };

  return { data, loading, refresh, takeInProgress, resolve };
}

export function useTags() {
  const [data, setData] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await supabase.from('tags').select('*').order('name');
    setData(rowsOrEmpty<Tag>(res));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = async (name: string) => {
    if (!supabase) return;
    const cleaned = name.trim();
    if (!cleaned) return;
    await supabase.from('tags').insert({ name: cleaned.startsWith('#') ? cleaned : `#${cleaned}` });
    refresh();
  };
  const remove = async (id: string) => {
    if (!supabase) return;
    await supabase.from('tags').delete().eq('id', id);
    refresh();
  };

  return { data, loading, refresh, add, remove };
}

export function useAIRules() {
  const [data, setData] = useState<AIRule[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await supabase.from('ai_rules').select('*').order('created_at');
    setData(rowsOrEmpty<AIRule>(res));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = async (id: string, enabled: boolean) => {
    if (!supabase) return;
    await supabase.from('ai_rules').update({ enabled }).eq('id', id);
    refresh();
  };

  const updateRule = async (
    id: string,
    patch: Partial<
      Pick<AIRule, 'name' | 'condition' | 'recommendation_title' | 'recommendation_body'>
    >,
  ) => {
    if (!supabase) return;
    await supabase.from('ai_rules').update(patch).eq('id', id);
    refresh();
  };

  return { data, loading, refresh, toggle, updateRule };
}

export interface AdminEnrollment {
  id: string;
  org_id: string;
  org_name: string;
  child_name: string;
  child_age: number | null;
  parent_name: string | null;
  club: string | null;
  applied_date: string | null;
  status: 'paid' | 'awaiting_payment' | 'activated' | 'completed' | 'rejected';
  created_at: string;
}

type AdminEnrollmentRow = Omit<AdminEnrollment, 'org_name'>;

export function useAdminEnrollments() {
  const [data, setData] = useState<AdminEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [appRes, orgsRes] = await Promise.all([
      supabase
        .from('org_applications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200),
      supabase.from('organizations').select('id, name'),
    ]);
    const orgMap = new Map<string, string>(
      rowsOrEmpty<OrgNameRow>(orgsRes).map((o) => [o.id, o.name]),
    );
    setData(
      rowsOrEmpty<AdminEnrollmentRow>(appRes).map((a) => ({
        id: a.id,
        org_id: a.org_id,
        org_name: orgMap.get(a.org_id) ?? '—',
        child_name: a.child_name,
        child_age: a.child_age ?? null,
        parent_name: a.parent_name ?? null,
        club: a.club ?? null,
        applied_date: a.applied_date ?? null,
        status: a.status,
        created_at: a.created_at,
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markPaid = async (id: string) => {
    if (!supabase) return;
    await supabase.from('org_applications').update({ status: 'paid' }).eq('id', id);
    refresh();
  };
  const activate = async (id: string) => {
    if (!supabase) return;
    await supabase.from('org_applications').update({ status: 'activated' }).eq('id', id);
    refresh();
  };
  const reject = async (id: string) => {
    if (!supabase) return;
    await supabase.from('org_applications').update({ status: 'rejected' }).eq('id', id);
    refresh();
  };

  return { data, loading, refresh, markPaid, activate, reject };
}

export type OnboardingAudience = 'parent' | 'org' | 'child' | 'youth' | 'parent_diagnostic';

export interface AdminOnboardingQuestion {
  id: string;
  audience: OnboardingAudience;
  display_order: number;
  question_text: string;
  answers: string[];
  active: boolean;
}

export function useAdminOnboardingQuestions() {
  const [data, setData] = useState<AdminOnboardingQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: rows } = await supabase
      .from('onboarding_questions')
      .select('id, audience, display_order, question_text, answers, active')
      .order('audience')
      .order('display_order');
    setData((rows ?? []) as AdminOnboardingQuestion[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const remove = async (id: string) => {
    if (!supabase) return;
    await supabase.from('onboarding_questions').delete().eq('id', id);
    refresh();
  };

  const toggleActive = async (id: string, active: boolean) => {
    if (!supabase) return;
    await supabase.from('onboarding_questions').update({ active }).eq('id', id);
    refresh();
  };

  return { data, loading, refresh, remove, toggleActive };
}

export interface AdminCourse {
  id: string;
  org_id: string;
  org_name: string;
  title: string;
  description: string | null;
  level: string;
  price: number;
  skills: string[];
  status: 'draft' | 'active' | 'archived';
  age_min: number | null;
  age_max: number | null;
  created_at: string;
}

type AdminCourseRow = Omit<AdminCourse, 'org_name' | 'level' | 'price' | 'skills' | 'status'> & {
  level: string | null;
  price: number | string | null;
  skills: unknown;
  status: AdminCourse['status'] | null;
};

export interface AdminUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  phone: string | null;
  updated_at: string;
}

export function useAdminCourses() {
  const [data, setData] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [coursesRes, orgsRes] = await Promise.all([
      supabase.from('org_courses').select('*').order('created_at', { ascending: false }),
      supabase.from('organizations').select('id, name'),
    ]);
    const orgMap = new Map<string, string>(
      rowsOrEmpty<OrgNameRow>(orgsRes).map((o) => [o.id, o.name]),
    );
    setData(
      rowsOrEmpty<AdminCourseRow>(coursesRes).map((c) => ({
        id: c.id,
        org_id: c.org_id,
        org_name: orgMap.get(c.org_id) ?? '—',
        title: c.title,
        description: c.description ?? null,
        level: c.level ?? 'beginner',
        price: Number(c.price ?? 0),
        skills: Array.isArray(c.skills)
          ? c.skills.filter((skill): skill is string => typeof skill === 'string')
          : [],
        status: c.status ?? 'draft',
        age_min: c.age_min ?? null,
        age_max: c.age_max ?? null,
        created_at: c.created_at,
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const approveCourse = async (id: string) => {
    if (!supabase) return;
    await supabase.from('org_courses').update({ status: 'active' }).eq('id', id);
    refresh();
  };
  const rejectCourse = async (id: string, reason?: string) => {
    if (!supabase) return;
    await supabase
      .from('org_courses')
      .update({ status: 'archived', rejection_reason: reason ?? null })
      .eq('id', id);
    refresh();
  };

  return { data, loading, refresh, approveCourse, rejectCourse };
}

export function useAllUsers() {
  const [data, setData] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await supabase
      .from('um_user_profiles')
      .select('id, first_name, last_name, role, phone, updated_at')
      .order('updated_at', { ascending: false });
    setData(rowsOrEmpty<AdminUser>(res));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);
  return { data, loading, refresh };
}

export function useAdminStats(
  mentorApps: MentorApp[],
  transactions: Transaction[],
  families: AdminFamily[],
): AdminStats {
  const pendingMentors = mentorApps.filter((m) => m.status === 'pending').length;
  const totalMentors = mentorApps.filter((m) => m.status === 'approved').length;
  const activeSessions = mentorApps.reduce((sum, m) => sum + (m.sessions ?? 0), 0);
  const completedTx = transactions.filter((t) => t.status === 'completed');
  const gmv = completedTx.reduce((sum, t) => sum + t.amount, 0);
  const revenue = completedTx.reduce((sum, t) => sum + t.platform_amount, 0);
  const proSubscribers = families.filter((f) => f.plan === 'Pro').length;
  return {
    pendingMentors,
    totalMentors,
    activeSessions,
    revenue,
    gmv,
    proSubscribers,
    totalSubscribers: families.length,
  };
}
