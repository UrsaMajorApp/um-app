import {
  COLORS,
  LAYOUT,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from "@/constants/theme";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const isDesktop = Platform.OS === "web" && width >= LAYOUT.desktopBreakpoint;
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

export function AdminHeader({
  title,
  subtitle,
  trailing,
}: {
  title: string;
  subtitle: string;
  trailing?: React.ReactNode;
}) {
  const { paddingX } = useAdminLayout();
  return (
    <View style={{ backgroundColor: COLORS.primary, overflow: "hidden" }}>
      <LinearGradient
        colors={COLORS.gradients.header as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: Platform.OS === "ios" ? 0 : 20 }}
      >
        <SafeAreaView edges={["top"]}>
          <View
            style={{
              paddingHorizontal: paddingX,
              paddingTop: 12,
              paddingBottom: 28,
              flexDirection: "row",
              alignItems: "center",
              gap: SPACING.md,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: TYPOGRAPHY.size.xxl,
                  fontWeight: "900",
                  color: COLORS.white,
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.72)",
                  fontSize: TYPOGRAPHY.size.sm,
                  fontWeight: "600",
                  marginTop: 4,
                }}
              >
                {subtitle}
              </Text>
            </View>
            {trailing}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

export function SegmentTabs<T extends string>({
  value,
  tabs,
  onChange,
}: {
  value: T;
  tabs: { key: T; label: string }[];
  onChange: (key: T) => void;
}) {
  const { paddingX } = useAdminLayout();
  return (
    <View
      style={{
        paddingHorizontal: paddingX,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
      }}
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm }}>
        {tabs.map((tab) => {
          const active = tab.key === value;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onChange(tab.key)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                backgroundColor: active ? COLORS.primary : COLORS.muted,
                borderRadius: RADIUS.full,
              }}
            >
              <Text
                style={{
                  color: active ? COLORS.white : COLORS.foreground,
                  fontWeight: "700",
                  fontSize: TYPOGRAPHY.size.sm,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function EmptyState({
  icon = "inbox",
  title,
  body,
}: {
  icon?: React.ComponentProps<typeof Feather>["name"];
  title: string;
  body?: string;
}) {
  return (
    <View
      style={{
        padding: SPACING.xl,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: RADIUS.lg,
          backgroundColor: COLORS.muted,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: SPACING.sm,
        }}
      >
        <Feather name={icon} size={22} color={COLORS.mutedForeground} />
      </View>
      <Text
        style={{
          color: COLORS.foreground,
          fontWeight: "900",
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      {body ? (
        <Text
          style={{
            color: COLORS.mutedForeground,
            fontSize: TYPOGRAPHY.size.sm,
            marginTop: 4,
            textAlign: "center",
          }}
        >
          {body}
        </Text>
      ) : null}
    </View>
  );
}

export function AdminCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View
      style={{
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
        ...style,
      }}
    >
      {children}
    </View>
  );
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
