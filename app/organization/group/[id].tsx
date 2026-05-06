import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
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
import { useOrgApplications, useOrgGroupById } from "../../../hooks/useOrgData";
import { useIsDesktop } from "../../../lib/useIsDesktop";

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = isDesktop
    ? LAYOUT.dashboardHorizontalPaddingDesktop
    : SPACING.xl;

  const { group, loading: groupLoading } = useOrgGroupById(id);
  const { apps, loading: appsLoading } = useOrgApplications();

  // Students are applications with active status
  const students = apps.filter(
    (a) =>
      ["paid", "activated"].includes(a.status) &&
      (!group?.course || a.club === group.course),
  );

  const loading = groupLoading || appsLoading;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
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
                  Детали группы
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push(`/organization/group/${id}/edit` as any)
                  }
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: RADIUS.md,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name="settings" size={18} color="white" />
                </TouchableOpacity>
              </View>

              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
              >
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.xxxl,
                    fontWeight: TYPOGRAPHY.weight.bold,
                    color: "white",
                    marginBottom: 4,
                  }}
                >
                  {group?.name ?? "Группа"}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontSize: TYPOGRAPHY.size.sm,
                    fontWeight: TYPOGRAPHY.weight.medium,
                  }}
                >
                  {group?.course ?? ""}
                </Text>
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
        {loading && (
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={{ marginBottom: 24 }}
          />
        )}

        {/* Info Cards Row */}
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
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: SPACING.sm,
                marginBottom: SPACING.xs,
              }}
            >
              <Feather name="users" size={14} color={COLORS.primary} />
              <Text
                style={{
                  fontSize: 10,
                  color: COLORS.mutedForeground,
                  fontWeight: TYPOGRAPHY.weight.bold,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Учеников
              </Text>
            </View>
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.xl,
                fontWeight: TYPOGRAPHY.weight.bold,
                color: COLORS.foreground,
              }}
            >
              {students.length} / {group?.capacity ?? "—"}
            </Text>
          </View>
          <View
            style={{
              ...SHADOWS.strict,
              flex: 1,
              backgroundColor: COLORS.white,
              borderRadius: RADIUS.xxl,
              padding: SPACING.xl,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: SPACING.sm,
                marginBottom: SPACING.xs,
              }}
            >
              <Feather name="calendar" size={14} color={COLORS.primary} />
              <Text
                style={{
                  fontSize: 10,
                  color: COLORS.mutedForeground,
                  fontWeight: TYPOGRAPHY.weight.bold,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Расписание
              </Text>
            </View>
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.sm,
                fontWeight: TYPOGRAPHY.weight.bold,
                color: COLORS.foreground,
              }}
            >
              {group?.schedule ?? "—"}
            </Text>
          </View>
        </View>

        {/* Student List */}
        <View
          style={{
            marginBottom: SPACING.lg,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: TYPOGRAPHY.size.lg,
              fontWeight: TYPOGRAPHY.weight.semibold,
              color: COLORS.foreground,
              flex: 1,
            }}
          >
            Список учеников
          </Text>
          <TouchableOpacity
            onPress={() =>
              router.push(`/organization/group/${id}/attendance` as any)
            }
            style={{
              backgroundColor: "rgba(108, 92, 231, 0.1)",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: RADIUS.full,
            }}
          >
            <Text
              style={{
                color: COLORS.primary,
                fontWeight: TYPOGRAPHY.weight.bold,
                fontSize: 11,
              }}
            >
              ПОСЕЩАЕМОСТЬ
            </Text>
          </TouchableOpacity>
        </View>

        {!loading && students.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Feather name="users" size={36} color={COLORS.muted} />
            <Text
              style={{
                marginTop: 12,
                color: COLORS.mutedForeground,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Нет зачисленных учеников
            </Text>
          </View>
        )}

        <View style={{ gap: SPACING.sm }}>
          {students.map((student, idx) => (
            <MotiView
              key={student.id}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: idx * 50 }}
            >
              <TouchableOpacity
                onPress={() =>
                  router.push(`/organization/student/${student.id}` as any)
                }
                style={{
                  ...SHADOWS.sm,
                  backgroundColor: COLORS.white,
                  borderRadius: RADIUS.xxl,
                  padding: SPACING.lg,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: SPACING.lg,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: COLORS.background,
                      borderRadius: RADIUS.lg,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: COLORS.border,
                    }}
                  >
                    <Feather
                      name="user"
                      size={20}
                      color={COLORS.mutedForeground}
                    />
                  </View>
                  <View>
                    <Text
                      style={{
                        fontWeight: TYPOGRAPHY.weight.semibold,
                        color: COLORS.foreground,
                        fontSize: 15,
                      }}
                    >
                      {student.child_name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: COLORS.mutedForeground,
                        fontWeight: TYPOGRAPHY.weight.medium,
                      }}
                    >
                      {student.child_age
                        ? `${student.child_age} лет`
                        : (student.club ?? "")}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    router.push(
                      `/organization/student/${student.id}/feedback` as any,
                    )
                  }
                  style={{
                    backgroundColor: COLORS.background,
                    paddingHorizontal: 16,
                    height: 36,
                    borderRadius: RADIUS.md,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: TYPOGRAPHY.weight.bold,
                      color: COLORS.mutedForeground,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Отзыв
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
