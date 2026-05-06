import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { appHref } from "$lib/router";
import { MotiView } from "moti";
import React from "react";
import {
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
} from "$constants/theme";
import { useOrgGroups } from "$hooks/useOrgData";
import { useIsDesktop } from "$lib/useIsDesktop";

export default function OrgGroupsScreen() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = isDesktop
    ? LAYOUT.dashboardHorizontalPaddingDesktop
    : SPACING.xl;

  const { groups: rawGroups, loading } = useOrgGroups();
  // Map to the shape the UI expects
  const groups = rawGroups.map((g) => ({
    id: g.id,
    group_name: g.name,
    course_title: g.course ?? "",
    status: g.active ? ("active" as const) : ("inactive" as const),
    current_students: g.enrolled,
    max_students: g.capacity,
    teacher_name: undefined as string | undefined,
    schedule: g.schedule ?? undefined,
  }));

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
          colors={COLORS.gradients.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingBottom: SPACING.xl }}
        >
          <SafeAreaView edges={["top"]}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: paddingX,
                paddingTop: SPACING.md,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.xxl,
                    fontWeight: TYPOGRAPHY.weight.bold,
                    color: "white",
                  }}
                >
                  Группы
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: TYPOGRAPHY.size.sm,
                    fontWeight: TYPOGRAPHY.weight.medium,
                    marginTop: 2,
                  }}
                >
                  Всего групп: {groups.length}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/organization/group/create")}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: RADIUS.md,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="plus" size={24} color="white" />
              </TouchableOpacity>
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
        {loading ? (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Text style={{ color: COLORS.mutedForeground }}>Загрузка...</Text>
          </View>
        ) : groups.length === 0 ? (
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: RADIUS.xxl,
              padding: 40,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: COLORS.background,
                borderRadius: RADIUS.full,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: SPACING.xl,
              }}
            >
              <Feather name="users" size={32} color={COLORS.mutedForeground} />
            </View>
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.xl,
                fontWeight: TYPOGRAPHY.weight.bold,
                color: COLORS.foreground,
                marginBottom: 8,
              }}
            >
              Нет групп
            </Text>
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.sm,
                color: COLORS.mutedForeground,
                textAlign: "center",
                marginBottom: SPACING.xl,
                lineHeight: 20,
              }}
            >
              Создайте первую группу для начала работы
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/organization/group/create")}
              style={{
                backgroundColor: COLORS.primary,
                paddingHorizontal: 32,
                height: 56,
                borderRadius: RADIUS.lg,
                alignItems: "center",
                justifyContent: "center",
                ...SHADOWS.md,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: TYPOGRAPHY.weight.bold,
                  fontSize: 16,
                }}
              >
                Создать группу
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: SPACING.lg }}>
            {groups.map((group, idx) => (
              <MotiView
                key={group.id}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: idx * 100 }}
              >
                <TouchableOpacity
                  onPress={() =>
                    router.push(appHref(`/organization/group/${group.id}`))
                  }
                  style={{
                    ...SHADOWS.strict,
                    backgroundColor: COLORS.white,
                    borderRadius: 40,
                    padding: SPACING.xl,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: SPACING.xl,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: TYPOGRAPHY.size.lg,
                          fontWeight: TYPOGRAPHY.weight.semibold,
                          color: COLORS.foreground,
                          marginBottom: 4,
                        }}
                      >
                        {group.group_name}
                      </Text>
                      <Text
                        style={{
                          fontSize: TYPOGRAPHY.size.sm,
                          color: COLORS.primary,
                          fontWeight: TYPOGRAPHY.weight.bold,
                        }}
                      >
                        {group.course_title}
                      </Text>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: RADIUS.lg,
                        backgroundColor:
                          group.status === "active"
                            ? "rgba(52, 199, 89, 0.1)"
                            : COLORS.background,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: TYPOGRAPHY.weight.bold,
                          color:
                            group.status === "active"
                              ? COLORS.success
                              : COLORS.mutedForeground,
                        }}
                      >
                        {group.status === "active" ? "АКТИВНА" : "НЕАКТИВНА"}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      rowGap: SPACING.sm,
                      marginBottom: SPACING.xl,
                    }}
                  >
                    <View
                      style={{
                        width: "50%",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Feather
                        name="users"
                        size={14}
                        color={COLORS.mutedForeground}
                      />
                      <Text
                        style={{
                          fontSize: TYPOGRAPHY.size.sm,
                          color: COLORS.foreground,
                          fontWeight: TYPOGRAPHY.weight.medium,
                        }}
                      >
                        {group.current_students}/{group.max_students}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: "50%",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Feather
                        name="award"
                        size={14}
                        color={COLORS.mutedForeground}
                      />
                      <Text
                        style={{
                          fontSize: TYPOGRAPHY.size.sm,
                          color: COLORS.foreground,
                          fontWeight: TYPOGRAPHY.weight.medium,
                        }}
                      >
                        {group.teacher_name || "Не назначен"}
                      </Text>
                    </View>
                    {group.schedule && (
                      <View
                        style={{
                          width: "100%",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <Feather
                          name="clock"
                          size={14}
                          color={COLORS.mutedForeground}
                        />
                        <Text
                          style={{
                            fontSize: TYPOGRAPHY.size.sm,
                            color: COLORS.foreground,
                            fontWeight: TYPOGRAPHY.weight.medium,
                          }}
                        >
                          {group.schedule}
                        </Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      router.push(appHref(`/organization/group/${group.id}`))
                    }
                    style={{
                      height: 48,
                      backgroundColor: COLORS.background,
                      borderRadius: RADIUS.lg,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.foreground,
                        fontWeight: TYPOGRAPHY.weight.bold,
                        fontSize: 14,
                      }}
                    >
                      ПОДРОБНЕЕ
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </MotiView>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
