// Экран mentor/students: загружает и показывает учеников в кабинете ментора.
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useState } from 'react';
import {
  FlatList, type ListRenderItem, StyleSheet, Text, TextInput, View } from 'react-native';
import { GradientScreenHeader } from '$components/ui/GradientScreenHeader';
import { PressableScale } from '$components/ui/PressableScale';
import { COLORS, SHADOWS } from '$constants/theme';
import {
  type GroupMember,
  useMentorOwnProfile,
  useMentorStudentAttendanceSummary,
  useMentorStudents,
} from '$hooks/useMentorData';
import { navigateApp } from '$lib/appNavigation';
import { getDashboardHorizontalPadding, useIsDesktop } from '$lib/useIsDesktop';
import type { FeatherIconName } from '$types/icons';
import type { WebTextStyle } from '$types/styles';

export default function MentorStudentsScreen() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = getDashboardHorizontalPadding(isDesktop);

  const { profile: mentorProfile } = useMentorOwnProfile();
  const canLoadStudents = mentorProfile?.status === 'approved';
  const { students } = useMentorStudents({ enabled: canLoadStudents });
  const { summary } = useMentorStudentAttendanceSummary({ enabled: canLoadStudents });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const filteredStudents = students.filter((s) =>
    s.student_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStudentStatus = (
    studentId: string,
  ): { color: string; label: string; icon: FeatherIconName } => {
    const data = summary[studentId];
    if (!data || data.total === 0)
      return { color: '#9CA3AF', label: 'Нет отметок', icon: 'minus-circle' };
    if (data.missed === 0) return { color: '#10B981', label: 'Всё ок', icon: 'check-circle' };
    if (data.missed <= 2)
      return {
        color: '#F59E0B',
        label: `Пропусков: ${data.missed}`,
        icon: 'alert-circle',
      };
    return {
      color: '#EF4444',
      label: 'Требует внимания',
      icon: 'alert-triangle',
    };
  };

  const renderStudent: ListRenderItem<GroupMember> = ({ item: student, index }) => {
    const status = getStudentStatus(student.id);
    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: index * 100 }}
        style={styles.card}
      >
        {/* Student Info Header */}
        <PressableScale
          activeOpacity={0.9}
          onPress={() =>
            navigateApp(router, 'mentor', {
              name: 'mentorStudentDetails',
              studentId: student.id,
            })
          }
          style={styles.cardHeader}
        >
          <View style={[styles.avatarContainer, { borderColor: status.color }]}>
            <LinearGradient colors={['#6C5CE7', '#8B7FE8']} style={styles.avatarGradient}>
              <Text style={styles.avatarText}>{student.student_name.charAt(0)}</Text>
            </LinearGradient>
            {/* Status indicator dot */}
            <View
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: status.color,
                borderWidth: 2,
                borderColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name={status.icon} size={8} color="white" />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.studentName}>{student.student_name}</Text>
            <Text style={styles.studentAge}>{student.student_age} лет</Text>
            {/* Status label */}
            <View style={[styles.nextSessionRow, { marginTop: 6 }]}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: status.color,
                  marginRight: 6,
                }}
              />
              <Text style={[styles.nextSessionText, { color: status.color, fontWeight: '600' }]}>
                {status.label}
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color={COLORS.mutedForeground} />
        </PressableScale>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Сессий</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{student.progress}%</Text>
            <Text style={styles.statLabel}>Прогресс</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${student.progress}%` }]} />
        </View>

        {/* Chat Button */}
        <PressableScale style={styles.chatBtn} onPress={() => router.push('/(tabs)/chats')}>
          <Feather name="message-circle" size={18} color="white" />
          <Text style={styles.chatBtnText}>Перейти в диалог</Text>
        </PressableScale>
      </MotiView>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <GradientScreenHeader
        title="Мои ученики"
        subtitle="Сопровождение и прогресс"
        paddingX={paddingX}
        variant="dashboard"
      >
        <View style={[styles.headerSearch, searchFocused && styles.headerSearchFocused]}>
          <Feather name="search" size={18} color="rgba(255,255,255,0.6)" />
          <TextInput
            placeholder="Поиск ученика..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            className="outline-none"
            style={[
              styles.headerSearchInput,
              { outlineWidth: 0 } satisfies WebTextStyle,
            ]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </View>
      </GradientScreenHeader>

      <FlatList
        data={filteredStudents}
        renderItem={renderStudent}
        contentContainerStyle={{
          paddingHorizontal: paddingX,
          paddingBottom: 100,
          paddingTop: 10,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ padding: 40, alignItems: 'center' }}>
            <MaterialCommunityIcons name="account-search-outline" size={64} color="#E5E7EB" />
            <Text style={{ color: COLORS.mutedForeground, marginTop: 16 }}>
              {canLoadStudents
                ? 'Ученики не найдены'
                : 'Ученики появятся после подтверждения анкеты'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerSearchFocused: {
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderColor: 'rgba(255,255,255,0.72)',
    boxShadow: '0 0 0 3px rgba(255,255,255,0.16)',
  },
  headerSearchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: 'white',
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#6C5CE7',
  },
  avatarGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
  },
  studentName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.foreground,
  },
  studentAge: {
    fontSize: 14,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  nextSessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  nextSessionText: {
    fontSize: 12,
    color: COLORS.mutedForeground,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6C5CE7',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6C5CE7',
    borderRadius: 4,
  },
  chatBtn: {
    backgroundColor: '#6C5CE7',
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.sm,
  },
  chatBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
});
