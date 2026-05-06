import type { UserRole } from "$contexts/AuthContext";
import type { AppHref } from "$types/router";

export const PROFILE_SETUP_ROUTES: Partial<Record<UserRole, AppHref>> = {
  parent: "/profile/parent/create-profile",
  youth: "/profile/youth/create-profile",
  child: "/profile/youth/create-profile",
  "young-adult": "/profile/youth/create-profile",
  mentor: "/profile/mentor/create-profile",
  org: "/profile/organization/create-profile",
};

export const YOUTH_ROLES = new Set<UserRole>([
  "youth",
  "child",
  "young-adult",
]);
