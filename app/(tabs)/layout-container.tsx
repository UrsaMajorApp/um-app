import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useSegments } from "expo-router";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { COLORS, LAYOUT, RADIUS, SHADOWS } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { useIsDesktop } from "../../lib/useIsDesktop";

export type Role =
  | "parent"
  | "youth"
  | "child"
  | "young-adult"
  | "mentor"
  | "org"
  | "teacher"
  | "admin";

type TabItem = {
  key: string;
  label: string;
  route: string;
  icon: (props: { color: string; size: number }) => React.ReactNode;
};

export function TabIcon({
  icon,
  color,
  focused,
}: {
  icon: any;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Feather name={icon} size={22} color={color} />
      {focused && (
        <View
          style={{
            position: "absolute",
            bottom: -8,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: color,
          }}
        />
      )}
    </View>
  );
}

type Props = { role: Role | string | null };

const COMMON_HOME: TabItem = {
  key: "home",
  label: "Главная",
  route: "home",
  icon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
};

const TABS_BY_ROLE: Record<string, TabItem[]> = {
  parent: [
    COMMON_HOME,
    {
      key: "parent/calendar",
      label: "Календарь",
      route: "parent/calendar",
      icon: ({ color, size }) => (
        <Feather name="calendar" size={size} color={color} />
      ),
    },
    {
      key: "parent/clubs",
      label: "Кружки",
      route: "parent/clubs",
      icon: ({ color, size }) => (
        <Feather name="book-open" size={size} color={color} />
      ),
    },
    {
      key: "parent/reports",
      label: "Отчёты",
      route: "parent/reports",
      icon: ({ color, size }) => (
        <Feather name="bar-chart-2" size={size} color={color} />
      ),
    },
    {
      key: "chats",
      label: "Чат",
      route: "chats",
      icon: ({ color, size }) => (
        <Feather name="message-circle" size={size} color={color} />
      ),
    },
    {
      key: "profile",
      label: "Профиль",
      route: "profile",
      icon: ({ color, size }) => (
        <Feather name="user" size={size} color={color} />
      ),
    },
  ],

  mentor: [
    COMMON_HOME,
    {
      key: "mentor/students",
      label: "Ученики",
      route: "mentor/students",
      icon: ({ color, size }) => (
        <Feather name="users" size={size} color={color} />
      ),
    },
    {
      key: "mentor/sessions",
      label: "Пробные",
      route: "mentor/sessions",
      icon: ({ color, size }) => (
        <Feather name="play-circle" size={size} color={color} />
      ),
    },
    {
      key: "chats",
      label: "Чат",
      route: "chats",
      icon: ({ color, size }) => (
        <Feather name="message-circle" size={size} color={color} />
      ),
    },
    {
      key: "profile",
      label: "Профиль",
      route: "profile",
      icon: ({ color, size }) => (
        <Feather name="user" size={size} color={color} />
      ),
    },
  ],

  org: [
    COMMON_HOME,
    {
      key: "organization/courses",
      label: "Курсы",
      route: "organization/courses",
      icon: ({ color, size }) => (
        <Feather name="book-open" size={size} color={color} />
      ),
    },
    {
      key: "organization/staff",
      label: "Учителя",
      route: "organization/staff",
      icon: ({ color, size }) => (
        <Feather name="award" size={size} color={color} />
      ),
    },
    {
      key: "organization/students",
      label: "Ученики",
      route: "organization/students",
      icon: ({ color, size }) => (
        <Feather name="users" size={size} color={color} />
      ),
    },
    {
      key: "profile",
      label: "Профиль",
      route: "profile",
      icon: ({ color, size }) => (
        <Feather name="user" size={size} color={color} />
      ),
    },
  ],

  youth: [
    COMMON_HOME,
    {
      key: "chats",
      label: "Чат",
      route: "chats",
      icon: ({ color, size }) => (
        <Feather name="message-circle" size={size} color={color} />
      ),
    },
    {
      key: "youth/games",
      label: "Игры",
      route: "youth/games",
      icon: ({ color, size }) => (
        <Feather name="layout" size={size} color={color} />
      ),
    },
    {
      key: "analytics",
      label: "Календарь",
      route: "analytics",
      icon: ({ color, size }) => (
        <Feather name="calendar" size={size} color={color} />
      ),
    },
    {
      key: "profile",
      label: "Профиль",
      route: "profile",
      icon: ({ color, size }) => (
        <Feather name="user" size={size} color={color} />
      ),
    },
  ],

  child: [
    COMMON_HOME,
    {
      key: "youth/games",
      label: "Игры",
      route: "youth/games",
      icon: ({ color, size }) => (
        <Feather name="layout" size={size} color={color} />
      ),
    },
    {
      key: "profile",
      label: "Профиль",
      route: "profile",
      icon: ({ color, size }) => (
        <Feather name="user" size={size} color={color} />
      ),
    },
  ],

  "young-adult": [
    COMMON_HOME,
    {
      key: "youth/goals",
      label: "Цели",
      route: "youth/goals",
      icon: ({ color, size }) => (
        <Feather name="target" size={size} color={color} />
      ),
    },
    {
      key: "chats",
      label: "Ментор",
      route: "chats",
      icon: ({ color, size }) => (
        <Feather name="message-circle" size={size} color={color} />
      ),
    },
    {
      key: "analytics",
      label: "Календарь",
      route: "analytics",
      icon: ({ color, size }) => (
        <Feather name="calendar" size={size} color={color} />
      ),
    },
    {
      key: "profile",
      label: "Профиль",
      route: "profile",
      icon: ({ color, size }) => (
        <Feather name="user" size={size} color={color} />
      ),
    },
  ],

  teacher: [
    COMMON_HOME,
    {
      key: "teacher/groups",
      label: "Группы",
      route: "teacher/groups",
      icon: ({ color, size }) => (
        <Feather name="users" size={size} color={color} />
      ),
    },
    {
      key: "chats",
      label: "Чат",
      route: "chats",
      icon: ({ color, size }) => (
        <Feather name="message-circle" size={size} color={color} />
      ),
    },
    {
      key: "profile",
      label: "Профиль",
      route: "profile",
      icon: ({ color, size }) => (
        <Feather name="user" size={size} color={color} />
      ),
    },
  ],

  admin: [
    {
      key: "home",
      label: "Очередь",
      route: "home",
      icon: ({ color, size }) => (
        <Feather name="inbox" size={size} color={color} />
      ),
    },
    {
      key: "admin/users",
      label: "Пользователи",
      route: "admin/users",
      icon: ({ color, size }) => (
        <Feather name="users" size={size} color={color} />
      ),
    },
    {
      key: "admin/organizations",
      label: "Организации",
      route: "admin/organizations",
      icon: ({ color, size }) => (
        <Feather name="briefcase" size={size} color={color} />
      ),
    },
    {
      key: "admin/billing",
      label: "Биллинг",
      route: "admin/billing",
      icon: ({ color, size }) => (
        <Feather name="dollar-sign" size={size} color={color} />
      ),
    },
    {
      key: "admin/support",
      label: "Поддержка",
      route: "admin/support",
      icon: ({ color, size }) => (
        <Feather name="shield" size={size} color={color} />
      ),
    },
    {
      key: "admin/settings",
      label: "Настройки",
      route: "admin/settings",
      icon: ({ color, size }) => (
        <Feather name="sliders" size={size} color={color} />
      ),
    },
  ],
};

