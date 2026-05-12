// Auth role options: список ролей, которые пользователь выбирает при регистрации.
import type { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { UserRole } from '$contexts/AuthContext';
import type { AppHref } from '$types/router';

export type AuthRoleOption = {
  title: string;
  description: string;
  icon: ComponentProps<typeof Feather>['name'];
  role: UserRole;
  route: AppHref;
  color: string;
  gradient: [string, string];
};

export const AUTH_ROLE_OPTIONS: AuthRoleOption[] = [
  {
    title: 'Родитель',
    description: 'Управление профилями детей и кружками',
    icon: 'users',
    role: 'parent',
    route: '/profile/parent/create-profile',
    color: '#6C5CE7',
    gradient: ['#6C5CE7', '#8B7FE8'],
  },
  {
    title: 'Ученик',
    description: 'Цели, достижения и поиск интересов',
    icon: 'zap',
    role: 'youth',
    route: '/profile/youth/create-profile',
    color: '#3B82F6',
    gradient: ['#3B82F6', '#60A5FA'],
  },
  {
    title: 'Организация',
    description: 'Управление клубами и сотрудниками',
    icon: 'briefcase',
    role: 'org',
    route: '/profile/organization/create-profile',
    color: '#10B981',
    gradient: ['#10B981', '#34D399'],
  },
  {
    title: 'Ментор',
    description: 'Планы развития и сопровождение',
    icon: 'user-check',
    role: 'mentor',
    route: '/profile/mentor/create-profile',
    color: '#EF4444',
    gradient: ['#EF4444', '#F87171'],
  },
];
