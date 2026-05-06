import { COLORS } from '$constants/theme';
import type { FeatherIconName } from '$types/icons';

export const ORG_HOME_QUICK_ACTIONS = [
  {
    label: 'Заявки',
    icon: 'clipboard',
    route: '/organization/applications',
    color: '#F59E0B',
  },
  {
    label: 'Курсы',
    icon: 'book',
    route: '/organization/courses',
    color: COLORS.primary,
  },
  {
    label: 'Учителя',
    icon: 'users',
    route: '/organization/staff',
    color: '#6366F1',
  },
  {
    label: 'Группы',
    icon: 'layers',
    route: '/organization/groups',
    color: '#10B981',
  },
] satisfies Array<{
  label: string;
  icon: FeatherIconName;
  route: string;
  color: string;
}>;

export const TASK_COLORS = ['#A78BFA', '#6C5CE7', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
