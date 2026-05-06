import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import React from "react";
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  COLORS,
  LAYOUT,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from "../../../constants/theme";
import { useOrgApplications } from "../../../hooks/useOrgData";

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= LAYOUT.desktopBreakpoint;
  const paddingX = isDesktop
    ? LAYOUT.dashboardHorizontalPaddingDesktop
    : SPACING.xl;

  const { apps } = useOrgApplications();
  const student = apps.find((app) => app.id === id) ?? null;

  const getLevelLabel = (level: string) => {
    return level || "Не указан";
  };

  if (!student) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <Text style={{ color: COLORS.mutedForeground }}>Ученик не найден</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header - Unified Brand Style */}
      <View
        style={{
          backgroundColor: COLORS.primary,
          borderBottomLeftRadius: RADIUS.xxl,
          borderBottomRightRadius: RADIUS.xxl,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={COLORS.gradients.header as any}
          style={{ paddingBottom: SPACING.xl }}
        >
          <SafeAreaView edges={["top"]}>
            <View
              style={{ paddingHorizontal: paddingX, paddingTop: SPACING.md }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: SPACING.xl,
                }}
              >
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: RADIUS.md,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name="arrow-left" size={20} color="white" />
                </TouchableOpacity>
                <Text
                  style={{
                    flex: 1,
                    marginLeft: SPACING.md,
                    fontSize: TYPOGRAPHY.size.xl,
                    fontWeight: TYPOGRAPHY.weight.semibold,
                    color: "white",
                  }}
                >
                  Профиль ученика
                </Text>
              </View>

              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                style={{ flexDirection: "row", alignItems: "center", gap: 20 }}
              >
                <View
                  style={{
                    width: 80,
                    height: 80,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: RADIUS.full,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 2,
                    borderColor: "rgba(255,255,255,0.3)",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: TYPOGRAPHY.weight.bold,
                      color: "white",
                    }}
                  >
                    {student.child_name.charAt(0)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.xl,
                      fontWeight: TYPOGRAPHY.weight.bold,
                      color: "white",
                      marginBottom: 2,
                    }}
                  >
                    {student.child_name}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: 14,
                      fontWeight: TYPOGRAPHY.weight.medium,
                      marginBottom: 8,
                    }}
                  >
                    {student.child_age
                      ? `${student.child_age} лет`
                      : "Возраст не указан"}{" "}
                    • {getLevelLabel(student.status)}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: "rgba(255,255,255,0.15)",
                      alignSelf: "flex-start",
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: RADIUS.full,
                    }}
                  >
                    <Feather name="book-open" size={12} color="white" />
                    <Text
                      style={{
                        color: "white",
                        fontSize: 11,
                        fontWeight: TYPOGRAPHY.weight.bold,
                      }}
                    >
                      {(student.club || "Курс").toUpperCase()}
                    </Text>
                  </View>
                </View>
              </MotiView>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: paddingX,
          paddingTop: SPACING.xl,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
        >
          {/* Stats Grid */}
          <View
            style={{
              flexDirection: "row",
              gap: SPACING.md,
              marginBottom: SPACING.xl,
            }}
          >
            <View
              style={{
                ...SHADOWS.strict,
                flex: 1,
                backgroundColor: COLORS.white,
                borderRadius: RADIUS.xxl,
                padding: SPACING.xl,
                alignItems: "center",
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  backgroundColor: "rgba(59, 130, 246, 0.05)",
                  borderRadius: RADIUS.lg,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: SPACING.sm,
                }}
              >
                <Feather name="calendar" size={24} color="#3B82F6" />
              </View>
              <Text
                style={{
                  fontSize: TYPOGRAPHY.size.xl,
                  fontWeight: TYPOGRAPHY.weight.bold,
                  color: COLORS.foreground,
                }}
              >
                —
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: COLORS.mutedForeground,
                  fontWeight: TYPOGRAPHY.weight.bold,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Занятий
              </Text>
            </View>
            <View
              style={{
                ...SHADOWS.strict,
                flex: 1,
                backgroundColor: COLORS.white,
                borderRadius: RADIUS.xxl,
                padding: SPACING.xl,
                alignItems: "center",
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  backgroundColor: "rgba(16, 185, 129, 0.05)",
                  borderRadius: RADIUS.lg,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: SPACING.sm,
                }}
              >
                <Feather name="trending-up" size={24} color="#10B981" />
              </View>
              <Text
                style={{
                  fontSize: TYPOGRAPHY.size.xl,
                  fontWeight: TYPOGRAPHY.weight.bold,
                  color: COLORS.foreground,
                }}
              >
                —
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: COLORS.mutedForeground,
                  fontWeight: TYPOGRAPHY.weight.bold,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Посещаемость
              </Text>
            </View>
          </View>

          {/* Attendance Breakdown */}
          <View
            style={{
              ...SHADOWS.strict,
              backgroundColor: COLORS.white,
              borderRadius: RADIUS.xxl,
              padding: SPACING.xl,
              marginBottom: SPACING.xl,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.md,
                fontWeight: TYPOGRAPHY.weight.bold,
                color: COLORS.foreground,
                marginBottom: SPACING.xl,
              }}
            >
              Статистика посещений
            </Text>
            <View style={{ flexDirection: "row", gap: SPACING.sm }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(52, 199, 89, 0.05)",
                  padding: 16,
                  borderRadius: RADIUS.lg,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: TYPOGRAPHY.weight.bold,
                    color: COLORS.success,
                  }}
                >
                  —
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: COLORS.success,
                    fontWeight: TYPOGRAPHY.weight.bold,
                    textTransform: "uppercase",
                    marginTop: 4,
                  }}
                >
                  Был
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(239, 68, 68, 0.05)",
                  padding: 16,
                  borderRadius: RADIUS.lg,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: TYPOGRAPHY.weight.bold,
                    color: COLORS.destructive,
                  }}
                >
                  —
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: COLORS.destructive,
                    fontWeight: TYPOGRAPHY.weight.bold,
                    textTransform: "uppercase",
                    marginTop: 4,
                  }}
                >
                  Пропуск
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255, 159, 10, 0.05)",
                  padding: 16,
                  borderRadius: RADIUS.lg,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: TYPOGRAPHY.weight.bold,
                    color: COLORS.warning,
                  }}
                >
                  —
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: COLORS.warning,
                    fontWeight: TYPOGRAPHY.weight.bold,
                    textTransform: "uppercase",
                    marginTop: 4,
                  }}
                >
                  Опоздал
                </Text>
              </View>
            </View>
          </View>

          {/* Course Info Details */}
          <View
            style={{
              ...SHADOWS.strict,
              backgroundColor: COLORS.white,
              borderRadius: RADIUS.xxl,
              padding: SPACING.xl,
              marginBottom: SPACING.xl,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <View style={{ gap: SPACING.xl }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: SPACING.md,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    backgroundColor: COLORS.background,
                    borderRadius: RADIUS.md,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name="layers" size={20} color={COLORS.primary} />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 10,
                      color: COLORS.mutedForeground,
                      fontWeight: TYPOGRAPHY.weight.bold,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 2,
                    }}
                  >
                    Группа
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: TYPOGRAPHY.weight.semibold,
                      color: COLORS.foreground,
                    }}
                  >
                    Не указана
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: SPACING.md,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    backgroundColor: COLORS.background,
                    borderRadius: RADIUS.md,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name="award" size={20} color={COLORS.primary} />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 10,
                      color: COLORS.mutedForeground,
                      fontWeight: TYPOGRAPHY.weight.bold,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 2,
                    }}
                  >
                    Преподаватель
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: TYPOGRAPHY.weight.semibold,
                      color: COLORS.foreground,
                    }}
                  >
                    Не указан
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Parent / Contact Info - Phone hidden for privacy */}
          <View
            style={{
              ...SHADOWS.strict,
              backgroundColor: COLORS.white,
              borderRadius: RADIUS.xxl,
              padding: SPACING.xl,
              marginBottom: SPACING.xxxl,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.md,
                fontWeight: TYPOGRAPHY.weight.bold,
                color: COLORS.foreground,
                marginBottom: SPACING.xl,
              }}
            >
              Контакт родителя
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: TYPOGRAPHY.weight.semibold,
                    color: COLORS.foreground,
                  }}
                >
                  {student.parent_name || "Не указан"}
                </Text>
                <Text style={{ fontSize: 14, color: COLORS.mutedForeground }}>
                  Связаться через чат
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: COLORS.primary,
                  borderRadius: RADIUS.md,
                  alignItems: "center",
                  justifyContent: "center",
                  ...SHADOWS.md,
                }}
                onPress={() => router.push("/(tabs)/chats" as any)}
              >
                <Feather name="message-circle" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}
