export type AdminRouteKey =
  | "overview"
  | "users"
  | "organizations"
  | "billing"
  | "support"
  | "settings";

export const ADMIN_ROUTES: Record<AdminRouteKey, string> = {
  overview: "/(tabs)/home",
  users: "/(tabs)/admin/users",
  organizations: "/(tabs)/admin/organizations",
  billing: "/(tabs)/admin/billing",
  support: "/(tabs)/admin/support",
  settings: "/(tabs)/admin/settings",
};

export const USER_ROLES = [
  "all",
  "parent",
  "youth",
  "child",
  "mentor",
  "org",
  "admin",
] as const;

export const ROLE_LABELS: Record<string, string> = {
  all: "Все",
  parent: "Родители",
  youth: "Молодежь",
  child: "Дети",
  mentor: "Менторы",
  org: "Организации",
  admin: "Администраторы",
};

export const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  parent: { bg: "#EDE9FE", color: "#6C5CE7" },
  youth: { bg: "#DBEAFE", color: "#2563EB" },
  child: { bg: "#DCFCE7", color: "#16A34A" },
  mentor: { bg: "#FEF9C3", color: "#CA8A04" },
  org: { bg: "#FEE2E2", color: "#DC2626" },
  admin: { bg: "#F3F4F6", color: "#374151" },
};
