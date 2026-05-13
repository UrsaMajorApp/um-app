// Экран teacher/journal: загружает и показывает journal в кабинете преподавателя.
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '$constants/theme';
import { useTeacherGroup } from '$hooks/usePlatformData';
import { useTeacherAttendanceEditor } from '$hooks/useTeacherAttendanceEditor';
import { formatDateKey } from '$lib/date';
import { getDashboardHorizontalPadding, useIsDesktop } from '$lib/useIsDesktop';

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
  const attendanceEditor = useTeacherAttendanceEditor(savedAttendance, saveAttendance);

  const submitAttendance = async () => {
    await attendanceEditor.submitAttendance();
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: paddingX }]}>
          <PressableScale onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={COLORS.foreground} />
          </PressableScale>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.headerTitle}>{group?.course_title || 'Группа'}</Text>
            <Text style={styles.headerSubtitle}>{group?.name || '—'}</Text>
          </View>
        </View>

        {/* Date Selector */}
        <View style={[styles.dateSelector, { marginHorizontal: paddingX }]}>
          <PressableScale
            onPress={() =>
              setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))
            }
          >
            <Feather name="chevron-left" size={24} color={COLORS.foreground} />
          </PressableScale>
          <View style={styles.dateInfo}>
            <Feather name="calendar" size={16} color={COLORS.primary} />
            <Text style={styles.dateLabel}>
              {selectedDate.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
          <PressableScale
            onPress={() =>
              setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))
            }
          >
            <Feather name="chevron-right" size={24} color={COLORS.foreground} />
          </PressableScale>
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
              Учеников в списке: <Text style={{ color: COLORS.foreground }}>{students.length}</Text>
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            {students.length === 0 && (
              <Text
                style={{
                  color: COLORS.mutedForeground,
                  textAlign: 'center',
                  paddingVertical: 24,
                }}
              >
                В этой группе пока нет учеников.
              </Text>
            )}
            {students.map((student, idx) => {
              const isPresent = attendanceEditor.attendance[student.id] === 'present';
              const isAbsent = attendanceEditor.attendance[student.id] === 'absent';

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
                      <Text style={styles.avatarText}>{student.student_name.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.studentName}>{student.student_name}</Text>
                      <Text style={styles.studentDetails}>
                        {student.student_age ? `${student.student_age} лет` : 'Возраст не указан'}
                        {student.status_label ? ` • ${student.status_label}` : ''}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionsRow}>
                    <PressableScale
                      onPress={() => attendanceEditor.toggleStatus(student.id, 'present')}
                      style={[styles.actionBtn, isPresent && styles.btnPresent]}
                    >
                      <Feather name="check" size={24} color={isPresent ? 'white' : '#9CA3AF'} />
                    </PressableScale>
                    <PressableScale
                      onPress={() => attendanceEditor.toggleStatus(student.id, 'absent')}
                      style={[styles.actionBtn, isAbsent && styles.btnAbsent]}
                    >
                      <Feather name="x" size={24} color={isAbsent ? 'white' : '#9CA3AF'} />
                    </PressableScale>
                    <PressableScale style={styles.actionBtnMsg}>
                      <Feather name="message-square" size={20} color={COLORS.primary} />
                    </PressableScale>
                  </View>
                </MotiView>
              );
            })}
          </View>

          <PressableScale style={styles.submitBtn} onPress={submitAttendance}>
            <Feather name="send" size={20} color="white" />
            <Text style={styles.submitText}>Отправить отчет родителям</Text>
          </PressableScale>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: COLORS.foreground },
  headerSubtitle: { fontSize: 13, color: COLORS.mutedForeground, marginTop: 2 },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 12,
    marginVertical: 24,
  },
  dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateLabel: { fontSize: 15, fontWeight: '700', color: COLORS.foreground },
  listLabel: { fontSize: 14, color: COLORS.mutedForeground },
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  studentMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  studentName: { fontSize: 16, fontWeight: '700', color: COLORS.foreground },
  studentDetails: { fontSize: 12, color: COLORS.mutedForeground, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  actionBtnMsg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPresent: { backgroundColor: '#10B981', ...SHADOWS.sm },
  btnAbsent: { backgroundColor: '#EF4444', ...SHADOWS.sm },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 20,
    marginTop: 32,
    ...SHADOWS.md,
  },
  submitText: { color: 'white', fontSize: 16, fontWeight: '800' },
});
