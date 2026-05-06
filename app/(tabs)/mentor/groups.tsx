import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
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
import { useMentorGroups } from "../../../hooks/useMentorData";
import { useIsDesktop } from "../../../lib/useIsDesktop";

export default function MentorGroups() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = useIsDesktop();
  const paddingX = isDesktop
    ? LAYOUT.dashboardHorizontalPaddingDesktop
    : SPACING.xl;

  const [search, setSearch] = useState("");
  const { groups, loading } = useMentorGroups();

  const filtered = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.course.toLowerCase().includes(search.toLowerCase()),
  );

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
                    fontSize: TYPOGRAPHY.size.xl,
                    fontWeight: TYPOGRAPHY.weight.semibold,
                    color: "white",
                    flex: 1,
                  }}
                >
                  Мои группы
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderRadius: RADIUS.md,
                  paddingHorizontal: SPACING.lg,
                  height: 52,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <Feather
                  name="search"
                  size={18}
                  color="rgba(255,255,255,0.6)"
                  style={{ marginRight: SPACING.sm }}
                />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Поиск по названию или курсу..."
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  style={{
                    color: "white",
                    flex: 1,
                    fontSize: 15,
                    fontWeight: "500",
                  }}
                />
              </View>
            </MotiView>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: paddingX,
          paddingTop: SPACING.xl,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <Text
            style={{
              textAlign: "center",
              marginTop: 40,
              color: COLORS.mutedForeground,
            }}
          >
            Загрузка...
          </Text>
        )}
        <View style={{ gap: SPACING.lg }}>
          {filtered.map((group) => (
            <Pressable
              key={group.id}
              onPress={() => router.push(`/mentor/group/${group.id}` as any)}
              style={{
                ...SHADOWS.strict,
                backgroundColor: COLORS.white,
                borderRadius: RADIUS.xxl,
                padding: SPACING.xl,
                borderWidth: 1,
                borderColor: COLORS.border,
                overflow: "hidden",
              }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.xs,
                      fontWeight: TYPOGRAPHY.weight.bold,
                      color: COLORS.primary,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 4,
                    }}
                  >
                    {group.course}
                  </Text>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.lg,
                      fontWeight: TYPOGRAPHY.weight.semibold,
                      color: COLORS.foreground,
                    }}
                  >
                    {group.name}
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: SPACING.md,
                    paddingVertical: SPACING.xs,
                    borderRadius: RADIUS.full,
                    backgroundColor: group.active
                      ? "rgba(52, 199, 89, 0.1)"
                      : COLORS.muted,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: TYPOGRAPHY.weight.bold,
                      textTransform: "uppercase",
                      color: group.active
                        ? COLORS.success
                        : COLORS.mutedForeground,
                    }}
                  >
                    {group.active ? "Активна" : "Архив"}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-6 mb-6">
                <View className="flex-row items-center gap-2">
                  <Feather
                    name="users"
                    size={16}
                    color={COLORS.mutedForeground}
                  />
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.sm,
                      color: COLORS.foreground,
                      fontWeight: TYPOGRAPHY.weight.medium,
                    }}
                  >
                    {group.student_count} уч.
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Feather
                    name="calendar"
                    size={16}
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
              </View>

              <View
                style={{
                  paddingTop: SPACING.lg,
                  borderTopWidth: 1,
                  borderTopColor: COLORS.border,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 10,
                      color: COLORS.mutedForeground,
                      fontWeight: TYPOGRAPHY.weight.bold,
                      textTransform: "uppercase",
                      marginBottom: 2,
                    }}
                  >
                    Расписание
                  </Text>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.md,
                      fontWeight: TYPOGRAPHY.weight.semibold,
                      color: COLORS.foreground,
                    }}
                  >
                    {group.schedule ?? "—"}
                  </Text>
                </View>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    backgroundColor: COLORS.muted,
                    borderRadius: RADIUS.md,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather
                    name="chevron-right"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
