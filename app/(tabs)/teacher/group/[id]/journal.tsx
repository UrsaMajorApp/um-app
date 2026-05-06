import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SHADOWS } from "../../../../../constants/theme";
import { useTeacherGroup } from "../../../../../hooks/usePlatformData";
import {
  getDashboardHorizontalPadding,
  useIsDesktop,
} from "../../../../../lib/useIsDesktop";

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function TeacherGroupJournal() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = getDashboardHorizontalPadding(isDesktop, 20);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedDateKey = formatDateKey(selectedDate);
  const {
    group,
    students,
    attendance: savedAttendance,
    saveAttendance,
  } = useTeacherGroup(id as string, selectedDateKey);
  const [attendance, setAttendance] = useState<
    Record<string, "present" | "absent" | null>
  >({});

  React.useEffect(() => {
    const next: Record<string, "present" | "absent" | null> = {};
    for (const entry of savedAttendance) next[entry.student_id] = entry.status;
    setAttendance(next);
  }, [savedAttendance]);

  const toggleAttendance = (
    studentId: string,
    status: "present" | "absent",
  ) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status,
    }));
  };

  const submitAttendance = async () => {
    const entries = Object.entries(attendance)
      .filter(
        (entry): entry is [string, "present" | "absent"] => entry[1] !== null,
      )
      .map(([studentId, status]) => ({ studentId, status }));
    await saveAttendance(entries);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F7FF" }}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: paddingX }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Feather name="arrow-left" size={20} color={COLORS.foreground} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.headerTitle}>
              {group?.course_title || "Группа"}
            </Text>
            <Text style={styles.headerSubtitle}>{group?.name || "—"}</Text>
          </View>
        </View>

        {/* Date Selector */}
        <View style={[styles.dateSelector, { marginHorizontal: paddingX }]}>
          <TouchableOpacity
            onPress={() =>
              setSelectedDate(
                new Date(selectedDate.setDate(selectedDate.getDate() - 1)),
              )
            }
          >
            <Feather name="chevron-left" size={24} color={COLORS.foreground} />
          </TouchableOpacity>
          <View style={styles.dateInfo}>
            <Feather name="calendar" size={16} color={COLORS.primary} />
            <Text style={styles.dateLabel}>
              {selectedDate.toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              setSelectedDate(
                new Date(selectedDate.setDate(selectedDate.getDate() + 1)),
              )
            }
          >
            <Feather name="chevron-right" size={24} color={COLORS.foreground} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: paddingX,
            paddingBottom: 100,
          }}
        >
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.listLabel}>
              Учеников в списке:{" "}
              <Text style={{ color: COLORS.foreground }}>
                {students.length}
              </Text>
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            {students.length === 0 && (
              <Text
                style={{
                  color: COLORS.mutedForeground,
                  textAlign: "center",
                  paddingVertical: 24,
                }}
              >
                В этой группе пока нет учеников.
              </Text>
            )}
            {students.map((student, idx) => {
              const isPresent = attendance[student.id] === "present";
              const isAbsent = attendance[student.id] === "absent";

              return (
                <MotiView
                  key={student.id}
                  from={{ opacity: 0, translateX: -10 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ delay: idx * 100 }}
                  style={styles.studentCard}
                >
                  <View style={styles.studentMain}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>
                        {student.student_name.charAt(0)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.studentName}>
                        {student.student_name}
                      </Text>
                      <Text style={styles.studentDetails}>
                        {student.student_age
                          ? `${student.student_age} лет`
                          : "Возраст не указан"}
                        {student.status_label
                          ? ` • ${student.status_label}`
                          : ""}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      onPress={() => toggleAttendance(student.id, "present")}
                      style={[styles.actionBtn, isPresent && styles.btnPresent]}
                    >
                      <Feather
                        name="check"
                        size={24}
                        color={isPresent ? "white" : "#9CA3AF"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleAttendance(student.id, "absent")}
                      style={[styles.actionBtn, isAbsent && styles.btnAbsent]}
                    >
                      <Feather
                        name="x"
                        size={24}
                        color={isAbsent ? "white" : "#9CA3AF"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtnMsg}>
                      <Feather
                        name="message-square"
                        size={20}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </MotiView>
              );
            })}
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={submitAttendance}>
            <Feather name="send" size={20} color="white" />
            <Text style={styles.submitText}>Отправить отчет родителям</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "900", color: COLORS.foreground },
  headerSubtitle: { fontSize: 13, color: COLORS.mutedForeground, marginTop: 2 },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    padding: 12,
    marginVertical: 24,
  },
  dateInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  dateLabel: { fontSize: 15, fontWeight: "700", color: COLORS.foreground },
  listLabel: { fontSize: 14, color: COLORS.mutedForeground },
  studentCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  studentMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "800", color: COLORS.primary },
  studentName: { fontSize: 16, fontWeight: "700", color: COLORS.foreground },
  studentDetails: { fontSize: 12, color: COLORS.mutedForeground, marginTop: 2 },
  actionsRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  actionBtnMsg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  btnPresent: { backgroundColor: "#10B981", ...SHADOWS.sm },
  btnAbsent: { backgroundColor: "#EF4444", ...SHADOWS.sm },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 20,
    marginTop: 32,
    ...SHADOWS.md,
  },
  submitText: { color: "white", fontSize: 16, fontWeight: "800" },
});
