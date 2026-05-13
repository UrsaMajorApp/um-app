import type { Diagnostic } from '$types/diagnostic';

export type DiagnosticChartScore = {
  label: string;
  value: number;
  color: string;
};

const BASIC_SCORE_MAX_BY_AGE_GROUP: Record<string, Record<string, number>> = {
  '6-8': {
    tech: 3,
    art: 3,
    nature: 3,
    sport: 3,
  },
  '9-11': {
    creativity: 6,
    logic: 6,
    empathy: 3.6,
    leadership: 4.8,
    communication: 2.4,
    adaptability: 2.4,
    analytics: 2.4,
    teamwork: 1.2,
  },
  '12-14': {
    R: 4,
    I: 4,
    A: 4,
    S: 4,
    E: 4,
    C: 4,
  },
  '15-17': {
    Autonomy: 3.6,
    Stability: 3.6,
    Mastery: 3.6,
    Management: 3.6,
    Entrepreneurship: 3.6,
    Service: 3.6,
    Challenge: 3.6,
    Lifestyle: 3.6,
  },
};

const TALENT_SCORE_LABELS: Record<string, string> = {
  logic: 'Логика',
  logical: 'Логика',
  creative: 'Креатив',
  social: 'Социум',
  physical: 'Физика',
  linguistic: 'Лингвистика',
  creativity: 'Креативность',
  empathy: 'Эмпатия',
  leadership: 'Лидерство',
  communication: 'Общение',
  adaptability: 'Адаптивность',
  analytics: 'Аналитика',
  teamwork: 'Командная работа',
  spatial: 'Пространственное мышление',
  math: 'Математика',
  caution: 'Внимательность',
  collab: 'Командная работа',
  growth: 'Рост и обучение',
  Autonomy: 'Самостоятельность',
  Stability: 'Стабильность',
  Mastery: 'Экспертность',
  Management: 'Управление',
  Entrepreneurship: 'Предпринимательство',
  Service: 'Помощь людям',
  Challenge: 'Сложные вызовы',
  Lifestyle: 'Баланс жизни',
  R: 'Практический',
  I: 'Исследовательский',
  A: 'Творческий',
  S: 'Социальный',
  E: 'Предприимчивый',
  C: 'Организованный',
  Logic: 'Логика',
  Spatial: 'Пространственное мышление',
  Stress: 'Стрессоустойчивость',
  Mediation: 'Умение договариваться',
  Leadership: 'Лидерство',
  Growth: 'Рост и обучение',
  Focus: 'Фокус и внимание',
  Collab: 'Командная работа',
  Empathy: 'Эмпатия',
  Caution: 'Внимательность',
  Ethics: 'Честность',
  Math_IT: 'Математика и IT',
  Science: 'Естественные науки',
  Verbal: 'Языки и тексты',
  ENT_MathPhys: 'Математика и физика',
  ENT_ChemBio: 'Химия и биология',
  ENT_Humanities: 'Гуманитарный профиль',
  ENT_Creative: 'Креативный профиль',
  IQ_Analytical: 'Аналитическое мышление',
  IQ_Verbal: 'Вербальное мышление',
  ONET_Attention: 'Внимание к деталям',
  ONET_Stress_Tolerance: 'Стрессоустойчивость',
  ONET_Analytical_Thinking: 'Аналитическое мышление',
  VIA_Teamwork: 'Командная работа',
  VIA_Honesty: 'Честность',
  VIA_Perseverance: 'Настойчивость',
  VIA_Leadership: 'Лидерство',
  tech: 'Технологии',
  art: 'Искусство',
  nature: 'Природа',
  sport: 'Спорт',
};

function normalizeScoreForChart(
  diagnostic: Diagnostic,
  key: string,
  value: number,
  maxScore: number,
) {
  const basicScoreMax =
    diagnostic.tier !== 'pro' && diagnostic.ageGroup
      ? BASIC_SCORE_MAX_BY_AGE_GROUP[diagnostic.ageGroup]?.[key]
      : undefined;

  const percentage =
    diagnostic.tier === 'pro' && maxScore > 0
      ? (value / maxScore) * 100
      : basicScoreMax
        ? (value / basicScoreMax) * 100
        : value;

  return Math.min(100, Math.max(0, Math.round(percentage)));
}

export function getDiagnosticChartScores(
  diagnostic: Diagnostic | null | undefined,
  colors: readonly string[],
  limit = 6,
): DiagnosticChartScore[] {
  const sortedScores = Object.entries(diagnostic?.scores || {})
    .filter(([, value]) => typeof value === 'number' && Number.isFinite(value) && value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  const maxScore = sortedScores[0]?.[1] || 0;

  if (!diagnostic || colors.length === 0) return [];

  return sortedScores.map(([key, value], index) => ({
    label: TALENT_SCORE_LABELS[key] || key,
    value: normalizeScoreForChart(diagnostic, key, value, maxScore),
    color: colors[index % colors.length],
  }));
}
