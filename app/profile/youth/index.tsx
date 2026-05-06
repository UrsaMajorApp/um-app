import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "$components/ui/ScreenHeader";
import { COLORS, LAYOUT, RADIUS, SHADOWS } from "$constants/theme";
import { useAuth } from "$contexts/AuthContext";
import { useParentData } from "$contexts/ParentDataContext";
import { getDashboardHorizontalPadding, useIsDesktop } from "$lib/useIsDesktop";

export default function YouthProfile() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const isDesktop = useIsDesktop();
  const horizontalPadding = getDashboardHorizontalPadding(isDesktop);
  const { parentProfile, childrenProfile, activeChildId } = useParentData();
  const activeChild =
    childrenProfile.find((child) => child.id === activeChildId) ||
    childrenProfile[0];
  const diagnostic = activeChild?.talentProfile;
  const isPro = parentProfile?.tariff === "pro";
  const displayName = activeChild?.name || user?.firstName || "Пользователь";
  const profileSubtitle = activeChild?.age
    ? `${activeChild.age} лет`
    : "Возраст не указан";
  const skillRows = diagnostic
    ? [
        {
          label: "Креативность",
          val: diagnostic.scores.creative,
          col: "#A78BFA",
        },
        { label: "Логика", val: diagnostic.scores.logical, col: "#3B82F6" },
        {
          label: "Коммуникация",
          val: diagnostic.scores.social,
          col: "#10B981",
        },
      ]
    : [];

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      await logout();
    } else {
      Alert.alert("Выход", "Вы действительно хотите выйти?", [
        { text: "Отмена", style: "cancel" },
        {
          text: "Выйти",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {!isDesktop && (
          <ScreenHeader
            title="Мой Профиль"
            horizontalPadding={horizontalPadding}
            withSafeArea={false}
          />
        )}

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingTop: 16,
            paddingBottom: 100,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: isDesktop ? LAYOUT.dashboardMaxWidth : undefined,
            }}
          >
            {/* Profile Info */}
            <View
              style={{
                backgroundColor: COLORS.card,
                padding: 24,
                borderRadius: RADIUS.xxl,
                alignItems: "center",
                marginBottom: 24,
                borderWidth: 1,
                borderColor: COLORS.border,
                ...SHADOWS.md,
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 30,
                  backgroundColor: `${COLORS.primary}10`,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  borderWidth: 2,
                  borderColor: "white",
                }}
              >
                <Text style={{ fontSize: 32 }}>🧑</Text>
              </View>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "900",
                  color: COLORS.foreground,
                  marginBottom: 4,
                }}
              >
                {displayName}
              </Text>
              <Text
                style={{
                  color: COLORS.mutedForeground,
                  fontWeight: "700",
                  marginBottom: 12,
                }}
              >
                {profileSubtitle}
              </Text>

              <View
                style={{
                  backgroundColor: isPro ? "#F5F3FF" : COLORS.muted,
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  borderRadius: RADIUS.full,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: isPro ? "#DDD6FE" : "transparent",
                }}
              >
                <Text
                  style={{
                    color: isPro ? COLORS.primary : COLORS.mutedForeground,
                    fontSize: 10,
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {isPro ? "✨ Family PRO ✨" : "Basic Plan"}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 32,
                }}
              >
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "900",
                      color: COLORS.foreground,
                    }}
                  >
                    {diagnostic ? "Готов" : "Нет"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: COLORS.mutedForeground,
                      fontWeight: "800",
                      textTransform: "uppercase",
                      marginTop: 2,
                    }}
                  >
                    Профиль
                  </Text>
                </View>
                <View
                  style={{
                    width: 1,
                    height: 30,
                    backgroundColor: COLORS.border,
                  }}
                />
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "900",
                      color: COLORS.foreground,
                    }}
                  >
                    {diagnostic?.recommendedConstellation || "—"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: COLORS.mutedForeground,
                      fontWeight: "800",
                      textTransform: "uppercase",
                      marginTop: 2,
                    }}
                  >
                    Тип
                  </Text>
                </View>
              </View>
            </View>

            {/* Diagnostic Results Preview */}
            <View style={{ marginBottom: 24 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "900",
                    color: COLORS.foreground,
                  }}
                >
                  Мои таланты
                </Text>
                <Pressable
                  onPress={() => router.push("/profile/youth/results")}
                >
                  <Text
                    style={{
                      color: COLORS.primary,
                      fontWeight: "700",
                      fontSize: 12,
                    }}
                  >
                    Все детали
                  </Text>
                </Pressable>
              </View>
              <View
                style={{
                  backgroundColor: COLORS.card,
                  padding: 20,
                  borderRadius: RADIUS.xl,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  ...SHADOWS.sm,
                }}
              >
                <View style={{ gap: 12 }}>
                  {skillRows.length === 0 && (
                    <Text
                      style={{ color: COLORS.mutedForeground, fontSize: 13 }}
                    >
                      Результаты появятся после диагностики.
                    </Text>
                  )}
                  {skillRows.map((s, i) => (
                    <View key={i}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginBottom: 5,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "700",
                            color: COLORS.mutedForeground,
                          }}
                        >
                          {s.label}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "800",
                            color: COLORS.foreground,
                          }}
                        >
                          {s.val}%
                        </Text>
                      </View>
                      <View
                        style={{
                          height: 6,
                          backgroundColor: "#F3F4F6",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
                        <View
                          style={{
                            width: `${s.val}%`,
                            height: "100%",
                            backgroundColor: s.col,
                            borderRadius: 3,
                          }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* My Mentor */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "900",
                  color: COLORS.foreground,
                  marginBottom: 12,
                }}
              >
                Мой Ментор
              </Text>
              <View
                style={{
                  backgroundColor: "#F5F3FF",
                  padding: 16,
                  borderRadius: RADIUS.xl,
                  borderWidth: 1,
                  borderColor: "#DDD6FE",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: COLORS.primary,
                    fontWeight: "700",
                  }}
                >
                  Ментор будет отображаться после подтверждения заявки.
                </Text>
              </View>
            </View>

            {/* My Clubs */}
            <View style={{ marginBottom: 24, width: "100%" }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "900",
                  color: COLORS.foreground,
                  marginBottom: 12,
                  textAlign: "left",
                }}
              >
                Мои кружки
              </Text>
              <View
                style={{
                  backgroundColor: COLORS.card,
                  padding: 16,
                  borderRadius: RADIUS.xl,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: COLORS.mutedForeground,
                    fontWeight: "700",
                  }}
                >
                  Активные кружки появятся после записи на курс.
                </Text>
              </View>
            </View>

            {/* Logout */}
            <Pressable
              onPress={handleLogout}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                backgroundColor: COLORS.card,
                borderRadius: RADIUS.sm,
                borderWidth: 1,
                borderColor: `${COLORS.destructive}20`,
              }}
            >
              <Feather name="log-out" size={18} color={COLORS.destructive} />
              <Text
                style={{
                  color: COLORS.destructive,
                  fontWeight: "600",
                  fontSize: 16,
                  marginLeft: 8,
                }}
              >
                Выйти из аккаунта
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