const DEFAULT_TABS: TabItem[] = [
  COMMON_HOME,
  {
    key: "chats",
    label: "Чат",
    route: "chats",
    icon: ({ color, size }) => (
      <Feather name="message-circle" size={size} color={color} />
    ),
  },
  {
    key: "analytics",
    label: "Аналитика",
    route: "analytics",
    icon: ({ color, size }) => (
      <Feather name="bar-chart-2" size={size} color={color} />
    ),
  },
  {
    key: "profile",
    label: "Профиль",
    route: "profile",
    icon: ({ color, size }) => (
      <Feather name="user" size={size} color={color} />
    ),
  },
];

function useTabNav(role: Role | string | null) {
  const router = useRouter();
  const segments = useSegments() as string[];
  const currentSegment = segments[segments.length - 1];
  const currentPath = segments.slice(1).join("/");
  const tabs = role ? TABS_BY_ROLE[role] || DEFAULT_TABS : DEFAULT_TABS;

  const go = (route: string) => {
    if (route.includes("/")) {
      router.push(`/(tabs)/${route}` as any);
    } else {
      router.replace(`/(tabs)/${route}` as any);
    }
  };

  const isActive = (route: string) => {
    if (route.includes("/")) {
      return currentPath.endsWith(route) || currentPath === route;
    }
    return currentSegment === route;
  };

  return { tabs, go, isActive };
}

// ─── Shared notifications modal ───────────────────────────────────────────────

