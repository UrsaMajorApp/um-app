import { useCallback, useEffect, useMemo, useState } from 'react';
import { type UserRole, useAuth } from '$contexts/AuthContext';
import { useDevDataVersion } from '$lib/devDataEvents';
import {
  fallbackPlansForRole,
  type SubscriptionPlan,
  type SubscriptionPlanRole,
} from '$lib/subscriptionCatalog';
import { isSupabaseConfigured, supabase } from '$lib/supabase';
import { resolveOwnedOrgId, rowsOrEmpty } from '$lib/supabaseHelpers';

export type { SubscriptionPlan, SubscriptionPlanRole };

function subscriptionRole(role: UserRole | null | undefined): SubscriptionPlanRole | null {
  if (role === 'child' || role === 'young-adult' || role === 'youth') return 'youth';
  if (role === 'parent' || role === 'org') return role;
  return null;
}

export function useSubscriptionPlans(role: UserRole | null | undefined) {
  const planRole = subscriptionRole(role);
  const devDataVersion = useDevDataVersion();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !planRole) {
      setPlans(fallbackPlansForRole(planRole));
      setLoading(false);
      return;
    }

    setLoading(true);
    const res = await supabase
      .from('subscription_plans')
      .select('id, role, title, price_kzt, billing_period, features, popular, display_order')
      .eq('role', planRole)
      .eq('active', true)
      .order('display_order', { ascending: true });
    const rows = rowsOrEmpty<SubscriptionPlan>(res);
    setPlans(rows.length > 0 ? rows : fallbackPlansForRole(planRole));
    setLoading(false);
  }, [planRole]);

  useEffect(() => {
    void devDataVersion;
    refresh();
  }, [refresh, devDataVersion]);

  return { plans, loading, refresh };
}

export interface WalletTransaction {
  id: string;
  transaction_at: string;
  description: string | null;
  student_name: string | null;
  amount_kzt: number;
  platform_commission_kzt: number;
  status: 'completed' | 'pending' | 'withdrawal' | 'failed';
  method: string | null;
}

export interface WalletSummary {
  availableBalance: number;
  totalRevenue: number;
  commission: number;
  periodRevenue: number;
  periodCount: number;
  periodLabel: string;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString('ru-RU', { month: 'long' });
}

export function useWalletData(ownerType: 'mentor' | 'org') {
  const { user } = useAuth();
  const devDataVersion = useDevDataVersion();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let query = supabase
      .from('wallet_transactions')
      .select(
        'id, transaction_at, description, student_name, amount_kzt, platform_commission_kzt, status, method',
      )
      .eq('owner_type', ownerType)
      .order('transaction_at', { ascending: false });

    if (ownerType === 'mentor') {
      query = query.eq('owner_user_id', user.id);
      setOrgId(null);
    } else {
      const resolvedOrgId = await resolveOwnedOrgId(user.id);
      setOrgId(resolvedOrgId);
      if (!resolvedOrgId) {
        setTransactions([]);
        setLoading(false);
        return;
      }
      query = query.eq('org_id', resolvedOrgId);
    }

    const res = await query;
    setTransactions(rowsOrEmpty<WalletTransaction>(res));
    setLoading(false);
  }, [ownerType, user?.id]);

  useEffect(() => {
    void devDataVersion;
    refresh();
  }, [refresh, devDataVersion]);

  const summary = useMemo<WalletSummary>(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const completed = transactions.filter(
      (tx) => tx.status === 'completed' || tx.status === 'withdrawal',
    );
    const positive = completed.filter((tx) => tx.amount_kzt > 0);
    const currentMonthPositive = positive.filter((tx) => {
      const txDate = new Date(tx.transaction_at);
      return txDate.getMonth() === month && txDate.getFullYear() === year;
    });

    return {
      availableBalance: completed.reduce((sum, tx) => sum + tx.amount_kzt, 0),
      totalRevenue: positive.reduce((sum, tx) => sum + tx.amount_kzt, 0),
      commission: completed.reduce((sum, tx) => sum + tx.platform_commission_kzt, 0),
      periodRevenue: currentMonthPositive.reduce((sum, tx) => sum + tx.amount_kzt, 0),
      periodCount: currentMonthPositive.length,
      periodLabel: monthLabel(now),
    };
  }, [transactions]);

  const requestWithdrawal = useCallback(
    async (params: {
      amountKzt: number;
      iban?: string;
      bankName?: string;
      recipientName?: string;
    }): Promise<{ error: string | null }> => {
      if (!supabase || !user?.id) return { error: 'Not configured' };
      const payload =
        ownerType === 'mentor'
          ? {
              owner_type: ownerType,
              owner_user_id: user.id,
              amount_kzt: params.amountKzt,
              iban: params.iban ?? null,
              bank_name: params.bankName ?? null,
              recipient_name: params.recipientName ?? null,
            }
          : {
              owner_type: ownerType,
              org_id: orgId,
              amount_kzt: params.amountKzt,
              iban: params.iban ?? null,
              bank_name: params.bankName ?? null,
              recipient_name: params.recipientName ?? null,
            };

      if (ownerType === 'org' && !orgId) return { error: 'Organisation not found' };
      const res = await supabase.from('withdrawal_requests').insert(payload);
      if (res.error) return { error: res.error.message };
      await refresh();
      return { error: null };
    },
    [ownerType, orgId, refresh, user?.id],
  );

  return { transactions, summary, loading, refresh, requestWithdrawal };
}

