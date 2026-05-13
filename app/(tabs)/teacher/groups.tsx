// Экран teacher/groups: загружает и показывает группы обучения в кабинете преподавателя.
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GradientScreenHeader } from '$components/ui/GradientScreenHeader';
import { PressableScale } from '$components/ui/PressableScale';
import { COLORS, SHADOWS } from '$constants/theme';
import { useTeacherGroups } from '$hooks/usePlatformData';
import { navigateApp } from '$lib/appNavigation';
import { getDashboardHorizontalPadding, useIsDesktop } from '$lib/useIsDesktop';

export default function TeacherGroupsScreen() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = getDashboardHorizontalPadding(isDesktop);

  const { groups, studentCounts } = useTeacherGroups();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <GradientScreenHeader
        title="Мои группы"
        subtitle={`${groups.length} ${groups.length === 1 ? 'группа' : 'групп'}`}
        paddingX={paddingX}
        variant="dashboard"
      />

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
                <PressableScale
                  activeOpacity={0.9}
                  onPress={() =>
                    navigateApp(router, 'teacher', {
                      name: 'teacherGroupDetails',
                      groupId: group.id,
                    })
                  }
                  style={styles.groupCard}
                >
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      <Text style={styles.courseTitle}>{group.course_title}</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={COLORS.mutedForeground} />
                  </View>

                  <View style={styles.cardInfoRow}>
                    <View style={styles.infoItem}>
                      <View style={styles.infoIconBox}>
                        <Feather name="users" size={14} color="#6C5CE7" />
                      </View>
                      <Text style={styles.infoText}>
                        {studentCounts[group.id] ?? 0} / {group.capacity} учеников
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
                        group.active ? styles.statusActive : styles.statusInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          group.active ? styles.statusActiveText : styles.statusInactiveText,
                        ]}
                      >
                        {group.active ? 'Активна' : 'Неактивна'}
                      </Text>
                    </View>
                    {(studentCounts[group.id] ?? 0) >= group.capacity && (
                      <View style={styles.fullBadge}>
                        <Text style={styles.fullText}>Группа заполнена</Text>
                      </View>
                    )}
                  </View>
                </PressableScale>
              </MotiView>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  groupCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.foreground,
  },
  courseTitle: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  cardInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontSize: 13,
    color: COLORS.mutedForeground,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusActive: { backgroundColor: '#F0FDF4' },
  statusInactive: { backgroundColor: '#F9FAFB' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusActiveText: { color: '#16A34A' },
  statusInactiveText: { color: '#6B7280' },
  fullBadge: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  fullText: { fontSize: 11, fontWeight: '700', color: '#D97706' },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.foreground },
  emptySub: {
    fontSize: 14,
    color: COLORS.mutedForeground,
    marginTop: 4,
    textAlign: 'center',
  },
});
