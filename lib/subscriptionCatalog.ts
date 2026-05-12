// Subscription catalog: описывает планы, цены, роли и возможности подписок в одном месте.
export type SubscriptionPlanRole = 'parent' | 'youth' | 'org';

export interface SubscriptionPlan {
  id: string;
  role: SubscriptionPlanRole;
  title: string;
  price_kzt: number;
  billing_period: string;
  features: string[];
  popular: boolean;
  display_order: number;
}

const diplomaB2CPlans = [
  {
    title: 'Free',
    price_kzt: 0,
    billing_period: 'free',
    features: [
      'Первичная диагностика (BASIC)',
      'Каталог кружков',
      'Онлайн-запись на кружки',
      'Календарь занятий',
    ],
    popular: false,
    display_order: 10,
  },
  {
    title: 'Pro',
    price_kzt: 19900,
    billing_period: 'quarter',
    features: [
      'Глубокое тестирование (PRO)',
      'Полный профиль «Паутина талантов»',
      'Персонализированные ИИ-рекомендации',
      'Карьерный трек для возраста 15-17 лет',
      'Все возможности Free',
    ],
    popular: true,
    display_order: 20,
  },
  {
    title: 'Premium',
    price_kzt: 44900,
    billing_period: 'quarter',
    features: [
      'Персональный ментор: 1 сессия в месяц',
      'Полный трекинг прогресса',
      'Регулярный фидбек от образовательных организаций',
      'Все возможности Pro',
    ],
    popular: false,
    display_order: 30,
  },
];

export const fallbackSubscriptionPlans: SubscriptionPlan[] = [
  ...diplomaB2CPlans.map((plan, index) => ({
    ...plan,
    id: `71000000-0000-4000-a000-00000000020${index + 1}`,
    role: 'parent' as const,
  })),
  ...diplomaB2CPlans.map((plan, index) => ({
    ...plan,
    id: `71000000-0000-4000-a000-00000000030${index + 1}`,
    role: 'youth' as const,
  })),
  {
    id: '71000000-0000-4000-a000-000000000401',
    role: 'org',
    title: 'Партнёрство (B2B)',
    price_kzt: 50000,
    billing_period: 'month',
    features: [
      'Приоритетное размещение',
      'Расширенная аналитика',
      'Инструменты управления онлайн-записями',
      '10-15% комиссия с каждой онлайн-записи',
    ],
    popular: true,
    display_order: 10,
  },
];

export function fallbackPlansForRole(role: SubscriptionPlanRole | null): SubscriptionPlan[] {
  if (!role) return [];
  return fallbackSubscriptionPlans.filter((plan) => plan.role === role);
}

export function getSubscriptionPlanById(
  role: SubscriptionPlanRole,
  planId: string,
): SubscriptionPlan | null {
  return fallbackSubscriptionPlans.find((plan) => plan.role === role && plan.id === planId) ?? null;
}
