// Экран teacher/index: загружает и показывает index в кабинете преподавателя.
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCHEDULE_TOKENS } from '$constants/calendar';
import { COLORS, SHADOWS } from '$constants/theme';
import { useTeacherGroup } from '$hooks/usePlatformData';
import { useTeacherAttendanceEditor } from '$hooks/useTeacherAttendanceEditor';
import { navigateApp } from '$lib/appNavigation';
import { formatDateKey } from '$lib/date';
import { getDashboardHorizontalPadding, useIsDesktop } from '$lib/useIsDesktop';

export default function TeacherGroupDetail() {
  const { id } = useLocalSearchParams();
  const groupId = Array.isArray(id) ? id[0] : (id ?? '');
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = getDashboardHorizontalPadding(isDesktop, 20);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedDateKey = formatDateKey(selectedDate);
  const {
    group,
    students,
    attendance: savedAttendance,
    loading,
    saveAttendance,
  } = useTeacherGroup(groupId, selectedDateKey);
  const attendanceEditor = useTeacherAttendanceEditor(savedAttendance, saveAttendance);

  const daysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return d === 0 ? 6 : d - 1; // 0 is Mon, 6 is Sun
  };

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const isLessonDay = (date: Date) => {
    if (!group?.schedule) return true;
    const tokens = SCHEDULE_TOKENS[date.getDay()];
    return tokens.some((token) => group.schedule?.toLowerCase().includes(token.toLowerCase()));
  };

  const saveReport = async () => {
    const result = await attendanceEditor.submitAttendance({
      includeComments: true,
    });
    if (result.error) {
      Alert.alert('Ошибка', result.error);
      return;
    }
    Alert.alert('Готово', 'Посещаемость сохранена');
  };

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth);
    const padding = firstDayOfMonth(currentMonth);

    for (let i = 0; i < padding; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDayEmpty} />);
    }

    for (let i = 1; i <= totalDays; i++) {
      const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const isSelected = dayDate.toDateString() === selectedDate.toDateString();
      const isToday = dayDate.toDateString() === new Date().toDateString();
      const isLesson = isLessonDay(dayDate);

      days.push(
        <PressableScale
          key={i}
          onPress={() => isLesson && setSelectedDate(dayDate)}
          disabled={!isLesson}
          style={[
            styles.calendarDay,
            isLesson && styles.calendarDayLesson,
            isSelected && styles.calendarDaySelected,
            isToday && !isSelected && styles.calendarDayToday,
          ]}
        >
          <Text
            style={[
              styles.calendarDayText,
              !isLesson && styles.calendarDayTextDisabled,
              isSelected && styles.calendarDayTextSelected,
            ]}
          >
            {i}
          </Text>
          {isLesson && !isSelected && <View style={styles.lessonDot} />}
        </PressableScale>,
      );
    }

    return days;
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
            <Text style={styles.headerSubtitle}>
              {group?.name || '—'}
              {group?.schedule ? ` • ${group.schedule}` : ''}
            </Text>
          </View>
          <PressableScale
            onPress={() => navigateApp(router, 'teacher', { name: 'teacherJournal', groupId })}
            style={styles.journalBtn}
          >
            <Feather name="file-text" size={20} color={COLORS.primary} />
          </PressableScale>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: paddingX,
            paddingBottom: 100,
          }}
        >
          {/* Calendar Card */}
          <View style={styles.calendarCard}>
            <LinearGradient
              colors={COLORS.gradients.header}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.calendarHeader}
            >
              <PressableScale onPress={() => changeMonth(-1)}>
                <Feather name="chevron-left" size={20} color="white" />
              </PressableScale>
              <Text style={styles.calendarMonth}>
                {currentMonth.toLocaleDateString('ru-RU', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <PressableScale onPress={() => changeMonth(1)}>
                <Feather name="chevron-right" size={20} color="white" />
              </PressableScale>
            </LinearGradient>

            <View style={styles.weekDays}>
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
                <Text key={d} style={styles.weekDayText}>
                  {d}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>{renderCalendar()}</View>
          </View>

          {/* Attendance Section */}
          <View style={styles.attendanceSection}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Посещаемость</Text>
                <Text style={styles.sectionDate}>
                  {selectedDate.toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                  })}
                </Text>
              </View>
              {attendanceEditor.hasAttendanceSelection && (
                <PressableScale
                  onPress={saveReport}
                  disabled={attendanceEditor.saving}
                  style={styles.saveActionBtn}
                >
                  <Text style={styles.saveActionText}>
                    {attendanceEditor.saving ? '...' : 'Сохранить'}
                  </Text>
                </PressableScale>
              )}
            </View>

            <View style={{ gap: 16 }}>
              {!loading && students.length === 0 && (
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
              {students.map((student) => (
                <View key={student.id} style={styles.studentCard}>
                  <View style={styles.studentInfo}>
                    <View style={styles.studentAvatar}>
                      <Text style={styles.avatarText}>{student.student_name.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.studentName}>{student.student_name}</Text>
                      <Text style={styles.studentSub}>
                        {student.student_age ? `${student.student_age} лет` : 'Возраст не указан'}
                        {student.status_label ? ` • ${student.status_label}` : ''}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <PressableScale
                      onPress={() => attendanceEditor.toggleStatus(student.id, 'present')}
                      style={[
                        styles.statusBtn,
                        attendanceEditor.attendance[student.id] === 'present' &&
                          styles.statusBtnPresent,
                      ]}
                    >
                      <Feather
                        name="check"
                        size={16}
                        color={
                          attendanceEditor.attendance[student.id] === 'present'
                            ? 'white'
                            : '#16A34A'
                        }
                      />
                      <Text
                        style={[
                          styles.statusBtnText,
                          attendanceEditor.attendance[student.id] === 'present' &&
                            styles.statusBtnTextActive,
                        ]}
                      >
                        Был
                      </Text>
                    </PressableScale>

                    <PressableScale
                      onPress={() => attendanceEditor.toggleStatus(student.id, 'absent')}
                      style={[
                        styles.statusBtn,
                        attendanceEditor.attendance[student.id] === 'absent' &&
                          styles.statusBtnAbsent,
                      ]}
                    >
                      <Feather
                        name="x"
                        size={16}
                        color={
                          attendanceEditor.attendance[student.id] === 'absent' ? 'white' : '#EF4444'
                        }
                      />
                      <Text
                        style={[
                          styles.statusBtnText,
                          attendanceEditor.attendance[student.id] === 'absent' &&
                            styles.statusBtnTextActive,
                        ]}
                      >
                        Не был
                      </Text>
                    </PressableScale>
                  </View>

                  <TextInput
                    style={styles.commentInput}
                    placeholder="Комментарий к занятию..."
                    multiline
                    numberOfLines={2}
                    value={attendanceEditor.comments[student.id]}
                    onChangeText={(v) => attendanceEditor.setStudentComment(student.id, v)}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Bottom Primary Action */}
          <PressableScale
            activeOpacity={0.8}
            onPress={saveReport}
            disabled={attendanceEditor.saving}
            style={styles.mainSaveBtn}
          >
            <LinearGradient
              colors={['#6C5CE7', '#A78BFA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.mainSaveBtnGradient}
            >
              {attendanceEditor.saving ? (
                <Text style={styles.mainSaveBtnText}>Сохранение...</Text>
              ) : (
                <>
                  <Feather name="send" size={20} color="white" />
                  <Text style={styles.mainSaveBtnText}>Отправить отчет</Text>
                </>
              )}
            </LinearGradient>
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
  journalBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.foreground,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  calendarCard: {
    backgroundColor: 'white',
    borderRadius: 32,
    marginTop: 24,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  calendarMonth: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  weekDays: {
    flexDirection: 'row',
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.mutedForeground,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  calendarDayEmpty: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
  },
  calendarDayLesson: {
    backgroundColor: '#F0FDF4',
  },
  calendarDaySelected: {
    backgroundColor: '#6C5CE7',
    ...SHADOWS.sm,
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: '#6C5CE7',
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.foreground,
  },
  calendarDayTextDisabled: {
    color: '#D1D5DB',
    fontWeight: '400',
  },
  calendarDayTextSelected: {
    color: 'white',
  },
  lessonDot: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#16A34A',
  },
  attendanceSection: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.foreground,
  },
  sectionDate: {
    fontSize: 14,
    color: COLORS.mutedForeground,
    marginTop: 4,
  },
  saveActionBtn: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  saveActionText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    ...SHADOWS.sm,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  studentSub: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statusBtnPresent: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  statusBtnAbsent: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  statusBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  statusBtnTextActive: {
    color: 'white',
  },
  commentInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    fontSize: 14,
    color: COLORS.foreground,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  mainSaveBtn: {
    marginTop: 32,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  mainSaveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  mainSaveBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
});
