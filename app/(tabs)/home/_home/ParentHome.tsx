// ParentHome: собирает виджеты и быстрые действия домашнего экрана для роли родителя.
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import { NotificationsModal } from '$components/navigation/NotificationsModal';
import { GradientScreenHeader } from '$components/ui/GradientScreenHeader';
import { PressableScale } from '$components/ui/PressableScale';
import { COLORS, RADIUS, SHADOWS } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { useParentData } from '$contexts/ParentDataContext';
import { courseGradient, SCORE_TO_SKILLS, usePublicCourses } from '$hooks/usePublicData';
import { navigateApp } from '$lib/appNavigation';
import { formatKZT } from '$lib/formatCurrency';
import { featherIconName } from '$lib/icons';
import { getDashboardHorizontalPadding, useIsDesktop } from '$lib/useIsDesktop';
import type { WebViewStyle } from '$types/styles';

export default function ParentHome() {
  const router = useRouter();
  const { user } = useAuth();
  const isDesktop = useIsDesktop();
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const {
    parentProfile,
    childrenProfile: children,
    activeChildId,
    setActiveChildId,
  } = useParentData();

  const horizontalPadding = getDashboardHorizontalPadding(isDesktop, 20);

  const activeChild = children.find((child) => child.id === activeChildId) || children[0] || null;
  const activeChildHasDiagnostic = Boolean(activeChild?.talentProfile);
  const activeChildHasProDiagnostic = activeChild?.talentProfile?.tier === 'pro';

  const { courses: publicCourses } = usePublicCourses();

  const recommendations = useMemo(() => {
    if (publicCourses.length === 0) return [];
    if (!activeChild?.talentProfile) return publicCourses.slice(0, 3);

    const scores = activeChild.talentProfile.scores as Record<string, number>;
    const topTraits = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([t]) => t);
    const wantedSkills = new Set(topTraits.flatMap((t) => SCORE_TO_SKILLS[t] ?? []));

    const matched = publicCourses.filter((c) => c.skills.some((s) => wantedSkills.has(s)));
    return (matched.length > 0 ? matched : publicCourses).slice(0, 3);
  }, [activeChild, publicCourses]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: isDesktop ? 32 : 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <GradientScreenHeader
          title={`Привет, ${user?.firstName || parentProfile?.firstName || 'Родитель'}!`}
          subtitle="Узнайте, как развиваются ваши дети сегодня"
          paddingX={horizontalPadding}
          variant="dashboard"
          rightAccessory={
            !isDesktop ? (
              <PressableScale
                onPress={() => setNotificationsVisible(true)}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: RADIUS.lg,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.3)',
                  ...(Platform.OS === 'web' && ({ cursor: 'pointer' } as WebViewStyle)),
                }}
              >
                <Feather name="bell" size={20} color="white" />
                <View
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    width: 10,
                    height: 10,
                    backgroundColor: COLORS.destructive,
                    borderRadius: 5,
                    borderWidth: 1.5,
                    borderColor: 'rgba(255,255,255,0.4)',
                  }}
                />
              </PressableScale>
            ) : null
          }
        />
        {/* Children Section */}
        <View style={{ paddingHorizontal: horizontalPadding, marginTop: 24 }}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-black text-gray-900">Мои дети</Text>
            <PressableScale
              onPress={() => navigateApp(router, user?.role, { name: 'parentChildren' })}
            >
              <Text className="text-purple-600 font-bold text-sm">Все</Text>
            </PressableScale>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="overflow-visible"
          >
            {children.map((child) => (
              <PressableScale
                key={child.id}
                onPress={() => {
                  setActiveChildId(child.id);
                  navigateApp(router, user?.role, {
                    name: 'parentChildDetails',
                    childId: child.id,
                  });
                }}
                style={SHADOWS.md}
                className={`mr-4 w-36 h-44 p-5 bg-white rounded-[32px] items-center justify-center border ${activeChildId === child.id ? 'border-purple-200' : 'border-gray-50'}`}
              >
                <View className="w-16 h-16 rounded-full bg-purple-100 items-center justify-center mb-3">
                  <Text className="text-purple-600 font-black text-xl">
                    {child.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text className="font-bold text-sm text-gray-800 text-center" numberOfLines={1}>
                  {child.name}
                </Text>
                <Text className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                  {child.age} ЛЕТ
                </Text>
              </PressableScale>
            ))}

            <PressableScale
              onPress={() => router.push('/profile/youth/create-profile-child')}
              scaleTo={0.94}
              pressDelayMs={90}
              className="w-36 h-44 p-5 bg-gray-50 rounded-[32px] items-center justify-center border-2 border-dashed border-gray-100"
            >
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mb-2">
                <Feather name="plus" size={20} color="#9CA3AF" />
              </View>
              <Text className="text-xs font-bold text-gray-400 text-center">Добавить</Text>
            </PressableScale>
          </ScrollView>
        </View>

        {/* Dashboard Insight Widget (Tariff Based) */}
        <View style={{ paddingHorizontal: horizontalPadding, marginTop: 32 }}>
          {activeChildHasProDiagnostic ? null : parentProfile?.tariff === 'pro' && activeChild ? (
            <View
              style={SHADOWS.md}
              className="bg-purple-50 rounded-[32px] p-6 border border-purple-100 flex-row items-center"
            >
              <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-4 border-2 border-purple-200">
                <Feather name="zap" size={20} color="#6C5CE7" />
              </View>
              <View className="flex-1 pr-2">
                <Text className="text-purple-900 font-bold text-sm mb-1">PRO тест доступен</Text>
                <Text className="text-purple-700 text-xs leading-4">
                  Для {activeChild.name} открыт расширенный тест: интеллект, профориентация и
                  персональные рекомендации.
                </Text>
                <View className="flex-row gap-2 mt-3">
                  <PressableScale
                    onPress={() => {
                      setActiveChildId(activeChild.id);
                      router.push({
                        pathname: '/profile/youth/testing',
                        params: { childId: activeChild.id },
                      });
                    }}
                    className="bg-purple-600 px-3 py-1.5 rounded-full flex-row items-center gap-1"
                  >
                    <Text className="text-white font-black text-[10px] uppercase tracking-widest">
                      Пройти PRO
                    </Text>
                  </PressableScale>
                  <PressableScale
                    onPress={() =>
                      navigateApp(router, user?.role, {
                        name: 'parentChildDetails',
                        childId: activeChild.id,
                      })
                    }
                    className="bg-white px-3 py-1.5 rounded-full border border-purple-200 flex-row items-center gap-1"
                  >
                    <Feather name="bar-chart-2" size={10} color="#6C5CE7" />
                    <Text className="text-purple-600 font-black text-[10px] uppercase tracking-widest">
                      Отчет
                    </Text>
                  </PressableScale>
                </View>
              </View>
            </View>
          ) : activeChildHasDiagnostic && activeChild ? (
            <View
              style={SHADOWS.sm}
              className="bg-purple-50 rounded-[32px] p-6 border border-purple-100 flex-row items-center"
            >
              <View
                className="w-12 h-12 bg-white rounded-full items-center justify-center mr-4 border border-purple-100"
                style={SHADOWS.sm}
              >
                <Feather name="zap" size={20} color="#6C5CE7" />
              </View>
              <View className="flex-1 pr-2">
                <Text className="text-purple-900 font-bold text-sm mb-1">PRO Аналитика</Text>
                <Text className="text-purple-700 text-xs leading-4">
                  Базовая диагностика для {activeChild.name} готова. Откройте расширенный отчет: тип
                  интеллекта, профориентацию и персональные рекомендации.
                </Text>
                <View className="flex-row gap-2 mt-3">
                  <PressableScale
                    onPress={() => navigateApp(router, user?.role, { name: 'subscriptionUpsell' })}
                    className="bg-purple-600 self-start px-3 py-1.5 rounded-full"
                  >
                    <Text className="text-white font-black text-[10px] uppercase tracking-widest">
                      Открыть PRO
                    </Text>
                  </PressableScale>
                  <PressableScale
                    onPress={() =>
                      navigateApp(router, user?.role, {
                        name: 'parentChildDetails',
                        childId: activeChild.id,
                      })
                    }
                    className="bg-white self-start px-3 py-1.5 rounded-full border border-purple-200"
                  >
                    <Text className="text-purple-600 font-black text-[10px] uppercase tracking-widest">
                      Отчет
                    </Text>
                  </PressableScale>
                </View>
              </View>
            </View>
          ) : activeChild ? (
            <View
              style={SHADOWS.sm}
              className="bg-blue-50 rounded-[32px] p-6 border border-blue-100 flex-row items-center"
            >
              <View
                className="w-12 h-12 bg-white rounded-full items-center justify-center mr-4 border border-blue-50"
                style={SHADOWS.sm}
              >
                <Feather name="cpu" size={20} color="#3B82F6" />
              </View>
              <View className="flex-1 pr-2">
                <Text className="text-blue-900 font-bold text-sm mb-1">AI Диагностика</Text>
                <Text className="text-blue-700 text-xs leading-4">
                  Пройдите диагностику талантов для {activeChild.name}, чтобы получить персональные
                  рекомендации по развитию.
                </Text>
                <PressableScale
                  onPress={() => {
                    if (!activeChild) return;
                    setActiveChildId(activeChild.id);
                    router.push({
                      pathname: '/profile/youth/testing',
                      params: { childId: activeChild.id },
                    });
                  }}
                  className="mt-3 bg-white self-start px-3 py-1.5 rounded-full border border-blue-200"
                >
                  <Text className="text-blue-600 font-black text-[10px] uppercase tracking-widest">
                    Начать тест
                  </Text>
                </PressableScale>
              </View>
            </View>
          ) : null}
        </View>

        {/* AI Recommendations Section */}
        <View style={{ marginTop: 32 }}>
          <View style={{ paddingHorizontal: horizontalPadding }}>
            <Text className="text-xl font-black text-gray-900 mb-1">Рекомендации AI</Text>
            <Text className="text-xs text-gray-400 font-medium mb-4">
              На основе интересов {activeChild?.name}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingLeft: horizontalPadding }}
          >
            {recommendations.length === 0 ? (
              <View
                style={{
                  width: 260,
                  backgroundColor: '#F9FAFB',
                  borderRadius: 28,
                  padding: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                }}
              >
                <Feather name="inbox" size={28} color="#D1D5DB" />
                <Text
                  style={{
                    color: '#9CA3AF',
                    fontWeight: '700',
                    fontSize: 13,
                    marginTop: 10,
                    textAlign: 'center',
                  }}
                >
                  Курсы появятся{'\n'}когда организации их добавят
                </Text>
              </View>
            ) : (
              recommendations.map((rec, idx) => {
                const [c1] = courseGradient(idx);
                return (
                  <PressableScale
                    key={rec.id}
                    onPress={() =>
                      navigateApp(router, user?.role, { name: 'courseDetails', courseId: rec.id })
                    }
                    style={[
                      SHADOWS.sm,
                      {
                        marginRight: 16,
                        width: 240,
                        backgroundColor: 'white',
                        borderRadius: 28,
                        overflow: 'hidden',
                        borderWidth: 1,
                        borderColor: '#F9FAFB',
                      },
                    ]}
                  >
                    <View
                      style={{
                        height: 120,
                        backgroundColor: `${c1}20`,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Feather name={featherIconName(rec.icon, 'book-open')} size={36} color={c1} />
                    </View>
                    <View style={{ padding: 14 }}>
                      <Text
                        style={{
                          fontWeight: '800',
                          color: '#111827',
                          marginBottom: 2,
                          fontSize: 14,
                        }}
                        numberOfLines={1}
                      >
                        {rec.title}
                      </Text>
                      {rec.org_name ? (
                        <Text
                          style={{
                            fontSize: 11,
                            color: '#9CA3AF',
                            fontWeight: '600',
                            marginBottom: 6,
                          }}
                          numberOfLines={1}
                        >
                          {rec.org_name}
                        </Text>
                      ) : null}
                      <View
                        style={{
                          backgroundColor: '#EDE9FE',
                          alignSelf: 'flex-start',
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 9,
                            fontWeight: '900',
                            color: '#6C5CE7',
                            textTransform: 'uppercase',
                          }}
                        >
                          {formatKZT(rec.price)}/мес
                        </Text>
                      </View>
                    </View>
                  </PressableScale>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* Upcoming Classes Section */}
        <View style={{ paddingHorizontal: horizontalPadding, marginTop: 32 }}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-black text-gray-900">Ближайшие занятия</Text>
            <PressableScale onPress={() => navigateApp(router, user?.role, { name: 'calendar' })}>
              <Text className="text-purple-600 font-bold text-sm">Календарь</Text>
            </PressableScale>
          </View>

          <View className="bg-gray-50 rounded-[32px] p-8 items-center border border-gray-100">
            <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center mb-4 border border-gray-100">
              <Feather name="calendar" size={28} color="#D1D5DB" />
            </View>
            <Text className="text-gray-400 font-bold text-sm mb-4 text-center">
              Пока нет запланированных занятий
            </Text>
            <PressableScale
              onPress={() => navigateApp(router, user?.role, { name: 'clubs' })}
              pressDelayMs={90}
              className="bg-purple-600 px-6 py-3 rounded-2xl"
            >
              <Text className="text-white font-black text-sm uppercase">Найти кружок</Text>
            </PressableScale>
          </View>
        </View>
      </ScrollView>

      <NotificationsModal
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />
    </View>
  );
}
