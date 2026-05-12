// Экран organization/tasks: загружает и показывает задания в кабинете организации.
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, LAYOUT, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { useOrgTasks } from '$hooks/useOrgData';
import { navigateApp } from '$lib/appNavigation';
import { useIsDesktop } from '$lib/useIsDesktop';

export default function OrgTasks() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = isDesktop ? LAYOUT.dashboardHorizontalPaddingDesktop : SPACING.xl;
  const { user } = useAuth();
  const [selectedClub, setSelectedClub] = useState('all');
  const { tasks: allTasks, loading } = useOrgTasks();

  // Build clubs list dynamically from fetched tasks
  const clubs = [
    { id: 'all', name: 'Все кружки' },
    ...Array.from(new Set(allTasks.map((t) => t.club).filter(Boolean))).map((c) => ({
      id: c as string,
      name: c as string,
    })),
  ];

  const filtered =
    selectedClub === 'all' ? allTasks : allTasks.filter((t) => t.club === selectedClub);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header - Unified Brand Style */}
      <View
        style={{
          backgroundColor: COLORS.primary,
          borderBottomLeftRadius: RADIUS.xxl,
          borderBottomRightRadius: RADIUS.xxl,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={COLORS.gradients.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingBottom: SPACING.xl }}
        >
          <SafeAreaView edges={['top']}>
            <View style={{ paddingHorizontal: paddingX, paddingTop: SPACING.md }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: SPACING.xl,
                }}
              >
                <PressableScale
                  onPress={() => router.back()}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: RADIUS.md,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: SPACING.md,
                  }}
                >
                  <Feather name="arrow-left" size={20} color="white" />
                </PressableScale>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.xl,
                    fontWeight: TYPOGRAPHY.weight.semibold,
                    color: 'white',
                    flex: 1,
                  }}
                >
                  Задания
                </Text>
                <PressableScale
                  onPress={() => navigateApp(router, user?.role, { name: 'orgTaskCreate' })}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    paddingHorizontal: SPACING.lg,
                    height: 44,
                    borderRadius: RADIUS.md,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: TYPOGRAPHY.weight.bold,
                      fontSize: 13,
                    }}
                  >
                    + СОЗДАТЬ
                  </Text>
                </PressableScale>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1 px-1">
                {clubs.map((club) => (
                  <PressableScale
                    key={club.id}
                    onPress={() => setSelectedClub(club.id)}
                    style={{
                      paddingHorizontal: SPACING.lg,
                      paddingVertical: 10,
                      borderRadius: RADIUS.md,
                      marginRight: SPACING.sm,
                      backgroundColor:
                        selectedClub === club.id ? 'white' : 'rgba(255,255,255,0.15)',
                      borderWidth: 1,
                      borderColor: selectedClub === club.id ? 'white' : 'rgba(255,255,255,0.2)',
                    }}
                  >
                    <Text
                      style={{
                        color: selectedClub === club.id ? COLORS.primary : 'white',
                        fontWeight: TYPOGRAPHY.weight.bold,
                        fontSize: 13,
                      }}
                    >
                      {club.name}
                    </Text>
                  </PressableScale>
                ))}
              </ScrollView>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: paddingX,
          paddingTop: SPACING.xl,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <Text
            style={{
              textAlign: 'center',
              marginTop: 20,
              color: COLORS.mutedForeground,
            }}
          >
            Загрузка...
          </Text>
        )}
        {filtered.map((task, idx) => {
          const percent = Math.round(
            ((task.completed_students ?? 0) / Math.max(task.total_students, 1)) * 100,
          );
          return (
            <MotiView
              key={task.id}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: idx * 100 }}
            >
              <PressableScale
                style={{
                  ...SHADOWS.strict,
                  backgroundColor: COLORS.white,
                  borderRadius: RADIUS.xxl,
                  padding: SPACING.xl,
                  marginBottom: SPACING.lg,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: SPACING.lg,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.size.lg,
                        fontWeight: TYPOGRAPHY.weight.semibold,
                        color: COLORS.foreground,
                        marginBottom: 4,
                      }}
                    >
                      {task.title}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Feather name="book-open" size={12} color={COLORS.mutedForeground} />
                      <Text
                        style={{
                          fontSize: TYPOGRAPHY.size.xs,
                          color: COLORS.mutedForeground,
                          fontWeight: TYPOGRAPHY.weight.medium,
                        }}
                      >
                        {task.club}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      backgroundColor: 'rgba(108, 92, 231, 0.05)',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: RADIUS.lg,
                      borderWidth: 1,
                      borderColor: 'rgba(108, 92, 231, 0.1)',
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.primary,
                        fontWeight: TYPOGRAPHY.weight.bold,
                        fontSize: 11,
                      }}
                    >
                      +{task.xp_reward} XP
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: COLORS.background,
                    borderRadius: RADIUS.lg,
                    padding: SPACING.lg,
                    marginBottom: SPACING.xl,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: SPACING.sm,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Feather name="users" size={12} color={COLORS.mutedForeground} />
                      <Text
                        style={{
                          fontSize: 10,
                          color: COLORS.mutedForeground,
                          fontWeight: TYPOGRAPHY.weight.bold,
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                        }}
                      >
                        Кому
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: TYPOGRAPHY.weight.semibold,
                        color: COLORS.foreground,
                      }}
                    >
                      Все ученики
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Feather name="clock" size={12} color={COLORS.mutedForeground} />
                      <Text
                        style={{
                          fontSize: 10,
                          color: COLORS.mutedForeground,
                          fontWeight: TYPOGRAPHY.weight.bold,
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                        }}
                      >
                        Срок
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: TYPOGRAPHY.weight.semibold,
                        color: COLORS.foreground,
                      }}
                    >
                      {task.due_date}
                    </Text>
                  </View>
                </View>

                <View style={{ marginBottom: SPACING.xl }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.size.xs,
                        fontWeight: TYPOGRAPHY.weight.semibold,
                        color: COLORS.foreground,
                      }}
                    >
                      Прогресс выполнения
                    </Text>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.size.xs,
                        fontWeight: TYPOGRAPHY.weight.bold,
                        color: COLORS.primary,
                      }}
                    >
                      {task.completed_students}/{task.total_students}
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 6,
                      backgroundColor: COLORS.border,
                      borderRadius: RADIUS.full,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        width: `${percent}%`,
                        height: '100%',
                        backgroundColor: COLORS.primary,
                      }}
                    />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: SPACING.md }}>
                  <PressableScale
                    style={{
                      flex: 1,
                      height: 48,
                      backgroundColor: 'rgba(108, 92, 231, 0.1)',
                      borderRadius: RADIUS.lg,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.primary,
                        fontWeight: TYPOGRAPHY.weight.bold,
                        fontSize: 14,
                      }}
                    >
                      ПОДРОБНЕЕ
                    </Text>
                  </PressableScale>
                  <PressableScale
                    style={{
                      width: 48,
                      height: 48,
                      backgroundColor: 'rgba(239, 68, 68, 0.05)',
                      borderRadius: RADIUS.lg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(239, 68, 68, 0.1)',
                    }}
                  >
                    <Feather name="trash-2" size={18} color={COLORS.destructive} />
                  </PressableScale>
                </View>
              </PressableScale>
            </MotiView>
          );
        })}
      </ScrollView>
    </View>
  );
}