export interface TeacherGroup {
  id: string;
  name: string;
  course_title: string | null;
  schedule: string | null;
  capacity: number;
  active: boolean;
}

export interface TeacherGroupStudent {
  id: string;
  group_id: string;
  student_name: string;
  student_age: number | null;
  status_label: string | null;
}

export interface TeacherAttendanceEntry {
  id: string;
  group_id: string;
  student_id: string;
  class_date: string;
  status: 'present' | 'absent';
  comment: string | null;
}

type TeacherGroupStudentCountRow = {
  group_id: string;
};

export function useTeacherGroups() {
  const { user } = useAuth();
  const devDataVersion = useDevDataVersion();
  const [groups, setGroups] = useState<TeacherGroup[]>([]);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      setGroups([]);
      setStudentCounts({});
      setLoading(false);
      return;
    }

    setLoading(true);
    const groupRes = await supabase
      .from('teacher_groups')
      .select('id, name, course_title, schedule, capacity, active')
      .eq('teacher_user_id', user.id)
      .order('created_at', { ascending: true });
    const rows = rowsOrEmpty<TeacherGroup>(groupRes);
    const ids = rows.map((g) => g.id);

    const counts: Record<string, number> = {};
    if (ids.length) {
      const studentsRes = await supabase
        .from('teacher_group_students')
        .select('group_id')
        .in('group_id', ids);
      for (const student of rowsOrEmpty<TeacherGroupStudentCountRow>(studentsRes)) {
        counts[student.group_id] = (counts[student.group_id] ?? 0) + 1;
      }
    }

    setGroups(rows);
    setStudentCounts(counts);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    void devDataVersion;
    refresh();
  }, [refresh, devDataVersion]);

  return { groups, studentCounts, loading, refresh };
}

