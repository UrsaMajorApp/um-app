import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export interface MentorGroup {
  id: string;
  mentor_user_id: string | null;
  name: string;
  course: string;
  schedule: string | null;
  max_students: number;
  active: boolean;
  student_count: number;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  student_name: string;
  student_age: number | null;
  level: number;
  xp: number;
  progress: number;
  skills: { com: number; lead: number; cre: number; log: number; dis: number };
  enrolled_at: string;
}

export interface AttendanceRecord {
  id: string;
  name: string;
  present: boolean;
  date: string;
}

export interface StudentGoal {
  id: string;
  mentor_user_id: string | null;
  student_name: string;
  title: string;
  deadline_text: string | null;
  progress: number;
  color: string;
  created_at: string;
}

export interface LearningMaterial {
  id: string;
  mentor_user_id: string | null;
  title: string;
  material_type: string;
  icon_name: string;
  size_label: string;
  file_url: string | null;
  color: string;
  created_at: string;
}

export interface MentorFeedback {
  id: string;
  mentor_user_id: string | null;
  teacher_name: string | null;
  student_name: string | null;
  tag: string | null;
  text: string;
  created_at: string;
}

function ok<T = any>(res: { data: any; error: any }): T[] {
  if (res.error || !res.data) return [];
  return res.data as T[];
}

// ─── useMentorGroups ──────────────────────────────────────────
export function useMentorGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<MentorGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setGroups([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await supabase
      .from("mentor_groups")
      .select("*")
      .eq("mentor_user_id", user.id)
      .order("created_at", { ascending: true });
    const raw = ok<any>(res);

    // Fetch member counts for each group
    const ids = raw.map((g: any) => g.id);
    const countRes = ids.length
      ? await supabase
          .from("group_members")
          .select("group_id")
          .in("group_id", ids)
      : { data: [], error: null };
    const countMap = new Map<string, number>();
    for (const row of ok<any>(countRes)) {
      countMap.set(row.group_id, (countMap.get(row.group_id) ?? 0) + 1);
    }

    setGroups(
      raw.map((g: any) => ({
        ...g,
        student_count: countMap.get(g.id) ?? 0,
      })),
    );
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { groups, loading, refresh };
}

// ─── useGroupMembers ──────────────────────────────────────────
export function useGroupMembers(groupId: string | null) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !groupId) {
      setMembers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", groupId)
      .order("enrolled_at", { ascending: true });
    setMembers(ok<GroupMember>(res));
    setLoading(false);
  }, [groupId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { members, loading, refresh };
}

// ─── useMentorStudents ────────────────────────────────────────
export function useMentorStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setStudents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Fetch mentor's group IDs first
    const groupRes = await supabase
      .from("mentor_groups")
      .select("id")
      .eq("mentor_user_id", user.id);
    const groupIds = ok<any>(groupRes).map((g: any) => g.id);
    if (!groupIds.length) {
      setStudents([]);
      setLoading(false);
      return;
    }
    const memberRes = await supabase
      .from("group_members")
      .select("*")
      .in("group_id", groupIds)
      .order("enrolled_at", { ascending: true });
    setStudents(ok<GroupMember>(memberRes));
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { students, loading, refresh };
}

// ─── useMentorFeedback ────────────────────────────────────────
export function useMentorFeedback() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<MentorFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setFeedback([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await supabase
      .from("mentor_feedback")
      .select("*")
      .eq("mentor_user_id", user.id)
      .order("created_at", { ascending: false });
    setFeedback(ok<MentorFeedback>(res));
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { feedback, loading, refresh };
}

// ─── useStudentGoals ──────────────────────────────────────────
export function useStudentGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<StudentGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setGoals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await supabase
      .from("student_goals")
      .select("*")
      .eq("mentor_user_id", user.id)
      .order("created_at", { ascending: true });
    setGoals(ok<StudentGoal>(res));
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateProgress = async (id: string, progress: number) => {
    if (!supabase) return;
    await supabase.from("student_goals").update({ progress }).eq("id", id);
    refresh();
  };

  return { goals, loading, refresh, updateProgress };
}

