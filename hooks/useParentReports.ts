import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

function ok<T = any>(res: { data: any; error: any }): T[] {
  if (res.error || !res.data) return [];
  return res.data as T[];
}

export interface ChildSkillSnapshot {
  skill_label: string;
  current_value: number;
  prev_value: number;
  color: string;
}

export interface ChildAttendanceMonth {
  month_label: string;
  attendance_pct: number;
  month_order: number;
}

export interface ChildReport {
  skills: ChildSkillSnapshot[];
  attendance: ChildAttendanceMonth[];
  totalClasses: number;
  avgAttendance: number;
}

export function useChildReports(childName: string | null) {
  const { user } = useAuth();
  const [report, setReport] = useState<ChildReport>({
    skills: [],
    attendance: [],
    totalClasses: 0,
    avgAttendance: 0,
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id || !childName) {
      setReport({
        skills: [],
        attendance: [],
        totalClasses: 0,
        avgAttendance: 0,
      });
      setLoading(false);
      return;
    }
    setLoading(true);

    const [skillsRes, attRes] = await Promise.all([
      supabase
        .from("child_skill_snapshots")
        .select("skill_label, current_value, prev_value, color")
        .eq("parent_user_id", user.id)
        .eq("child_name", childName),
      supabase
        .from("child_attendance_monthly")
        .select("month_label, attendance_pct, month_order")
        .eq("parent_user_id", user.id)
        .eq("child_name", childName)
        .order("month_order", { ascending: true }),
    ]);

    const skills = ok<ChildSkillSnapshot>(skillsRes);
    const attendance = ok<ChildAttendanceMonth>(attRes);
    const avgAttendance = attendance.length
      ? Math.round(
          attendance.reduce((s, a) => s + a.attendance_pct, 0) /
            attendance.length,
        )
      : 0;

    setReport({
      skills,
      attendance,
      totalClasses: attendance.length * 4, // rough estimate
      avgAttendance,
    });
    setLoading(false);
  }, [user?.id, childName]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { report, loading, refresh };
}