export function useTeacherGroup(groupId: string | undefined, classDate?: string) {
  const { user } = useAuth();
  const [group, setGroup] = useState<TeacherGroup | null>(null);
  const [students, setStudents] = useState<TeacherGroupStudent[]>([]);
  const [attendance, setAttendance] = useState<TeacherAttendanceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!supabase || !isSupabaseConfigured || !groupId) {
      setGroup(null);
      setStudents([]);
      setAttendance([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const [groupRes, studentsRes, attendanceRes] = await Promise.all([
      supabase
        .from('teacher_groups')
        .select('id, name, course_title, schedule, capacity, active')
        .eq('id', groupId)
        .maybeSingle(),
      supabase
        .from('teacher_group_students')
        .select('id, group_id, student_name, student_age, status_label')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true }),
      classDate
        ? supabase
            .from('teacher_attendance_entries')
            .select('id, group_id, student_id, class_date, status, comment')
            .eq('group_id', groupId)
            .eq('class_date', classDate)
        : Promise.resolve({ data: [], error: null }),
    ]);

    setGroup(groupRes.data ?? null);
    setStudents(rowsOrEmpty<TeacherGroupStudent>(studentsRes));
    setAttendance(rowsOrEmpty<TeacherAttendanceEntry>(attendanceRes));
    setLoading(false);
  }, [classDate, groupId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveAttendance = useCallback(
    async (
      entries: Array<{
        studentId: string;
        status: 'present' | 'absent';
        comment?: string | null;
      }>,
    ) => {
      if (!supabase || !user?.id || !groupId || !classDate || entries.length === 0) {
        return { error: 'Nothing to save' };
      }

      const payload = entries.map((entry) => ({
        group_id: groupId,
        student_id: entry.studentId,
        class_date: classDate,
        status: entry.status,
        comment: entry.comment ?? null,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      }));

      const res = await supabase
        .from('teacher_attendance_entries')
        .upsert(payload, { onConflict: 'group_id,student_id,class_date' });
      if (res.error) return { error: res.error.message };
      await refresh();
      return { error: null };
    },
    [classDate, groupId, refresh, user?.id],
  );

  return { group, students, attendance, loading, refresh, saveAttendance };
}

// ─── useOnboardingQuestions ───────────────────────────────────────────────────

export type OnboardingAudience = 'parent' | 'org' | 'child' | 'youth' | 'parent_diagnostic';

export interface OnboardingQuestion {
  id: string;
  question_text: string;
  answers: string[];
  display_order: number;
}