// ─── useLearningMaterials ─────────────────────────────────────
export function useLearningMaterials() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setMaterials([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await supabase
      .from("learning_materials")
      .select("*")
      .eq("mentor_user_id", user.id)
      .order("created_at", { ascending: true });
    setMaterials(ok<LearningMaterial>(res));
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { materials, loading, refresh };
}

// ─── useMentorAttendance ──────────────────────────────────────
export function useMentorAttendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setRecords([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Fetch mentor groups
    const groupRes = await supabase
      .from("mentor_groups")
      .select("id")
      .eq("mentor_user_id", user.id);
    const groupIds = ok<any>(groupRes).map((g: any) => g.id);
    if (!groupIds.length) {
      setRecords([]);
      setLoading(false);
      return;
    }

    // Fetch sessions
    const sessionRes = await supabase
      .from("attendance_sessions")
      .select("id, session_date, group_id")
      .in("group_id", groupIds)
      .order("session_date", { ascending: false });
    const sessions = ok<any>(sessionRes);
    if (!sessions.length) {
      setRecords([]);
      setLoading(false);
      return;
    }

    const sessionIds = sessions.map((s: any) => s.id);
    const sessionMap = new Map<string, string>(
      sessions.map((s: any) => [s.id, s.session_date]),
    );

    // Fetch records + member names
    const recRes = await supabase
      .from("attendance_records")
      .select("id, session_id, member_id, present")
      .in("session_id", sessionIds);
    const recRows = ok<any>(recRes);

    const memberIds = [...new Set(recRows.map((r: any) => r.member_id))];
    const memberRes = memberIds.length
      ? await supabase
          .from("group_members")
          .select("id, student_name")
          .in("id", memberIds)
      : { data: [], error: null };
    const memberMap = new Map<string, string>(
      ok<any>(memberRes).map((m: any) => [m.id, m.student_name]),
    );

    const flat: AttendanceRecord[] = recRows.map((r: any) => ({
      id: r.id,
      name: memberMap.get(r.member_id) ?? "—",
      present: r.present,
      date: sessionMap.get(r.session_id)
        ? new Date(sessionMap.get(r.session_id)!).toLocaleDateString("ru", {
            day: "numeric",
            month: "short",
          }) + ", 15:00"
        : "—",
    }));

    setRecords(flat);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { records, loading, refresh };
}

export interface MentorStudentAttendanceSummary {
  total: number;
  missed: number;
  latestPresent: boolean | null;
}

export function useMentorStudentAttendanceSummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<
    Record<string, MentorStudentAttendanceSummary>
  >({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setSummary({});
      setLoading(false);
      return;
    }

    setLoading(true);
    const groupRes = await supabase
      .from("mentor_groups")
      .select("id")
      .eq("mentor_user_id", user.id);
    const groupIds = ok<any>(groupRes).map((g: any) => g.id);
    if (!groupIds.length) {
      setSummary({});
      setLoading(false);
      return;
    }

    const sessionRes = await supabase
      .from("attendance_sessions")
      .select("id, session_date")
      .in("group_id", groupIds)
      .order("session_date", { ascending: false });
    const sessions = ok<any>(sessionRes);
    const sessionIds = sessions.map((s: any) => s.id);
    if (!sessionIds.length) {
      setSummary({});
      setLoading(false);
      return;
    }

    const sessionOrder = new Map<string, number>();
    sessions.forEach((session: any, index: number) =>
      sessionOrder.set(session.id, index),
    );
    const recordsRes = await supabase
      .from("attendance_records")
      .select("member_id, session_id, present")
      .in("session_id", sessionIds);

    const next: Record<string, MentorStudentAttendanceSummary> = {};
    const records = ok<any>(recordsRes).sort(
      (a: any, b: any) =>
        (sessionOrder.get(a.session_id) ?? Number.MAX_SAFE_INTEGER) -
        (sessionOrder.get(b.session_id) ?? Number.MAX_SAFE_INTEGER),
    );
    for (const record of records) {
      const current = next[record.member_id] ?? {
        total: 0,
        missed: 0,
        latestPresent: null,
      };
      current.total += 1;
      if (!record.present) current.missed += 1;
      if (current.latestPresent === null) {
        current.latestPresent = record.present;
      }
      next[record.member_id] = current;
    }

    setSummary(next);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { summary, loading, refresh };
}

// ─── useLearningPath ──────────────────────────────────────────
export interface LearningPathStep {
  id: string;
  student_name: string;
  phase: string;
  phase_order: number;
  status: "active" | "completed";
  item_text: string;
  done: boolean;
}

export function useLearningPath(studentName?: string) {
  const { user } = useAuth();
  const [steps, setSteps] = useState<LearningPathStep[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setSteps([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let q = supabase
      .from("learning_path_steps")
      .select("*")
      .eq("mentor_user_id", user.id)
      .order("phase_order", { ascending: true });
    if (studentName) q = q.eq("student_name", studentName);
    const res = await q;
    setSteps(ok<LearningPathStep>(res));
    setLoading(false);
  }, [user?.id, studentName]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleStep = async (id: string) => {
    if (!supabase) return;
    const step = steps.find((s) => s.id === id);
    if (!step) return;
    await supabase
      .from("learning_path_steps")
      .update({ done: !step.done })
      .eq("id", id);
    refresh();
  };

  const addStep = async (
    phase: string,
    phaseOrder: number,
    itemText: string,
    sName?: string,
  ) => {
    if (!supabase || !user?.id) return;
    await supabase.from("learning_path_steps").insert({
      mentor_user_id: user.id,
      student_name: sName ?? studentName ?? "",
      phase,
      phase_order: phaseOrder,
      status: "active",
      item_text: itemText,
      done: false,
    });
    refresh();
  };

  return { steps, loading, refresh, toggleStep, addStep };
}

// ─── useMentorProfile ────────────────────────────────────────
export interface MentorProfileStats {
  studentCount: number;
  groupCount: number;
}

export function useMentorProfileStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<MentorProfileStats>({
    studentCount: 0,
    groupCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setStats({ studentCount: 0, groupCount: 0 });
      setLoading(false);
      return;
    }
    setLoading(true);
    const groupRes = await supabase
      .from("mentor_groups")
      .select("id")
      .eq("mentor_user_id", user.id);
    const groupIds = ok<any>(groupRes).map((g: any) => g.id);
    let studentCount = 0;
    if (groupIds.length) {
      const countRes = await supabase
        .from("group_members")
        .select("id", { count: "exact", head: true })
        .in("group_id", groupIds);
      studentCount = (countRes as any).count ?? 0;
    }
    setStats({ studentCount, groupCount: groupIds.length });
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, loading };
}

// ─── useMentorOwnProfile ─────────────────────────────────────
export interface MentorOwnProfile {
  specialization: string | null;
  bio: string | null;
  experience: string | null;
  education: string | null;
  photo_emoji: string | null;
  rating: number | null;
  sessions: number | null;
}

export function useMentorOwnProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MentorOwnProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await supabase
      .from("mentor_applications")
      .select(
        "specialization, bio, experience, education, photo_emoji, rating, sessions",
      )
      .eq("user_id", user.id)
      .maybeSingle();
    setProfile(res.data ?? null);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateProfile = useCallback(
    async (
      patch: Partial<MentorOwnProfile>,
    ): Promise<{ error: string | null }> => {
      if (!supabase || !user?.id) return { error: "Not configured" };
      const res = await supabase
        .from("mentor_applications")
        .update(patch)
        .eq("user_id", user.id);
      if (res.error) return { error: res.error.message };
      await refresh();
      return { error: null };
    },
    [refresh, user?.id],
  );

  return { profile, loading, refresh, updateProfile };
}

// ─── useMentorRequests ────────────────────────────────────────
export interface MentorRequest {
  id: string;
  request_type: "mentorship" | "session";
  parent_name: string | null;
  child_name: string | null;
  interest_text: string | null;
  status: "pending" | "accepted" | "rejected";
  slots: string[] | null;
  created_at: string;
}

export function useMentorRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MentorRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setRequests([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await supabase
      .from("mentorship_requests")
      .select("*")
      .eq("mentor_user_id", user.id)
      .order("created_at", { ascending: false });
    setRequests(ok<MentorRequest>(res));
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const respond = async (id: string, status: "accepted" | "rejected") => {
    if (!supabase) return;
    await supabase.from("mentorship_requests").update({ status }).eq("id", id);
    refresh();
  };

  return { requests, loading, refresh, respond };
}
