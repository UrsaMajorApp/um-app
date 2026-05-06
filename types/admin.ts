import type { FeatherIconName } from '$types/icons';

export type AdminBillingTab = 'transactions' | 'fees';
export type AdminOrgTab = 'orgs' | 'courses' | 'enrollments';
export type AdminSettingsTab = 'onboarding' | 'tags' | 'logic';
export type AdminSupportTab = 'logs' | 'tickets';
export type AdminUsersTab = 'mentors' | 'active_mentors' | 'users' | 'families';

export type AdminQueueItem = {
  title: string;
  count: number;
  description: string;
  icon: FeatherIconName;
  color: string;
  action: () => void;
};

export type AdminMetricItem = {
  label: string;
  value: number | string;
  detail: string;
  icon: FeatherIconName;
  color: string;
  action: () => void;
};

export type AdminConversationParticipantRow = {
  conversation_id: string;
};
