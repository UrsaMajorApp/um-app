import type { FeatherIconName } from '$types/icons';

export type DashboardQuickAction = {
  label: string;
  icon: FeatherIconName;
  color: string;
  route: string;
};

export type MentorSessionOutcomeConfig = {
  color: string;
  label: string;
  icon: FeatherIconName;
};

export type OrgStudentStat = {
  label: string;
  value: number;
  ico: FeatherIconName;
  color: string;
};

export type ParentReportStat = {
  label: string;
  value: string;
  icon: FeatherIconName;
  color: string;
};
