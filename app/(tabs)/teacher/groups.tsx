import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { appHref } from "$lib/router";
import { MotiView } from "moti";
import React from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    COLORS,
    SHADOWS
} from "$constants/theme";
import { useTeacherGroups } from "$hooks/usePlatformData";
import { getDashboardHorizontalPadding, useIsDesktop } from "$lib/useIsDesktop";
import type { WebViewStyle } from "$types/styles";

export default function TeacherGroupsScreen() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = getDashboardHorizontalPadding(isDesktop);

  const { groups, studentCounts } = useTeacherGroups();

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F7FF" }}>
      <View style={{ backgroundColor: COLORS.primary, overflow: "hidden" }}>
        <LinearGradient
          colors={COLORS.gradients.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: Platform.OS === "ios" ? 0 : 20 }}
        >
          <SafeAreaView edges={["top"]}>
            <View
              style={{
                paddingHorizontal: paddingX,
                paddingTop: 12,
                paddingBottom: 32,
              }}
            >
              <Text style={styles.headerTitle}>Мои группы</Text>
              <Text style={styles.headerSubtitle}>
                {groups.length} {groups.length === 1 ? "группа" : "групп"}
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: paddingX,
          paddingTop: 20,
          paddingBottom: 100,
        }}
      >
        {groups.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Feather name="users" size={32} color={COLORS.mutedForeground} />
            </View>
            <Text style={styles.emptyTitle}>Нет групп</Text>
            <Text style={styles.emptySub}>Вы пока не назначены на группы</Text>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {groups.map((group, idx) => (
              <MotiView
                key={group.id}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: idx * 100 }}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() =>
                    router.push(appHref(`/teacher/group/${group.id}`))
                  }
                  style={styles.groupCard}
                >
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      <Text style={styles.courseTitle}>
                        {group.course_title}
                      </Text>
                    </View>
                    <Feather
                      name="chevron-right"
                      size={20}
                      color={COLORS.mutedForeground}
                    />
                  </View>

                  <View style={styles.cardInfoRow}>
                    <View style={styles.infoItem}>
                      <View style={styles.infoIconBox}>
                        <Feather name="users" size={14} color="#6C5CE7" />
                      </View>
                      <Text style={styles.infoText}>
                        {studentCounts[group.id] ?? 0} / {group.capacity}{" "}
                        учеников
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <View style={styles.infoIconBox}>
                        <Feather name="clock" size={14} color="#6C5CE7" />
                      </View>
                      <Text style={styles.infoText}>{group.schedule}</Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <View
                      style={[
                        styles.statusBadge,
                        group.active
                          ? styles.statusActive
                          : styles.statusInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          group.active
                            ? styles.statusActiveText
                            : styles.statusInactiveText,
                        ]}
                      >
                        {group.active ? "Активна" : "Неактивна"}
                      </Text>
                    </View>
                    {(studentCounts[group.id] ?? 0) >= group.capacity && (
                      <View style={styles.fullBadge}>
                        <Text style={styles.fullText}>Группа заполнена</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </MotiView>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    ...Platform.select({
      web: { backdropFilter: "blur(10px)" } as WebViewStyle,
      ios: {},
    }),
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "white",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
    fontWeight: "500",
  },
  groupCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.foreground,
  },
  courseTitle: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  cardInfoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    fontSize: 13,
    color: COLORS.mutedForeground,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusActive: { backgroundColor: "#F0FDF4" },
  statusInactive: { backgroundColor: "#F9FAFB" },
  statusText: { fontSize: 11, fontWeight: "700" },
  statusActiveText: { color: "#16A34A" },
  statusInactiveText: { color: "#6B7280" },
  fullBadge: {
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  fullText: { fontSize: 11, fontWeight: "700", color: "#D97706" },
  emptyState: { alignItems: "center", padding: 40 },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: COLORS.foreground },
  emptySub: {
    fontSize: 14,
    color: COLORS.mutedForeground,
    marginTop: 4,
    textAlign: "center",
  },
});
