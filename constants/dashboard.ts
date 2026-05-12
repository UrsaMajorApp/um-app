// Dashboard constants: статичные блоки и summary-данные для dashboard screens.
import { COLORS } from '$constants/theme';
import type { AppRouteIntent } from '$lib/appNavigation';
import type { FeatherIconName } from '$types/icons';

export const ORG_HOME_QUICK_ACTIONS = [
  {
    label: 'Заявки',
    icon: 'clipboard',
    route: { name: 'orgApplications' },
    color: '#F59E0B',
  },
  {
    label: 'Курсы',
    icon: 'book',
    route: { name: 'orgCourses' },
    color: COLORS.primary,
  },
  {
    label: 'Учителя',
    icon: 'users',
    route: { name: 'orgStaff' },
    color: '#6366F1',
  },
  {
    label: 'Группы',
    icon: 'layers',
    route: { name: 'orgGroups' },
    color: '#10B981',
  },
] satisfies Array<{
  label: string;
  icon: FeatherIconName;
  route: AppRouteIntent;
  color: string;
}>;

export const TASK_COLORS = ['#A78BFA', '#6C5CE7', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
