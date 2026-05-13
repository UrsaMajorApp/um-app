// Tab items config: описывает вкладки, иконки и role-based видимость навигации.
import { Feather } from '@expo/vector-icons';
import type React from 'react';

export type Role =
  | 'parent'
  | 'youth'
  | 'child'
  | 'young-adult'
  | 'mentor'
  | 'org'
  | 'teacher'
  | 'admin';

export type TabItem = {
  key: string;
  label: string;
  route: string;
  icon: (props: { color: string; size: number }) => React.ReactNode;
};

const COMMON_HOME: TabItem = {
  key: 'home',
  label: 'Главная',
  route: 'home',
  icon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
};

export const TABS_BY_ROLE: Record<string, TabItem[]> = {
  parent: [
    COMMON_HOME,
    {
      key: 'parent/calendar',
      label: 'Календарь',
      route: 'parent/calendar',
      icon: ({ color, size }) => <Feather name="calendar" size={size} color={color} />,
    },
    {
      key: 'parent/clubs',
      label: 'Кружки',
      route: 'parent/clubs',
      icon: ({ color, size }) => <Feather name="book-open" size={size} color={color} />,
    },
    {
      key: 'parent/reports',
      label: 'Отчёты',
      route: 'parent/reports',
      icon: ({ color, size }) => <Feather name="bar-chart-2" size={size} color={color} />,
    },
    {
      key: 'chats',
      label: 'Чат',
      route: 'chats',
      icon: ({ color, size }) => <Feather name="message-circle" size={size} color={color} />,
    },
    {
      key: 'profile',
      label: 'Профиль',
      route: 'profile',
      icon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
    },
  ],

  mentor: [
    COMMON_HOME,
    {
      key: 'mentor/students',
      label: 'Ученики',
      route: 'mentor/students',
      icon: ({ color, size }) => <Feather name="users" size={size} color={color} />,
    },
    {
      key: 'mentor/sessions',
      label: 'Пробные',
      route: 'mentor/sessions',
      icon: ({ color, size }) => <Feather name="play-circle" size={size} color={color} />,
    },
    {
      key: 'chats',
      label: 'Чат',
      route: 'chats',
      icon: ({ color, size }) => <Feather name="message-circle" size={size} color={color} />,
    },
    {
      key: 'profile',
      label: 'Профиль',
      route: 'profile',
      icon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
    },
  ],

  org: [
    COMMON_HOME,
    {
      key: 'organization/courses',
      label: 'Курсы',
      route: 'organization/courses',
      icon: ({ color, size }) => <Feather name="book-open" size={size} color={color} />,
    },
    {
      key: 'organization/staff',
      label: 'Учителя',
      route: 'organization/staff',
      icon: ({ color, size }) => <Feather name="award" size={size} color={color} />,
    },
    {
      key: 'organization/students',
      label: 'Ученики',
      route: 'organization/students',
      icon: ({ color, size }) => <Feather name="users" size={size} color={color} />,
    },
    {
      key: 'profile',
      label: 'Профиль',
      route: 'profile',
      icon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
    },
  ],

  youth: [
    COMMON_HOME,
    {
      key: 'chats',
      label: 'Чат',
      route: 'chats',
      icon: ({ color, size }) => <Feather name="message-circle" size={size} color={color} />,
    },
    {
      key: 'youth/games',
      label: 'Игры',
      route: 'youth/games',
      icon: ({ color, size }) => <Feather name="layout" size={size} color={color} />,
    },
    {
      key: 'analytics',
      label: 'Календарь',
      route: 'analytics',
      icon: ({ color, size }) => <Feather name="calendar" size={size} color={color} />,
    },
    {
      key: 'profile',
      label: 'Профиль',
      route: 'profile',
      icon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
    },
  ],

  child: [
    COMMON_HOME,
    {
      key: 'youth/games',
      label: 'Игры',
      route: 'youth/games',
      icon: ({ color, size }) => <Feather name="layout" size={size} color={color} />,
    },
    {
      key: 'profile',
      label: 'Профиль',
      route: 'profile',
      icon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
    },
  ],

  'young-adult': [
    COMMON_HOME,
    {
      key: 'catalog',
      label: 'Кружки',
      route: 'catalog',
      icon: ({ color, size }) => <Feather name="book-open" size={size} color={color} />,
    },
    {
      key: 'chats',
      label: 'Ментор',
      route: 'chats',
      icon: ({ color, size }) => <Feather name="message-circle" size={size} color={color} />,
    },
    {
      key: 'analytics',
      label: 'Календарь',
      route: 'analytics',
      icon: ({ color, size }) => <Feather name="calendar" size={size} color={color} />,
    },
    {
      key: 'profile',
      label: 'Профиль',
      route: 'profile',
      icon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
    },
  ],

  teacher: [
    COMMON_HOME,
    {
      key: 'teacher/groups',
      label: 'Группы',
      route: 'teacher/groups',
      icon: ({ color, size }) => <Feather name="users" size={size} color={color} />,
    },
    {
      key: 'chats',
      label: 'Чат',
      route: 'chats',
      icon: ({ color, size }) => <Feather name="message-circle" size={size} color={color} />,
    },
    {
      key: 'profile',
      label: 'Профиль',
      route: 'profile',
      icon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
    },
  ],

  admin: [
    {
      key: 'home',
      label: 'Очередь',
      route: 'home',
      icon: ({ color, size }) => <Feather name="inbox" size={size} color={color} />,
    },
    {
      key: 'admin/users',
      label: 'Пользователи',
      route: 'admin/users',
      icon: ({ color, size }) => <Feather name="users" size={size} color={color} />,
    },
    {
      key: 'admin/organizations',
      label: 'Организации',
      route: 'admin/organizations',
      icon: ({ color, size }) => <Feather name="briefcase" size={size} color={color} />,
    },
    {
      key: 'admin/billing',
      label: 'Биллинг',
      route: 'admin/billing',
      icon: ({ color, size }) => <Feather name="dollar-sign" size={size} color={color} />,
    },
    {
      key: 'admin/support',
      label: 'Поддержка',
      route: 'admin/support',
      icon: ({ color, size }) => <Feather name="shield" size={size} color={color} />,
    },
    {
      key: 'admin/settings',
      label: 'Настройки',
      route: 'admin/settings',
      icon: ({ color, size }) => <Feather name="sliders" size={size} color={color} />,
    },
  ],
};

export const DEFAULT_TABS: TabItem[] = [
  COMMON_HOME,
  {
    key: 'chats',
    label: 'Чат',
    route: 'chats',
    icon: ({ color, size }) => <Feather name="message-circle" size={size} color={color} />,
  },
  {
    key: 'analytics',
    label: 'Аналитика',
    route: 'analytics',
    icon: ({ color, size }) => <Feather name="bar-chart-2" size={size} color={color} />,
  },
  {
    key: 'profile',
    label: 'Профиль',
    route: 'profile',
    icon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
  },
];
