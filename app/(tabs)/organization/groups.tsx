// Экран organization/groups: загружает и показывает группы обучения в кабинете организации.
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { ScrollView, Text, View } from 'react-native';
import { GradientScreenHeader } from '$components/ui/GradientScreenHeader';
import { PressableScale } from '$components/ui/PressableScale';
import { COLORS, LAYOUT, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { useOrgGroups } from '$hooks/useOrgData';
import { navigateApp } from '$lib/appNavigation';
import { useIsDesktop } from '$lib/useIsDesktop';

export default function OrgGroupsScreen() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = isDesktop ? LAYOUT.dashboardHorizontalPaddingDesktop : SPACING.xl;
  const { user } = useAuth();

  const { groups: rawGroups, loading } = useOrgGroups();
  // Map to the shape the UI expects
  const groups = rawGroups.map((g) => ({
    id: g.id,
    group_name: g.name,
    course_title: g.course ?? '',
    status: g.active ? ('active' as const) : ('inactive' as const),
    current_students: g.enrolled,
    max_students: g.capacity,
    teacher_name: undefined as string | undefined,
    schedule: g.schedule ?? undefined,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <GradientScreenHeader
        title="Группы"
        subtitle={`Всего групп: ${groups.length}`}
        paddingX={paddingX}
        variant="dashboard"
        rightAccessory={
          <PressableScale
            onPress={() => navigateApp(router, user?.role, { name: 'orgGroupCreate' })}
            style={{
              width: 52,
              height: 52,
              borderRadius: RADIUS.md,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name="plus" size={24} color="white" />
          </PressableScale>
        }
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: paddingX,
          paddingTop: SPACING.xl,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: COLORS.mutedForeground }}>Загрузка...</Text>
          </View>
        ) : groups.length === 0 ? (
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: RADIUS.xxl,
              padding: 40,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: COLORS.background,
                borderRadius: RADIUS.full,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: SPACING.xl,
              }}
            >
              <Feather name="users" size={32} color={COLORS.mutedForeground} />
            </View>
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.xl,
                fontWeight: TYPOGRAPHY.weight.bold,
                color: COLORS.foreground,
                marginBottom: 8,
              }}
            >
              Нет групп
            </Text>
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.sm,
                color: COLORS.mutedForeground,
                textAlign: 'center',
                marginBottom: SPACING.xl,
                lineHeight: 20,
              }}
            >
              Создайте первую группу для начала работы
            </Text>
            <PressableScale
              onPress={() => navigateApp(router, user?.role, { name: 'orgGroupCreate' })}
              style={{
                backgroundColor: COLORS.primary,
                paddingHorizontal: 32,
                height: 56,
                borderRadius: RADIUS.lg,
                alignItems: 'center',
                justifyContent: 'center',
                ...SHADOWS.md,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontWeight: TYPOGRAPHY.weight.bold,
                  fontSize: 16,
                }}
              >
                Создать группу
              </Text>
            </PressableScale>
          </View>
        ) : (
          <View style={{ gap: SPACING.lg }}>
            {groups.map((group, idx) => (
              <MotiView
                key={group.id}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: idx * 100 }}
              >
                <PressableScale
                  onPress={() =>
                    navigateApp(router, user?.role, {
                      name: 'orgGroupDetails',
                      groupId: group.id,
                    })
                  }
                  style={{
                    ...SHADOWS.strict,
                    backgroundColor: COLORS.white,
                    borderRadius: 40,
                    padding: SPACING.xl,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: SPACING.xl,
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
                        {group.group_name}
                      </Text>
                      <Text
                        style={{
                          fontSize: TYPOGRAPHY.size.sm,
                          color: COLORS.primary,
                          fontWeight: TYPOGRAPHY.weight.bold,
                        }}
                      >
                        {group.course_title}
                      </Text>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: RADIUS.lg,
                        backgroundColor:
                          group.status === 'active' ? 'rgba(52, 199, 89, 0.1)' : COLORS.background,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: TYPOGRAPHY.weight.bold,
                          color:
                            group.status === 'active' ? COLORS.success : COLORS.mutedForeground,
                        }}
                      >
                        {group.status === 'active' ? 'АКТИВНА' : 'НЕАКТИВНА'}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      rowGap: SPACING.sm,
                      marginBottom: SPACING.xl,
                    }}
                  >
                    <View
                      style={{
                        width: '50%',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <Feather name="users" size={14} color={COLORS.mutedForeground} />
                      <Text
                        style={{
                          fontSize: TYPOGRAPHY.size.sm,
                          color: COLORS.foreground,
                          fontWeight: TYPOGRAPHY.weight.medium,
                        }}
                      >
                        {group.current_students}/{group.max_students}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: '50%',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <Feather name="award" size={14} color={COLORS.mutedForeground} />
                      <Text
                        style={{
                          fontSize: TYPOGRAPHY.size.sm,
                          color: COLORS.foreground,
                          fontWeight: TYPOGRAPHY.weight.medium,
                        }}
                      >
                        {group.teacher_name || 'Не назначен'}
                      </Text>
                    </View>
                    {group.schedule && (
                      <View
                        style={{
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <Feather name="clock" size={14} color={COLORS.mutedForeground} />
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
                    )}
                  </View>

                  <PressableScale
                    onPress={() =>
                      navigateApp(router, user?.role, {
                        name: 'orgGroupDetails',
                        groupId: group.id,
                      })
                    }
                    style={{
                      height: 48,
                      backgroundColor: COLORS.background,
                      borderRadius: RADIUS.lg,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.foreground,
                        fontWeight: TYPOGRAPHY.weight.bold,
                        fontSize: 14,
                      }}
                    >
                      ПОДРОБНЕЕ
                    </Text>
                  </PressableScale>
                </PressableScale>
              </MotiView>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