export function NotificationsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: 340,
            backgroundColor: COLORS.card,
            borderRadius: RADIUS.lg,
            padding: 24,
            ...SHADOWS.lg,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 18,
                fontWeight: "700",
                color: COLORS.foreground,
              }}
            >
              Уведомления
            </Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={22} color={COLORS.mutedForeground} />
            </Pressable>
          </View>
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            <Feather
              name="bell-off"
              size={36}
              color={COLORS.mutedForeground}
              style={{ marginBottom: 12 }}
            />
            <Text
              style={{ color: COLORS.mutedForeground, textAlign: "center" }}
            >
              Нет новых уведомлений
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Desktop side nav ────────────────────────────────────────────────────────

export function SideNav({ role }: Props) {
  const router = useRouter();
  const { tabs, go, isActive } = useTabNav(role);
  const { user, logout } = useAuth();

  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Profile tab is replaced by the user footer
  const navTabs = tabs.filter((t) => t.key !== "profile");

  const handleLogout = async () => {
    setDropdownVisible(false);
    await logout();
  };

  const userInitial = user?.firstName?.charAt(0)?.toUpperCase() ?? "?";
  const userName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Пользователь";

  return (
    <View
      style={{
        width: LAYOUT.sideNavWidth,
        backgroundColor: COLORS.white,
        borderRightWidth: 1,
        borderRightColor: COLORS.border,
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Brand header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 20,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        <Text
          style={{
            color: COLORS.primary,
            fontSize: 28,
            fontWeight: "800",
            letterSpacing: -0.5,
          }}
        >
          UM
        </Text>
        <Pressable
          onPress={() => setNotificationsVisible(true)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: COLORS.muted,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="bell" size={18} color={COLORS.mutedForeground} />
        </Pressable>
      </View>

      {/* Nav items */}
      <View style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 12 }}>
        {navTabs.map((item) => {
          const active = isActive(item.route);
          return (
            <Pressable
              key={item.key}
              onPress={() => go(item.route)}
              style={({ hovered, pressed }: any) => ({
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                paddingVertical: 11,
                marginBottom: 2,
                borderRadius: RADIUS.sm,
                backgroundColor: active
                  ? `${COLORS.primary}12`
                  : pressed
                    ? `${COLORS.primary}10`
                    : hovered
                      ? COLORS.muted
                      : "transparent",
              })}
            >
              {item.icon({
                color: active ? COLORS.primary : COLORS.mutedForeground,
                size: 19,
              })}
              <Text
                style={{
                  marginLeft: 12,
                  fontSize: 14,
                  fontWeight: active ? "600" : "400",
                  color: active ? COLORS.primary : COLORS.mutedForeground,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* User footer */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          padding: 12,
        }}
      >
        <Pressable
          onPress={() => setDropdownVisible((v) => !v)}
          style={({ hovered, pressed }: any) => ({
            flexDirection: "row",
            alignItems: "center",
            padding: 10,
            borderRadius: RADIUS.sm,
            backgroundColor:
              dropdownVisible || pressed
                ? COLORS.muted
                : hovered
                  ? `${COLORS.muted}CC`
                  : "transparent",
          })}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: `${COLORS.primary}15`,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            <Text
              style={{ color: COLORS.primary, fontWeight: "700", fontSize: 15 }}
            >
              {userInitial}
            </Text>
          </View>
          <Text
            style={{
              flex: 1,
              fontSize: 14,
              fontWeight: "500",
              color: COLORS.foreground,
            }}
            numberOfLines={1}
          >
            {userName}
          </Text>
          <Feather
            name={dropdownVisible ? "chevron-up" : "chevron-down"}
            size={16}
            color={COLORS.mutedForeground}
          />
        </Pressable>
      </View>

      {dropdownVisible && (
        <>
          <Pressable
            onPress={() => setDropdownVisible(false)}
            style={{
              position: "absolute",
              top: -9999,
              left: -9999,
              right: -9999,
              bottom: -9999,
              zIndex: 99,
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: 80,
              left: 12,
              width: LAYOUT.sideNavWidth - 24,
              backgroundColor: COLORS.card,
              borderRadius: RADIUS.md,
              borderWidth: 1,
              borderColor: COLORS.border,
              overflow: "hidden",
              zIndex: 100,
              ...SHADOWS.md,
            }}
          >
            {[
              {
                label: "Редактировать профиль",
                icon: "user" as const,
                onPress: () => {
                  setDropdownVisible(false);
                  router.push("/profile");
                },
                destructive: false,
              },
              {
                label: "Способы оплаты",
                icon: "credit-card" as const,
                onPress: () => {
                  setDropdownVisible(false);
                  router.push("/parent/subscription" as any);
                },
                destructive: false,
              },
              {
                label: "Настройки",
                icon: "settings" as const,
                onPress: () => {
                  setDropdownVisible(false);
                  router.push("/profile");
                },
                destructive: false,
              },
              {
                label: "Выйти",
                icon: "log-out" as const,
                onPress: handleLogout,
                destructive: true,
              },
            ].map((item, index, arr) => (
              <Pressable
                key={item.label}
                onPress={item.onPress}
                style={({ hovered, pressed }: any) => ({
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                  borderBottomWidth: index < arr.length - 1 ? 1 : 0,
                  borderBottomColor: COLORS.border,
                  backgroundColor: pressed
                    ? COLORS.muted
                    : hovered
                      ? item.destructive
                        ? `${COLORS.destructive}08`
                        : COLORS.muted
                      : "transparent",
                })}
              >
                <Feather
                  name={item.icon}
                  size={16}
                  color={
                    item.destructive
                      ? COLORS.destructive
                      : COLORS.mutedForeground
                  }
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: item.destructive
                      ? COLORS.destructive
                      : COLORS.foreground,
                    fontWeight: item.destructive ? "500" : "400",
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <NotificationsModal
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />
    </View>
  );
}

// ─── Mobile bottom tab bar ───────────────────────────────────────────────────

export default function CustomTabBar({ role }: Props) {
  const { tabs, go, isActive } = useTabNav(role);
  const { width } = useWindowDimensions();
  const segments = useSegments() as string[];

  const isDesktop = useIsDesktop();

  const isClubDetail =
    segments.includes("club") &&
    segments.some((s) => s === "[id]" || s.startsWith("club-"));

  if (isClubDetail && !isDesktop) return null;

  const numTabs = tabs.length;
  const padding = 12;
  const safeAreaBottom = Platform.OS === "ios" ? 24 : 12;

  const containerWidth = isDesktop
    ? Math.min(width, LAYOUT.dashboardMaxWidth)
    : width;
  const usableWidth = containerWidth - padding * 2;
  const tabWidth = usableWidth / numTabs;

  const activeIndex = tabs.findIndex((t) => isActive(t.route));

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: "center",
      }}
    >
      <View
        style={{
          ...SHADOWS.lg,
          width: containerWidth,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          backgroundColor: "transparent",
        }}
      >
        <BlurView
          intensity={90}
          tint="light"
          style={{
            width: "100%",
            height: 76 + safeAreaBottom,
            flexDirection: "row",
            alignItems: "flex-start",
            paddingTop: 12,
            paddingHorizontal: padding,
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.8)",
            borderBottomWidth: 0,
            overflow: "hidden",
            backgroundColor: "rgba(0, 0, 0, 0.08)",
          }}
        >
          {activeIndex >= 0 && !isDesktop && (
            <MotiView
              animate={{
                translateX: activeIndex * tabWidth,
              }}
              transition={{
                type: "spring",
                damping: 26,
                stiffness: 350,
                mass: 0.8,
              }}
              style={{
                position: "absolute",
                left: padding,
                top: 12,
                height: 54,
                width: tabWidth,
                borderRadius: 27,
                overflow: "hidden",
                boxShadow: "0px 4px 12px rgba(108, 92, 231, 0.4)",
              }}
            >
              <MotiView
                animate={{
                  translateX: -activeIndex * tabWidth - 20,
                }}
                transition={{
                  type: "spring",
                  damping: 26,
                  stiffness: 350,
                  mass: 0.8,
                }}
                style={{
                  width: usableWidth + 40,
                  height: "120%",
                  top: "-10%",
                }}
              >
                <LinearGradient
                  colors={["#4F46E5", "#7C3AED", "#C026D3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1 }}
                />
              </MotiView>
            </MotiView>
          )}

          {tabs.map((item, index) => {
            const active = isActive(item.route);
            return (
              <Pressable
                key={item.key}
                onPress={() => go(item.route)}
                style={{
                  width: isDesktop ? "auto" : tabWidth,
                  flex: isDesktop ? 1 : undefined,
                  height: 54,
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 1,
                }}
              >
                {item.icon({
                  color: active ? COLORS.white : COLORS.mutedForeground,
                  size: active ? 28 : 24,
                })}
                {isDesktop && (
                  <Text
                    style={{
                      fontSize: 10,
                      color: active ? COLORS.primary : COLORS.mutedForeground,
                      marginTop: 4,
                      fontWeight: active ? "600" : "400",
                    }}
                  >
                    {item.label}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}
