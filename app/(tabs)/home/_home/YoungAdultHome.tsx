// YoungAdultHome: собирает виджеты и быстрые действия домашнего экрана для роли young adult.
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS, TYPOGRAPHY } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { useParentData } from '$contexts/ParentDataContext';
import { courseGradient, usePublicCourses } from '$hooks/usePublicData';
import { useYouthGoals } from '$hooks/useStudentData';
import { navigateApp } from '$lib/appNavigation';
import { formatKZT } from '$lib/formatCurrency';
import { featherIconName } from '$lib/icons';
import { appHref } from '$lib/router';
import { getDashboardHorizontalPadding, useIsDesktop } from '$lib/useIsDesktop';

export default function YoungAdultHome() {
  const router = useRouter();
  const { user } = useAuth();
  const { childrenProfile, activeChildId, parentProfile } = useParentData();
  const isDesktop = useIsDesktop();
  const horizontalPadding = getDashboardHorizontalPadding(isDesktop, 20);
  const { courses } = usePublicCourses();
  const { goals } = useYouthGoals();

  const activeProfile = childrenProfile.find((child) => child.id === activeChildId);
  const firstName = activeProfile?.name || user?.firstName || 'Студент';
  const diagnostic = activeProfile?.talentProfile;
  const isPro = parentProfile?.tariff === 'pro';

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
        <View style={{ backgroundColor: '#111827', overflow: 'hidden' }}>
          <LinearGradient
            colors={['#111827', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingTop: Platform.OS === 'ios' ? 0 : 20 }}
          >
            <SafeAreaView edges={['top']}>
              <View
                style={{
                  paddingHorizontal: horizontalPadding,
                  paddingTop: 14,
                  paddingBottom: 34,
                  gap: 18,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 18,
                      backgroundColor: 'rgba(255,255,255,0.14)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.2)',
                    }}
                  >
                    <Feather name="compass" size={24} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: 12,
                        fontWeight: '900',
                        textTransform: 'uppercase',
                      }}
                    >
                      Самостоятельный трек
                    </Text>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: TYPOGRAPHY.size.xxxl,
                        fontWeight: TYPOGRAPHY.weight.semibold,
                      }}
                    >
                      {firstName}, твой план
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => navigateApp(router, user?.role, { name: 'profile' })}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 16,
                      backgroundColor: 'rgba(255,255,255,0.14)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Feather name="user" size={20} color="white" />
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 24,
                    padding: 18,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.16)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      backgroundColor: 'rgba(255,255,255,0.14)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Feather name={isPro ? 'zap' : 'lock'} size={20} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontSize: 15, fontWeight: '900' }}>
                      {isPro ? 'PRO аналитика активна' : 'Открой PRO аналитику'}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, marginTop: 3 }}>
                      {isPro
                        ? 'Глубокие результаты и рекомендации доступны в твоём профиле.'
                        : 'Можно подключить тестовую Stripe Sandbox оплату для демо.'}
                    </Text>
                  </View>
                  {!isPro && (
                    <TouchableOpacity
                      onPress={() =>
                        navigateApp(router, user?.role, { name: 'subscriptionUpsell' })
                      }
                      style={{
                        backgroundColor: 'white',
                        borderRadius: 14,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                      }}
                    >
                      <Text style={{ color: '#111827', fontWeight: '900', fontSize: 12 }}>PRO</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </View>

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
                label: 'Цели',
                icon: 'target' as const,
                color: '#10B981',
                action: () => router.push(appHref('/(tabs)/youth/goals')),
              },
              {
                label: 'Ментор',
                icon: 'message-circle' as const,
                color: '#F59E0B',
                action: () => navigateApp(router, user?.role, { name: 'chats' }),
              },
            ].map((action) => (
              <TouchableOpacity
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
              </TouchableOpacity>
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
                Профиль навыков
              </Text>
            </View>
            {topSkills.length > 0 ? (
              <View style={{ gap: 12 }}>
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
            ) : (
              <View style={{ gap: 12 }}>
                <Text style={{ color: '#6B7280', lineHeight: 19 }}>
                  Пройди диагностику, чтобы собрать карту навыков и карьерных направлений.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/profile/youth/testing')}
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: COLORS.primary,
                    borderRadius: 16,
                    paddingHorizontal: 18,
                    paddingVertical: 12,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '900' }}>Начать диагностику</Text>
                </TouchableOpacity>
              </View>
            )}
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
                Цели
              </Text>
              <TouchableOpacity onPress={() => router.push(appHref('/(tabs)/youth/goals'))}>
                <Text style={{ color: COLORS.primary, fontWeight: '900', fontSize: 13 }}>Все</Text>
              </TouchableOpacity>
            </View>
            {goals.length === 0 ? (
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
                <Feather name="target" size={26} color="#CBD5E1" />
                <Text style={{ marginTop: 10, color: '#94A3B8', fontWeight: '800' }}>
                  Целей пока нет
                </Text>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {goals.slice(0, 2).map((goal) => (
                  <View
                    key={goal.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: 22,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: COLORS.foreground, fontWeight: '900' }}>
                        {goal.title}
                      </Text>
                      <Text style={{ color: goal.color, fontWeight: '900' }}>{goal.progress}%</Text>
                    </View>
                    <View
                      style={{
                        height: 8,
                        borderRadius: 999,
                        backgroundColor: '#F3F4F6',
                        overflow: 'hidden',
                        marginTop: 10,
                      }}
                    >
                      <View
                        style={{
                          height: '100%',
                          width: `${goal.progress}%`,
                          backgroundColor: goal.color,
                        }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View>
            <Text
              style={{
                color: COLORS.foreground,
                fontSize: 18,
                fontWeight: '900',
                marginBottom: 12,
              }}
            >
              Курсы
            </Text>
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
                  Курсы скоро появятся
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {courses.slice(0, 4).map((course, index) => (
                  <TouchableOpacity
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
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
