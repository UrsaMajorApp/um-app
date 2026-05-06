import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, LAYOUT, SHADOWS } from "../../../../constants/theme";
import { useAuth } from "../../../../contexts/AuthContext";
import { useMentorStudents } from "../../../../hooks/useMentorData";
import { isSupabaseConfigured, supabase } from "../../../../lib/supabase";
import { getDashboardHorizontalPadding, useIsDesktop } from "../../../../lib/useIsDesktop";

export default function MentorStudentDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = useIsDesktop();
  const paddingX = getDashboardHorizontalPadding(isDesktop, 20);
  const { user } = useAuth();

  const { students, loading } = useMentorStudents();
  const student = students.find((s) => s.id === (id as string)) || students[0];

  // State for editable notes
  const [notes, setNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState(notes);
  const [notesLoading, setNotesLoading] = useState(true);

  // State for monthly report modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMonth, setReportMonth] = useState(
    new Date().toLocaleDateString("ru-RU", { month: "long", year: "numeric" }),
  );

  // Load notes from Supabase
  useEffect(() => {
    if (student?.id && user?.id) {
      loadNotes();
    }
  }, [student?.id, user?.id]);

  const loadNotes = async () => {
    if (!supabase || !isSupabaseConfigured || !student?.id || !user?.id) {
      setNotesLoading(false);
      return;
    }

    setNotesLoading(true);
    try {
      const { data, error } = await supabase
        .from("mentor_student_notes")
        .select("notes")
        .eq("mentor_id", user.id)
        .eq("student_id", student.id)
        .maybeSingle();

      if (!error && data) {
        setNotes(data.notes || "");
        setTempNotes(data.notes || "");
      } else if (!data) {
        // No notes yet, use default
        setNotes("");
        setTempNotes("");
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setNotesLoading(false);
    }
  };

  if (!student) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Ученик не найден</Text>
      </View>
    );
  }

  const handleSaveNotes = async () => {
    if (!supabase || !isSupabaseConfigured || !student?.id || !user?.id) {
      Alert.alert("Ошибка", "Не удалось сохранить заметки");
      return;
    }

    try {
      const { error } = await supabase.from("mentor_student_notes").upsert(
        {
          mentor_id: user.id,
          student_id: student.id,
          notes: tempNotes,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "mentor_id,student_id",
        },
      );

      if (error) {
        Alert.alert("Ошибка", error.message);
        return;
      }

      setNotes(tempNotes);
      setIsEditingNotes(false);
      Alert.alert("Сохранено", "Заметки успешно обновлены");
    } catch (error: any) {
      Alert.alert("Ошибка", error?.message || "Не удалось сохранить заметки");
    }
  };

  const handleGenerateReport = async () => {
    if (!supabase || !isSupabaseConfigured || !student?.id || !user?.id) {
      Alert.alert("Ошибка", "Не удалось создать отчёт");
      return;
    }

    try {
      // Get current month in YYYY-MM format
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      const reportData = {
        sessions_count: 0,
        progress_percentage: student.progress,
        average_rating: null,
        skills: studentDetails.skills.map((s) => ({
          label: s.label,
          value: s.value,
        })),
        highlights: notes,
        areas_for_improvement: "",
      };

      const { error } = await supabase.from("mentor_monthly_reports").insert({
        mentor_id: user.id,
        student_id: student.id,
        parent_id: null, // TODO: Get parent_id from student profile
        report_month: monthKey,
        report_data: reportData,
        sent_to_parent: true,
        sent_at: new Date().toISOString(),
      });

      if (error) {
        Alert.alert("Ошибка", error.message);
        return;
      }

      // TODO: Send push notification to parent

      Alert.alert(
        "Отчёт создан",
        `Месячный отчёт за ${reportMonth} отправлен родителю`,
        [{ text: "OK", onPress: () => setShowReportModal(false) }],
      );
    } catch (error: any) {
      Alert.alert("Ошибка", error?.message || "Не удалось создать отчёт");
    }
  };

  const skillMap = student.skills ?? {
    com: 0,
    lead: 0,
    cre: 0,
    log: 0,
    dis: 0,
  };
  const studentDetails = {
    parentName: null,
    parentPhone: null,
    city: null,
    school: null,
    grade: student.student_age
      ? `${student.student_age} лет`
      : "Возраст не указан",
    subjects: [] as string[],
    goals: null,
    skills: [
      { label: "Креативность", value: skillMap.cre ?? 0, color: "#6C5CE7" },
      { label: "Коммуникация", value: skillMap.com ?? 0, color: "#A78BFA" },
      { label: "Лидерство", value: skillMap.lead ?? 0, color: "#3B82F6" },
      { label: "Логика", value: skillMap.log ?? 0, color: "#10B981" },
    ],
    history: [] as Array<{
      id: string;
      date: string;
      subject: string;
      duration: string;
      rating: number;
    }>,
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient
          colors={COLORS.gradients.header as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <SafeAreaView edges={["top"]}>
            <View style={[styles.headerTop, { paddingHorizontal: paddingX }]}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backBtn}
              >
                <Feather name="arrow-left" size={20} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Профиль ученика</Text>
              <TouchableOpacity style={styles.editBtn}>
                <Feather name="edit-3" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={[styles.profileCard, { marginHorizontal: paddingX }]}
            >
              <View style={styles.profileHeader}>
                <View style={styles.avatarBox}>
                  <Text style={styles.avatarText}>
                    {student.student_name.charAt(0)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.studentName}>{student.student_name}</Text>
                  <Text style={styles.studentGrade}>
                    {studentDetails.grade}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>8</Text>
                  <Text style={styles.statLabel}>Сессий</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{student.progress}%</Text>
                  <Text style={styles.statLabel}>Прогресс</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="star"
                    size={24}
                    color="#FFD700"
                  />
                  <Text style={styles.statLabel}>Отличник</Text>
                </View>
              </View>
            </MotiView>
          </SafeAreaView>
        </LinearGradient>

        <View style={[styles.content, { paddingHorizontal: paddingX }]}>
          {/* Contact Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Контакты родителя</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Feather name="user" size={18} color="#6C5CE7" />
                <Text style={styles.infoText}>
                  {studentDetails.parentName || "Не указан"}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Feather name="phone" size={18} color="#6C5CE7" />
                <Text style={styles.infoText}>
                  {studentDetails.parentPhone || "Не указан"}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Feather name="map-pin" size={18} color="#6C5CE7" />
                <Text style={styles.infoText}>
                  {studentDetails.city || "Не указан"}
                </Text>
              </View>
            </View>
          </View>

          {/* Subjects & Goals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Направления и цели</Text>
            <View style={styles.tagsRow}>
              {studentDetails.subjects.length === 0 && (
                <Text style={styles.emptyText}>
                  Направления пока не указаны.
                </Text>
              )}
              {studentDetails.subjects.map((sub) => (
                <View key={sub} style={styles.tag}>
                  <Text style={styles.tagText}>{sub}</Text>
                </View>
              ))}
            </View>
            <View style={styles.goalCard}>
              <Text style={styles.goalText}>
                {studentDetails.goals || "Цели пока не указаны."}
              </Text>
            </View>
          </View>

          {/* Skills */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Развитие навыков</Text>
            <View style={styles.skillsCard}>
              {studentDetails.skills.map((skill, idx) => (
                <View
                  key={skill.label}
                  style={{
                    marginBottom:
                      idx === studentDetails.skills.length - 1 ? 0 : 16,
                  }}
                >
                  <View style={styles.skillHeader}>
                    <Text style={styles.skillLabel}>{skill.label}</Text>
                    <Text style={styles.skillValue}>{skill.value}%</Text>
                  </View>
                  <View style={styles.skillBarBg}>
                    <MotiView
                      from={{ width: 0 }}
                      animate={{ width: `${skill.value}%` as any }}
                      transition={{ duration: 1000, type: "timing" }}
                      style={[
                        styles.skillBarFill,
                        { backgroundColor: skill.color },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Session History */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>История сессий</Text>
            <View style={{ gap: 12 }}>
              {studentDetails.history.length === 0 && (
                <View style={styles.historyCard}>
                  <Text style={styles.emptyText}>Истории сессий пока нет.</Text>
                </View>
              )}
              {studentDetails.history.map((session) => (
                <View key={session.id} style={styles.historyCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historySubject}>{session.subject}</Text>
                    <Text style={styles.historyDate}>
                      {session.date} • {session.duration}
                    </Text>
                  </View>
                  <View style={styles.ratingRow}>
                    {[...Array(5)].map((_, i) => (
                      <MaterialCommunityIcons
                        key={i}
                        name={i < session.rating ? "star" : "star-outline"}
                        size={16}
                        color="#FFD700"
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Notes - Editable */}
          <View style={styles.section}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text style={styles.sectionTitle}>Заметки ментора</Text>
              {!isEditingNotes && (
                <TouchableOpacity
                  onPress={() => {
                    setTempNotes(notes);
                    setIsEditingNotes(true);
                  }}
                  style={styles.editNotesBtn}
                >
                  <Feather name="edit-2" size={14} color="#6C5CE7" />
                  <Text style={styles.editNotesBtnText}>Редактировать</Text>
                </TouchableOpacity>
              )}
            </View>
            {isEditingNotes ? (
              <View style={styles.notesEditCard}>
                <TextInput
                  value={tempNotes}
                  onChangeText={setTempNotes}
                  multiline
                  style={styles.notesInput}
                  placeholder="Добавьте заметки о ученике..."
                  placeholderTextColor="#9CA3AF"
                />
                <View style={styles.notesEditActions}>
                  <TouchableOpacity
                    onPress={() => setIsEditingNotes(false)}
                    style={styles.notesCancelBtn}
                  >
                    <Text style={styles.notesCancelText}>Отмена</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveNotes}
                    style={styles.notesSaveBtn}
                  >
                    <Feather name="check" size={16} color="white" />
                    <Text style={styles.notesSaveText}>Сохранить</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.notesCard}>
                <Text style={styles.notesText}>{notes}</Text>
              </View>
            )}
          </View>

          {/* Monthly Report Button */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Отчётность</Text>
            <TouchableOpacity
              style={styles.reportBtn}
              onPress={() => setShowReportModal(true)}
            >
              <View style={styles.reportBtnIcon}>
                <Feather name="file-text" size={22} color="#6C5CE7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reportBtnTitle}>Месячный отчёт</Text>
                <Text style={styles.reportBtnSubtitle}>
                  Создать и отправить родителю
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                color={COLORS.mutedForeground}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Monthly Report Modal */}
      <Modal visible={showReportModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Месячный отчёт</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Feather name="x" size={24} color={COLORS.mutedForeground} />
              </TouchableOpacity>
            </View>

            <View style={styles.reportPreview}>
              <View style={styles.reportPreviewHeader}>
                <Feather name="file-text" size={32} color="#6C5CE7" />
                <Text style={styles.reportPreviewTitle}>
                  Отчёт: {student.student_name}
                </Text>
                <Text style={styles.reportPreviewMonth}>{reportMonth}</Text>
              </View>

              <View style={styles.reportStats}>
                <View style={styles.reportStatItem}>
                  <Text style={styles.reportStatValue}>0</Text>
                  <Text style={styles.reportStatLabel}>Сессий проведено</Text>
                </View>
                <View style={styles.reportStatItem}>
                  <Text style={styles.reportStatValue}>
                    {student.progress}%
                  </Text>
                  <Text style={styles.reportStatLabel}>Общий прогресс</Text>
                </View>
                <View style={styles.reportStatItem}>
                  <Text style={styles.reportStatValue}>—</Text>
                  <Text style={styles.reportStatLabel}>Средняя оценка</Text>
                </View>
              </View>

              <View style={styles.reportSkillsSummary}>
                <Text style={styles.reportSkillsTitle}>Развитые навыки:</Text>
                <View style={styles.reportSkillsList}>
                  {studentDetails.skills.map((skill) => (
                    <View key={skill.label} style={styles.reportSkillItem}>
                      <View
                        style={[
                          styles.reportSkillDot,
                          { backgroundColor: skill.color },
                        ]}
                      />
                      <Text style={styles.reportSkillLabel}>
                        {skill.label}: {skill.value}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.generateBtn}
              onPress={handleGenerateReport}
            >
              <LinearGradient
                colors={["#6C5CE7", "#A78BFA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.generateBtnGradient}
              >
                <Feather name="send" size={18} color="white" />
                <Text style={styles.generateBtnText}>Отправить родителю</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7FF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 32,
    padding: 24,
    marginTop: 20,
    ...SHADOWS.lg,
  },
  profileHeader: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5F3FF",
    borderWidth: 4,
    borderColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#6C5CE7",
  },
  studentName: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.foreground,
  },
  studentGrade: {
    fontSize: 14,
    color: COLORS.mutedForeground,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#F8F7FF",
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E5E7EB",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#6C5CE7",
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    fontWeight: "600",
    marginTop: 2,
  },
  content: {
    paddingTop: 32,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.foreground,
    marginBottom: 16,
  },
  emptyText: {
    color: COLORS.mutedForeground,
    fontSize: 13,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    gap: 16,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: COLORS.foreground,
    fontWeight: "500",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  tagText: {
    color: "#6C5CE7",
    fontWeight: "700",
    fontSize: 13,
  },
  goalCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  goalText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.foreground,
  },
  skillsCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  skillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  skillLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.foreground,
  },
  skillValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#6C5CE7",
  },
  skillBarBg: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  skillBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  historyCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  historySubject: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.foreground,
  },
  historyDate: {
    fontSize: 13,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    gap: 2,
  },
  notesCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#92400E",
  },
  editNotesBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F5F3FF",
    borderRadius: 12,
  },
  editNotesBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6C5CE7",
  },
  notesEditCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    borderWidth: 2,
    borderColor: "#6C5CE7",
    ...SHADOWS.sm,
  },
  notesInput: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.foreground,
    minHeight: 100,
    textAlignVertical: "top",
  },
  notesEditActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  notesCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  notesCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.mutedForeground,
  },
  notesSaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#6C5CE7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  notesSaveText: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
  },
  reportBtn: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  reportBtnIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  reportBtnTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.foreground,
  },
  reportBtnSubtitle: {
    fontSize: 13,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.foreground,
  },
  reportPreview: {
    backgroundColor: "#F8F7FF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  reportPreviewHeader: {
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  reportPreviewTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.foreground,
    marginTop: 12,
  },
  reportPreviewMonth: {
    fontSize: 14,
    color: COLORS.mutedForeground,
    marginTop: 4,
  },
  reportStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  reportStatItem: {
    alignItems: "center",
  },
  reportStatValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#6C5CE7",
  },
  reportStatLabel: {
    fontSize: 11,
    color: COLORS.mutedForeground,
    marginTop: 4,
    textAlign: "center",
  },
  reportSkillsSummary: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
  },
  reportSkillsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.foreground,
    marginBottom: 12,
  },
  reportSkillsList: {
    gap: 8,
  },
  reportSkillItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reportSkillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reportSkillLabel: {
    fontSize: 13,
    color: COLORS.foreground,
  },
  generateBtn: {
    borderRadius: 20,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  generateBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
  },
  generateBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
  mainActionBtn: {
    marginTop: 8,
    borderRadius: 20,
    overflow: "hidden",
    ...SHADOWS.md,
  },
  actionGradient: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
});
