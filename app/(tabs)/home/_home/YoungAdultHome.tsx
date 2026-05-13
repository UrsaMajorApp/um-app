// YoungAdultHome: собирает виджеты и быстрые действия домашнего экрана для роли young adult.
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { GradientScreenHeader } from '$components/ui/GradientScreenHeader';
import { PressableScale } from '$components/ui/PressableScale';
import { COLORS, SHADOWS } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { useParentData } from '$contexts/ParentDataContext';
import { courseGradient, usePublicCourses } from '$hooks/usePublicData';
import { navigateApp } from '$lib/appNavigation';
import { formatKZT } from '$lib/formatCurrency';
import { featherIconName } from '$lib/icons';
import { getDashboardHorizontalPadding, useIsDesktop } from '$lib/useIsDesktop';

export default function YoungAdultHome() {
  const router = useRouter();
  const { user } = useAuth();
  const { childrenProfile, activeChildId, parentProfile } = useParentData();
  const isDesktop = useIsDesktop();
  const horizontalPadding = getDashboardHorizontalPadding(isDesktop, 20);
  const { courses } = usePublicCourses();

  const activeProfile = childrenProfile.find((child) => child.id === activeChildId);
  const firstName = activeProfile?.name || user?.firstName || 'Студент';
  const diagnostic = activeProfile?.talentProfile;
  const isPro = parentProfile?.tariff === 'pro';
  const hasDiagnostic = Boolean(diagnostic);
  const hasProDiagnostic = diagnostic?.tier === 'pro';

  const openDiagnostic = () => {
    router.push({
      pathname: '/profile/youth/testing',
      params: activeProfile?.id ? { childId: activeProfile.id } : undefined,
    });
  };

  const topSkills = useMemo(() => {
    if (!diagnostic?.scores) return [];
    return Object.entries(diagnostic.scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [diagnostic]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <GradientScreenHeader
          title={`${firstName}, твой план`}
          subtitle="Самостоятельный трек"
          paddingX={horizontalPadding}
          variant="dashboard"
          rightAccessory={
            <PressableScale
              onPress={() => navigateApp(router, user?.role, { name: 'profile' })}
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="user" size={20} color="white" />
            </PressableScale>
          }
        />

        <View style={{ paddingHorizontal: horizontalPadding, paddingTop: 24, gap: 28 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {[
              {
                label: 'Календарь',
                icon: 'calendar' as const,
                color: '#3B82F6',
                action: () => navigateApp(router, user?.role, { name: 'calendar' }),
              },
              {
                label: 'Кружки',
                icon: 'book-open' as const,
                color: '#10B981',
                action: () => navigateApp(router, user?.role, { name: 'clubs' }),
              },
              {
                label: 'Ментор',
                icon: 'message-circle' as const,
                color: '#F59E0B',
                action: () => navigateApp(router, user?.role, { name: 'chats' }),
              },
            ].map((action) => (
              <PressableScale
                key={action.label}
                onPress={action.action}
                style={{
                  flexBasis: isDesktop ? '31%' : '30%',
                  flexGrow: 1,
                  minHeight: 104,
                  backgroundColor: 'white',
                  borderRadius: 24,
                  padding: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#EEF2F7',
                  ...SHADOWS.sm,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 15,
                    backgroundColor: `${action.color}14`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                  }}
                >
                  <Feather name={action.icon} size={20} color={action.color} />
                </View>
                <Text style={{ color: COLORS.foreground, fontWeight: '900', fontSize: 12 }}>
                  {action.label}
                </Text>
              </PressableScale>
            ))}
          </View>

          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 28,
              padding: 20,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              ...SHADOWS.sm,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Feather name="activity" size={20} color={COLORS.primary} />
              <Text style={{ color: COLORS.foreground, fontSize: 18, fontWeight: '900' }}>
                Диагностика
              </Text>
            </View>

            <View style={{ gap: 14 }}>
              <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 14 }}>
                {[
                  {
                    title: 'Базовый тест',
                    text: hasDiagnostic
                      ? 'Карта навыков уже собрана. Можно обновить результат в любое время.'
                      : 'Короткая диагностика покажет сильные стороны и карьерные направления.',
                    icon: 'check-circle' as const,
                    color: '#10B981',
                    done: hasDiagnostic,
                    actionLabel: hasDiagnostic ? 'Пройти заново' : 'Начать',
                    onPress: openDiagnostic,
                  },
                  {
                    title: 'Большой тест',
                    text: hasProDiagnostic
                      ? 'Расширенный профиль уже готов: поведение, тип интеллекта и векторы роста.'
                      : isPro
                        ? 'Глубокая диагностика добавит поведенческую аналитику и точные рекомендации.'
                        : 'Откроется после PRO: больше заданий, больше данных, точнее рекомендации.',
                    icon: 'zap' as const,
                    color: COLORS.primary,
                    done: hasProDiagnostic,
                    actionLabel: hasProDiagnostic
                      ? 'Обновить'
                      : isPro
                        ? 'Начать'
                        : 'Открыть PRO',
                    onPress: isPro
                      ? openDiagnostic
                      : () => navigateApp(router, user?.role, { name: 'subscriptionUpsell' }),
                  },
                ].map((step, index) => (
                  <View
                    key={step.title}
                    style={{
                      flex: 1,
                      paddingTop: index === 0 || isDesktop ? 0 : 14,
                      borderTopWidth: index === 0 || isDesktop ? 0 : 1,
                      borderTopColor: '#EEF2F7',
                      gap: 10,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 14,
                          backgroundColor: `${step.color}14`,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Feather name={step.done ? 'check-circle' : step.icon} size={19} color={step.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{ color: COLORS.foreground, fontSize: 15, fontWeight: '900' }}
                        >
                          {step.title}
                        </Text>
                        <Text
                          style={{
                            color: COLORS.mutedForeground,
                            fontSize: 12,
                            lineHeight: 17,
                            marginTop: 3,
                          }}
                        >
                          {step.text}
                        </Text>
                      </View>
                    </View>

                    <PressableScale
                      onPress={step.onPress}
                      style={{
                        alignSelf: 'flex-start',
                        backgroundColor: step.done ? '#F8FAFC' : step.color,
                        borderRadius: 14,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderWidth: step.done ? 1 : 0,
                        borderColor: '#E5E7EB',
                      }}
                    >
                      <Text
                        style={{
                          color: step.done ? COLORS.foreground : 'white',
                          fontWeight: '900',
                          fontSize: 12,
                        }}
                      >
                        {step.actionLabel}
                      </Text>
                    </PressableScale>
                  </View>
                ))}
              </View>

              {topSkills.length > 0 ? (
                <View
                  style={{
                    paddingTop: 14,
                    borderTopWidth: 1,
                    borderTopColor: '#EEF2F7',
                    gap: 12,
                  }}
                >
                  {topSkills.map(([skill, value]) => (
                    <View key={skill}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#4B5563', fontWeight: '800', fontSize: 12 }}>
                          {skill}
                        </Text>
                        <Text style={{ color: COLORS.primary, fontWeight: '900', fontSize: 12 }}>
                          {value}%
                        </Text>
                      </View>
                      <View
                        style={{
                          height: 8,
                          borderRadius: 999,
                          backgroundColor: '#F3F4F6',
                          overflow: 'hidden',
                          marginTop: 6,
                        }}
                      >
                        <View
                          style={{
                            height: '100%',
                            width: `${value}%`,
                            backgroundColor: COLORS.primary,
                          }}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </View>

          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ color: COLORS.foreground, fontSize: 18, fontWeight: '900' }}>
                Кружки
              </Text>
              <PressableScale onPress={() => navigateApp(router, user?.role, { name: 'clubs' })}>
                <Text style={{ color: COLORS.primary, fontWeight: '900', fontSize: 13 }}>Все</Text>
              </PressableScale>
            </View>
            {courses.length === 0 ? (
              <View
                style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: 24,
                  padding: 24,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#EEF2F7',
                }}
              >
                <Feather name="book-open" size={26} color="#CBD5E1" />
                <Text style={{ marginTop: 10, color: '#94A3B8', fontWeight: '800' }}>
                  Кружки скоро появятся
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {courses.slice(0, 4).map((course, index) => (
                  <PressableScale
                    key={course.id}
                    onPress={() =>
                      navigateApp(router, user?.role, {
                        name: 'courseDetails',
                        courseId: course.id,
                      })
                    }
                    style={{ width: 210, marginRight: 14, ...SHADOWS.sm }}
                  >
                    <LinearGradient
                      colors={courseGradient(index)}
                      style={{ minHeight: 160, borderRadius: 24, padding: 16 }}
                    >
                      <Feather
                        name={featherIconName(course.icon, 'book-open')}
                        size={26}
                        color="white"
                      />
                      <View style={{ marginTop: 'auto' }}>
                        <Text
                          style={{ color: 'white', fontSize: 16, fontWeight: '900' }}
                          numberOfLines={2}
                        >
                          {course.title}
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 12 }}>
                          {formatKZT(course.price)}/мес
                        </Text>
                      </View>
                    </LinearGradient>
                  </PressableScale>
                ))}
              </ScrollView>
            )}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
