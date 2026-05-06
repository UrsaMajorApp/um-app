import { LAYOUT, SPACING } from "@/constants/theme";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { useWindowDimensions } from "react-native";
import { useIsDesktop } from "../../lib/useIsDesktop";

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

export function useAdminLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = useIsDesktop();
  return {
    isTablet: width >= 768,
    isDesktop,
    paddingX: isDesktop ? LAYOUT.dashboardHorizontalPaddingDesktop : SPACING.xl,
  };
}

export function formatKZT(n: number): string {
  if (!Number.isFinite(n)) return "0 ₸";
  return `${Math.round(n).toLocaleString("ru-RU")} ₸`;
}

export function formatAdminDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function useAdminNavigation() {
  const router = useRouter();
  return (route: AdminRouteKey) => router.push(ADMIN_ROUTES[route] as any);
}

export async function ensureConversation(
  currentUserId: string,
  otherUserId: string,
  name: string,
  iconName: string,
) {
  if (!supabase || !isSupabaseConfigured)
    return { id: null, error: "Supabase is not configured" };
  const [currentParts, otherParts] = await Promise.all([
    supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", currentUserId),
    supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", otherUserId),
  ]);
  const currentIds = new Set(
    (currentParts.data ?? []).map((p: any) => p.conversation_id),
  );
  const shared = (otherParts.data ?? []).find((p: any) =>
    currentIds.has(p.conversation_id),
  );
  if (shared?.conversation_id)
    return { id: shared.conversation_id as string, error: null };

  const { data: conv, error } = await supabase
    .from("conversations")
    .insert({
      name,
      icon_name: iconName,
      last_message_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error || !conv)
    return { id: null, error: error?.message ?? "Не удалось создать чат" };
  await supabase.from("conversation_participants").insert([
    { conversation_id: conv.id, user_id: currentUserId, unread_count: 0 },
    { conversation_id: conv.id, user_id: otherUserId, unread_count: 0 },
  ]);
  return { id: conv.id as string, error: null };
}
