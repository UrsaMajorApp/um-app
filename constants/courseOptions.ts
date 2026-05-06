import type { FeatherIconName } from '$types/icons';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'active' | 'archived';

export const LEVEL_OPTIONS: { value: CourseLevel; label: string }[] = [
  { value: 'beginner', label: 'Начальный' },
  { value: 'intermediate', label: 'Средний' },
  { value: 'advanced', label: 'Продвинутый' },
];

export const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Начальный',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
};

export const STATUS_OPTIONS: { value: CourseStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'На модерации', color: '#F59E0B' },
  { value: 'active', label: 'Активный', color: '#10B981' },
  { value: 'archived', label: 'Архив', color: '#9CA3AF' },
];

export const ICON_OPTIONS: readonly FeatherIconName[] = [
  'book',
  'cpu',
  'code',
  'target',
  'music',
  'activity',
  'globe',
  'star',
  'pen-tool',
  'zap',
] as const;

export const SKILL_OPTIONS = [
  'Логика',
  'Креативность',
  'Команда',
  'Лидерство',
  'Крит. мышление',
  'Коммуникация',
  'Код',
  'Дизайн',
  'Математика',
  'Языки',
];
