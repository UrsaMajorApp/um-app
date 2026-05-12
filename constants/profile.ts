// Profile constants: варианты полей анкеты и подписей для profile screens.
import type { ChildAgeGroup } from '$types/profile';

export const ORGANIZATION_PROFILE_COLOR = '#10B981';
export const ORGANIZATION_PROFILE_GRADIENT: [string, string] = ['#10B981', '#34D399'];

export const PARENT_PROFILE_COLOR = '#6C5CE7';
export const PARENT_PROFILE_GRADIENT: [string, string] = ['#6C5CE7', '#8B7FE8'];

export const YOUTH_PROFILE_COLOR = '#3B82F6';
export const YOUTH_PROFILE_GRADIENT: [string, string] = ['#3B82F6', '#60A5FA'];

export const CHILD_PROFILE_COLOR = '#6C5CE7';

export const PARENT_CHILD_AGE_OPTIONS: { label: string; value: ChildAgeGroup }[] = [
  { label: '6-8', value: '6-8' },
  { label: '9-11', value: '9-11' },
  { label: '12-14', value: '12-14' },
  { label: '15-17', value: '15-17' },
];

export const CHILD_PROFILE_AGE_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 6);

export const YOUTH_PROFILE_INTERESTS = [
  'Рисование',
  'Музыка',
  'Спорт',
  'Программирование',
  'Фото/Видео',
  'Чтение',
  'Танцы',
  'Дизайн',
];

export const CHILD_PROFILE_INTERESTS = [
  'Рисование',
  'Музыка',
  'Математика',
  'Спорт',
  'Чтение',
  'Конструкторы',
  'Игры',
  'Языки',
];

export const YOUTH_RESULT_COLOR_PALETTE = [
  '#10B981',
  '#8B5CF6',
  '#3B82F6',
  '#F59E0B',
  '#EC4899',
  '#14B8A6',
  '#F43F5E',
];

export const ORG_RESULT_BARS = [
  { id: 'training', height: 80 },
  { id: 'marketing', height: 60 },
  { id: 'methodology', height: 95 },
  { id: 'management', height: 50 },
] as const;
