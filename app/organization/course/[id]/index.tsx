import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LEVEL_LABELS } from "../../../../constants/courseOptions";
import {
  COLORS,
  LAYOUT,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from "../../../../constants/theme";
import { useOrgCourseById, useOrgGroups } from "../../../../hooks/useOrgData";
import { useIsDesktop } from "../../../../lib/useIsDesktop";

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = isDesktop
    ? LAYOUT.dashboardHorizontalPaddingDesktop
    : SPACING.xl;

  const { course, loading } = useOrgCourseById(id);
  const { groups } = useOrgGroups();

  // Groups that belong to this course (by course_id FK, falling back to title match)
  const courseGroups = useMemo(() => {
    if (!course) return [];
    return groups.filter(
      (g) =>
        g.course_id === course.id ||
        (g.course_id == null && g.course === course.title),
    );
  }, [groups, course]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!course) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        <Feather name="alert-circle" size={40} color={COLORS.mutedForeground} />
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            color: COLORS.mutedForeground,
            textAlign: "center",
          }}
        >
          Курс не найден
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        >
          <Text
            style={{
              color: COLORS.primary,
              fontWeight: TYPOGRAPHY.weight.bold,
            }}
          >
            Назад
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
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
            <MotiView
              from={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
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
                    marginRight: SPACING.md,
                  }}
                >
                  <Feather name="arrow-left" size={20} color="white" />
                </TouchableOpacity>
                <Text
                  style={{
                    flex: 1,
                    fontSize: TYPOGRAPHY.size.xl,
                    fontWeight: TYPOGRAPHY.weight.semibold,
                    color: "white",
                  }}
                >
                  Детали курса
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push(`/organization/course/${id}/edit` as any)
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
                  <Feather name="edit-2" size={18} color="white" />
                </TouchableOpacity>
              </View>

              <View>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.xxxl,
                    fontWeight: TYPOGRAPHY.weight.bold,
                    color: "white",
                    marginBottom: 8,
                  }}
                >
                  {course.title}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    gap: SPACING.sm,
                    flexWrap: "wrap",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      paddingHorizontal: SPACING.lg,
                      paddingVertical: 4,
                      borderRadius: RADIUS.md,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 11,
                        fontWeight: TYPOGRAPHY.weight.bold,
                      }}
                    >
                      {(
                        LEVEL_LABELS[course.level] ?? course.level
                      ).toUpperCase()}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      paddingHorizontal: SPACING.lg,
                      paddingVertical: 4,
                      borderRadius: RADIUS.md,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 11,
                        fontWeight: TYPOGRAPHY.weight.bold,
                      }}
                    >
                      {course.price.toLocaleString()} ₸ / МЕС
                    </Text>
                  </View>
                  {course.status !== "active" && (
                    <View
                      style={{
                        backgroundColor: "rgba(255,100,100,0.35)",
                        paddingHorizontal: SPACING.lg,
                        paddingVertical: 4,
                        borderRadius: RADIUS.md,
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 11,
                          fontWeight: TYPOGRAPHY.weight.bold,
                        }}
                      >
                        {course.status === "draft" ? "НА МОДЕРАЦИИ" : "АРХИВ"}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </MotiView>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: paddingX,
          paddingTop: SPACING.xl,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        {course.description ? (
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: SPACING.md,
                marginBottom: SPACING.md,
              }}
            >
              <Feather name="book-open" size={18} color={COLORS.primary} />
              <Text
                style={{
                  fontSize: TYPOGRAPHY.size.lg,
                  fontWeight: TYPOGRAPHY.weight.semibold,
                  color: COLORS.foreground,
                }}
              >
                Описание
              </Text>
            </View>
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.md,
                color: COLORS.foreground,
                fontWeight: TYPOGRAPHY.weight.medium,
                lineHeight: 24,
                opacity: 0.8,
              }}
            >
              {course.description}
            </Text>
          </View>
        ) : null}

        {/* Skills */}
        {course.skills.length > 0 && (
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
                fontSize: TYPOGRAPHY.size.lg,
                fontWeight: TYPOGRAPHY.weight.semibold,
                color: COLORS.foreground,
                marginBottom: SPACING.lg,
              }}
            >
              Развиваемые навыки
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {course.skills.map((skill, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: "rgba(108, 92, 231, 0.07)",
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: RADIUS.lg,
                    borderWidth: 1,
                    borderColor: "rgba(108, 92, 231, 0.15)",
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.primary,
                      fontWeight: TYPOGRAPHY.weight.bold,
                      fontSize: 13,
                    }}
                  >
                    {skill}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Groups */}
        <View
          style={{
            marginBottom: SPACING.md,
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
            }}
          >
            Группы курса
          </Text>
          <TouchableOpacity
            onPress={() =>
              router.push(`/organization/group/create?courseId=${id}` as any)
            }
          >
            <Text
              style={{
                color: COLORS.primary,
                fontWeight: TYPOGRAPHY.weight.bold,
              }}
            >
              + Добавить
            </Text>
          </TouchableOpacity>
        </View>

        {courseGroups.length === 0 ? (
          <View
            style={{
              alignItems: "center",
              paddingVertical: 32,
              backgroundColor: COLORS.white,
              borderRadius: RADIUS.xxl,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Feather name="users" size={28} color={COLORS.mutedForeground} />
            <Text
              style={{
                marginTop: 10,
                color: COLORS.mutedForeground,
                fontWeight: TYPOGRAPHY.weight.semibold,
                textAlign: "center",
              }}
            >
              Нет групп для этого курса
            </Text>
          </View>
        ) : (
          <View style={{ gap: SPACING.sm }}>
            {courseGroups.map((group) => (
              <TouchableOpacity
                key={group.id}
                onPress={() =>
                  router.push(`/organization/group/${group.id}` as any)
                }
                style={{
                  ...SHADOWS.sm,
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
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: SPACING.md,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.size.md,
                        fontWeight: TYPOGRAPHY.weight.semibold,
                        color: COLORS.foreground,
                        marginBottom: 4,
                      }}
                    >
                      {group.name}
                    </Text>
                    {group.schedule ? (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Feather
                          name="clock"
                          size={12}
                          color={COLORS.mutedForeground}
                        />
                        <Text
                          style={{
                            fontSize: TYPOGRAPHY.size.xs,
                            color: COLORS.mutedForeground,
                            fontWeight: TYPOGRAPHY.weight.medium,
                          }}
                        >
                          {group.schedule}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <View
                    style={{
                      backgroundColor: COLORS.background,
                      paddingHorizontal: SPACING.md,
                      paddingVertical: 4,
                      borderRadius: RADIUS.lg,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Feather name="users" size={12} color={COLORS.primary} />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: TYPOGRAPHY.weight.bold,
                        color: COLORS.primary,
                      }}
                    >
                      {group.enrolled}/{group.capacity}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
