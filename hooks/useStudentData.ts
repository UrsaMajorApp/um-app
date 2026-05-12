// useStudentData: собирает профиль, прогресс и задачи ученика для student screens.
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '$contexts/AuthContext';
import { useDevDataVersion } from '$lib/devDataEvents';
import { isSupabaseConfigured, supabase } from '$lib/supabase';
import { rowsOrEmpty } from '$lib/supabaseHelpers';

export interface StudentTask {
  id: string;
  student_user_id: string;
  title: string;
  club: string | null;
  xp_reward: number;
  done: boolean;
  created_at: string;
}

export function useStudentTasks() {
  const { user } = useAuth();
  const devDataVersion = useDevDataVersion();
  const [tasks, setTasks] = useState<StudentTask[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await supabase
      .from('student_tasks')
      .select('*')
      .eq('student_user_id', user.id)
      .order('created_at', { ascending: true });
    setTasks(rowsOrEmpty<StudentTask>(res));
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    void devDataVersion;
    refresh();
  }, [refresh, devDataVersion]);

  const toggleTask = async (id: string) => {
    if (!supabase) return;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    await supabase.from('student_tasks').update({ done: !task.done }).eq('id', id);
    refresh();
  };

  return { tasks, loading, refresh, toggleTask };
}

// ─── useYouthGoals ────────────────────────────────────────────
export interface YouthGoalStep {
  id: string;
  text: string;
  done: boolean;
  step_order: number;
}

export interface YouthGoal {
  id: string;
  title: string;
  progress: number;
  color: string;
  steps: YouthGoalStep[];
}

type YouthGoalRow = {
  id: string;
  title: string;
  progress: number;
  color: string;
};

type YouthGoalStepRow = YouthGoalStep & {
  goal_id: string;
};

export function useYouthGoals() {
  const { user } = useAuth();
  const devDataVersion = useDevDataVersion();
  const [goals, setGoals] = useState<YouthGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setGoals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const goalRes = await supabase
      .from('youth_goals')
      .select('*')
      .eq('student_user_id', user.id)
      .order('created_at', { ascending: true });
    const rawGoals = rowsOrEmpty<YouthGoalRow>(goalRes);
    const ids = rawGoals.map((g) => g.id);

    const stepsMap = new Map<string, YouthGoalStep[]>();
    if (ids.length) {
      const stepsRes = await supabase
        .from('youth_goal_steps')
        .select('*')
        .in('goal_id', ids)
        .order('step_order', { ascending: true });
      for (const s of rowsOrEmpty<YouthGoalStepRow>(stepsRes)) {
        const arr = stepsMap.get(s.goal_id) ?? [];
        arr.push({
          id: s.id,
          text: s.text,
          done: s.done,
          step_order: s.step_order,
        });
        stepsMap.set(s.goal_id, arr);
      }
    }

    setGoals(
      rawGoals.map((g) => ({
        id: g.id,
        title: g.title,
        progress: g.progress,
        color: g.color,
        steps: stepsMap.get(g.id) ?? [],
      })),
    );
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    void devDataVersion;
    refresh();
  }, [refresh, devDataVersion]);

  return { goals, loading, refresh };
}

// ─── useYouthAchievements ─────────────────────────────────────
export interface UserAchievement {
  id: string;
  name: string;
  icon_name: string;
  description: string | null;
  unlocked: boolean;
}

type AchievementCatalogRow = Omit<UserAchievement, 'unlocked'>;

type UserAchievementRow = {
  achievement_id: string;
};

export function useYouthAchievements() {
  const { user } = useAuth();
  const devDataVersion = useDevDataVersion();
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured) {
      setAchievements([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Load catalog
    const catalogRes = await supabase
      .from('achievements_catalog')
      .select('*')
      .order('name', { ascending: true });
    const catalog = rowsOrEmpty<AchievementCatalogRow>(catalogRes);

    // Load user's unlocked achievements
    const unlockedSet = new Set<string>();
    if (user?.id) {
      const userRes = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id)
        .eq('unlocked', true);
      for (const r of rowsOrEmpty<UserAchievementRow>(userRes)) {
        unlockedSet.add(r.achievement_id);
      }
    }

    setAchievements(
      catalog.map((a) => ({
        id: a.id,
        name: a.name,
        icon_name: a.icon_name,
        description: a.description,
        unlocked: unlockedSet.has(a.id),
      })),
    );
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    void devDataVersion;
    refresh();
  }, [refresh, devDataVersion]);

  return { achievements, loading, refresh };
}