const QUESTION_FALLBACKS: Record<OnboardingAudience, OnboardingQuestion[]> = {
  parent: [
    {
      id: 'p1',
      display_order: 1,
      question_text: 'Сколько лет вашему ребёнку?',
      answers: ['6–8 лет', '9–11 лет', '12–14 лет', '15–17 лет'],
    },
    {
      id: 'p2',
      display_order: 2,
      question_text: 'Что ему интересно больше всего?',
      answers: ['Технологии', 'Творчество', 'Спорт', 'Точные науки'],
    },
    {
      id: 'p3',
      display_order: 3,
      question_text: 'Какой формат обучения вам подходит?',
      answers: ['Онлайн', 'Офлайн', 'Смешанный'],
    },
    {
      id: 'p4',
      display_order: 4,
      question_text: 'Какая цель обучения для вас важнее?',
      answers: ['Подготовка к экзаменам', 'Развитие мышления', 'Профориентация', 'Общее развитие'],
    },
    {
      id: 'p5',
      display_order: 5,
      question_text: 'Сколько времени в неделю ребёнок готов учиться дополнительно?',
      answers: ['1–2 раза', '3–4 раза', 'Каждый день'],
    },
  ],
  org: [
    {
      id: 'o1',
      display_order: 1,
      question_text: 'Какого типа у вас организация?',
      answers: ['Образовательный центр', 'Частная школа', 'Кружок/студия', 'Онлайн-платформа'],
    },
    {
      id: 'o2',
      display_order: 2,
      question_text: 'Основное направление занятий:',
      answers: ['IT и технологии', 'Творчество', 'Спорт', 'Точные науки'],
    },
    {
      id: 'o3',
      display_order: 3,
      question_text: 'С каким возрастом вы работаете?',
      answers: ['6–9 лет', '10–13 лет', '14–17 лет', 'Все возраста'],
    },
    {
      id: 'o4',
      display_order: 4,
      question_text: 'Какой формат занятий у вас основной?',
      answers: ['Офлайн', 'Онлайн', 'Смешанный'],
    },
    {
      id: 'o5',
      display_order: 5,
      question_text: 'Какая главная цель для вашей организации?',
      answers: [
        'Масштабирование',
        'Привлечение учеников',
        'Автоматизация процессов',
        'Повышение качества обучения',
      ],
    },
  ],
  child: [
    {
      id: 'c1',
      display_order: 1,
      question_text: 'Какая твоя любимая игра?',
      answers: ['Собери конструктор', 'Рисование', 'Догонялки', 'Головоломки'],
    },
    {
      id: 'c2',
      display_order: 2,
      question_text: 'Что тебе нравится делать в свободное время?',
      answers: ['Смотреть мультики', 'Гулять с друзьями', 'Читать сказки', 'Строить базы'],
    },
    {
      id: 'c3',
      display_order: 3,
      question_text: 'Представь, что у тебя есть суперсила. Какая она?',
      answers: ['Летать', 'Читать мысли', 'Создавать предметы', 'Становиться невидимым'],
    },
  ],
  youth: [
    {
      id: 'y1',
      display_order: 1,
      question_text: 'Что тебе сейчас интереснее всего изучать?',
      answers: ['Программирование', 'Дизайн', 'Бизнес/Управление', 'Наука/Исследования'],
    },
    {
      id: 'y2',
      display_order: 2,
      question_text: 'Как ты предпочитаешь работать над проектами?',
      answers: [
        'Полностью самостоятельно',
        'С наставником 1 на 1',
        'В небольшой команде',
        'В большой группе',
      ],
    },
    {
      id: 'y3',
      display_order: 3,
      question_text: 'Кем ты видишь себя через 5 лет?',
      answers: [
        'Специалистом (IT/Дизайн)',
        'Предпринимателем',
        'Лидером команды',
        'Свободным фрилансером',
      ],
    },
    {
      id: 'y4',
      display_order: 4,
      question_text: 'Где ты черпаешь вдохновение или информацию?',
      answers: ['YouTube/Курсы', 'Книги/Статьи', 'Общение с людьми', 'Практика методом ошибок'],
    },
  ],
  parent_diagnostic: [
    {
      id: 'pd1',
      display_order: 1,
      question_text: 'Что ребенку нравится делать больше всего в свободное время?',
      answers: [
        'Рисовать, лепить, создавать что-то руками.',
        'Играть в подвижные игры, бегать, танцевать.',
        'Собирать конструкторы по схемам, решать задачки.',
        'Общаться с друзьями, придумывать совместные игры.',
        'Слушать сказки, сочинять истории, много болтать.',
      ],
    },
    {
      id: 'pd2',
      display_order: 2,
      question_text: 'Как ребенок относится к новым правилам или сложным задачам?',
      answers: [
        'Часто находит нестандартное решение в обход правил.',
        'Любит соревновательный элемент, старается сделать физически быстрее.',
        'Пытается понять систему, почему правило именно такое.',
        'Просит помощи или договаривается с другими.',
        'Пытается обсудить или переубедить вас словами.',
      ],
    },
    {
      id: 'pd3',
      display_order: 3,
      question_text: 'Какая любимая игрушка или игра?',
      answers: [
        'Краски, пластилин, наборы для творчества.',
        'Мяч, велосипед, спортивный инвентарь.',
        'Головоломки, шашки, кубики с цифрами.',
        'Настольные игры для компании, ролевые игры.',
        'Книжки, аудиосказки, карточки со словами.',
      ],
    },
  ],
};

export function useOnboardingQuestions(audience: OnboardingAudience) {
  const devDataVersion = useDevDataVersion();
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void devDataVersion;
    if (!supabase || !isSupabaseConfigured) {
      setQuestions(QUESTION_FALLBACKS[audience]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('onboarding_questions')
      .select('id, question_text, answers, display_order')
      .eq('audience', audience)
      .eq('active', true)
      .order('display_order', { ascending: true })
      .then(({ data, error }) => {
        setQuestions(
          !error && data && data.length > 0
            ? (data as OnboardingQuestion[])
            : QUESTION_FALLBACKS[audience],
        );
        setLoading(false);
      });
  }, [audience, devDataVersion]);

  return { questions, loading };
}
