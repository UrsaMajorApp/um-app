import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SHADOWS, TYPOGRAPHY } from "$constants/theme";
import { useAuth } from "$contexts/AuthContext";
import { useTeacherGroups } from "$hooks/usePlatformData";
import { getDashboardHorizontalPadding, useIsDesktop } from "$lib/useIsDesktop";

function scheduleTimeLabel(schedule: string | null) {
  const match = schedule?.match(/\b([01]?\d|2[0-3]):[0-5]\d\b/);
  return match?.[0] ?? "—";
}

export default function TeacherHome() {
  const router = useRouter();
  const { user } = useAuth();
  const { groups, studentCounts, loading } = useTeacherGroups();
  const isDesktop = useIsDesktop();
  const paddingX = getDashboardHorizontalPadding(isDesktop);
  const activeGroups = groups.filter((group) => group.active);
  const nextGroup = activeGroups[0] ?? null;
  const teacherName =
    user?.firstName && user.firstName !== "Dev" ? user.firstName : "учитель";

  const today = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <LinearGradient
          colors={COLORS.gradients.header as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <SafeAreaView edges={["top"]}>
            <View
              style={[styles.headerContent, { paddingHorizontal: paddingX }]}
            >
              <View>
                <Text style={styles.greeting}>Добрый день, {teacherName}!</Text>
                <Text style={styles.dateText}>{today}</Text>
              </View>
              <View style={styles.notificationBtn}>
                <Feather name="bell" size={20} color="white" />
              </View>
            </View>

            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={[styles.nextLessonCard, { marginHorizontal: paddingX }]}
            >
              {loading ? (
                <View style={styles.loadingBlock}>
                  <ActivityIndicator size="small" color="white" />
                </View>
              ) : nextGroup ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() =>
                    router.push(`/teacher/group/${nextGroup.id}/journal` as any)
                  }
                >
                  <View style={styles.nextLessonHeader}>
                    <View style={styles.nextTag}>
                      <Text style={styles.nextTagText}>БЛИЖАЙШАЯ ГРУППА</Text>
                    </View>
                    <Text style={styles.timerText}>
                      {scheduleTimeLabel(nextGroup.schedule)}
                    </Text>
                  </View>

                  <Text style={styles.lessonTitle}>
                    {nextGroup.course_title || nextGroup.name}
                  </Text>
                  <Text style={styles.groupSubtitle}>
                    {nextGroup.name}
                    {nextGroup.schedule ? ` • ${nextGroup.schedule}` : ""}
                  </Text>

                  <View style={styles.lessonFooter}>
                    <View style={styles.timeInfo}>
                      <Feather name="users" size={16} color="white" />
                      <Text style={styles.timeText}>
                        {studentCounts[nextGroup.id] ?? 0} /{" "}
                        {nextGroup.capacity}
                      </Text>
                    </View>
                    <View style={styles.startButton}>
                      <Text style={styles.startButtonText}>Журнал</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ) : (
                <View>
                  <Text style={styles.lessonTitle}>Групп пока нет</Text>
                  <Text style={styles.groupSubtitle}>
                    Когда группы появятся в базе, они отобразятся здесь.
                  </Text>
                </View>
              )}
            </MotiView>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: paddingX },
        ]}
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/teacher/groups" as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#F5F3FF" }]}>
              <Feather name="users" size={24} color="#6C5CE7" />
            </View>
            <Text style={styles.actionLabel}>Мои группы</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Расписание групп</Text>
          <TouchableOpacity
            onPress={() => router.push("/teacher/groups" as any)}
          >
            <Text style={styles.seeAll}>Весь план</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.lessonList}>
          {loading && (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          )}

          {!loading && activeGroups.length === 0 && (
            <View style={styles.emptyState}>
              <Feather name="users" size={22} color={COLORS.mutedForeground} />
              <Text style={styles.emptyTitle}>Нет активных групп</Text>
              <Text style={styles.emptyText}>
                Группы появятся здесь после добавления в Supabase.
              </Text>
            </View>
          )}

          {!loading &&
            activeGroups.map((item, idx) => (
              <MotiView
                key={item.id}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: 300 + idx * 100 }}
                style={styles.scheduleItem}
              >
                <View style={styles.timeColumn}>
                  <Text style={styles.scheduleTime}>
                    {scheduleTimeLabel(item.schedule)}
                  </Text>
                  <View style={styles.timeDot} />
                </View>
                <TouchableOpacity
                  style={styles.scheduleCard}
                  onPress={() =>
                    router.push(`/teacher/group/${item.id}/journal` as any)
                  }
                >
                  <View style={styles.scheduleCardContent}>
                    <Text style={styles.scheduleTitle}>
                      {item.course_title || item.name}
                    </Text>
                    <Text style={styles.scheduleGroup}>
                      {item.name}
                      {item.schedule ? ` • ${item.schedule}` : ""}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color="#C7C7CC" />
                </TouchableOpacity>
              </MotiView>
            ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHeader: {
    overflow: "hidden",
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 0 : 20,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginBottom: 20,
  },
  greeting: {
    fontSize: TYPOGRAPHY.size.xxxl,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.white,
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
  },
  dateText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  nextLessonCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  loadingBlock: {
    minHeight: 104,
    alignItems: "center",
    justifyContent: "center",
  },
  nextLessonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  nextTag: {
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  nextTagText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#6C5CE7",
  },
  timerText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "700",
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "white",
    marginBottom: 4,
  },
  groupSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 16,
  },
  lessonFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  startButton: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    ...SHADOWS.sm,
  },
  startButtonText: {
    color: "#6C5CE7",
    fontWeight: "800",
    fontSize: 14,
  },
  scrollContent: {
    paddingTop: 32,
    paddingBottom: 100,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 32,
  },
  actionCard: {
    alignItems: "center",
    gap: 10,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.foreground,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.foreground,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  lessonList: {
    gap: 0,
  },
  emptyState: {
    minHeight: 120,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    ...SHADOWS.sm,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.foreground,
  },
  emptyText: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 13,
    color: COLORS.mutedForeground,
  },
  scheduleItem: {
    flexDirection: "row",
    gap: 16,
  },
  timeColumn: {
    alignItems: "center",
    width: 45,
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.foreground,
  },
  timeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 8,
    borderWidth: 2,
    borderColor: "white",
    ...SHADOWS.sm,
  },
  scheduleCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  scheduleCardContent: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.foreground,
  },
  scheduleGroup: {
    fontSize: 13,
    color: COLORS.mutedForeground,
    marginTop: 4,
  },
});
