// Экран parent/reports: загружает и показывает отчеты по детям в кабинете родителя.
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { GradientScreenHeader } from '$components/ui/GradientScreenHeader';
import { PressableScale } from '$components/ui/PressableScale';
import { COLORS, SHADOWS } from '$constants/theme';
import { useParentData } from '$contexts/ParentDataContext';
import { useChildReports } from '$hooks/useParentReports';
import { getDashboardHorizontalPadding, useIsDesktop } from '$lib/useIsDesktop';
import type { ParentReportStat } from '$types/dashboard';

export default function ParentReports() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const horizontalPadding = getDashboardHorizontalPadding(isDesktop, 20);

  const { childrenProfile, setActiveChildId } = useParentData();
  const children = useMemo(
    () => childrenProfile.map((c) => c.name).filter(Boolean),
    [childrenProfile],
  );
  const [selectedChild, setSelectedChild] = useState<string>('');
  const firstChild = children[0] ?? '';
  const selectedChildExists = selectedChild ? children.includes(selectedChild) : false;

  useEffect(() => {
    if (firstChild && !selectedChildExists) {
      setSelectedChild(firstChild);
    }
  }, [firstChild, selectedChildExists]);

  const selectedChildProfile = childrenProfile.find((c) => c.name === selectedChild);
  const hasChildren = childrenProfile.length > 0;

  const { report, loading } = useChildReports(selectedChild || null);
  const maxAttendance = report.attendance.length
    ? Math.max(...report.attendance.map((a) => a.attendance_pct))
    : 100;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <GradientScreenHeader
        title="Отчеты"
        subtitle="Прогресс и посещаемость"
        paddingX={horizontalPadding}
        variant="dashboard"
      >
        {children.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-1 px-1 overflow-visible"
          >
            {children.map((child) => (
              <PressableScale
                key={child}
                onPress={() => setSelectedChild(child)}
                className={`mr-3 px-6 py-2.5 rounded-full border ${selectedChild === child ? 'bg-white/20 border-white/40' : 'bg-transparent border-white/20'}`}
              >
                <Text className="font-bold text-sm text-white">{child}</Text>
              </PressableScale>
            ))}
          </ScrollView>
        )}
      </GradientScreenHeader>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 24,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {!hasChildren && (
          <PressableScale
            onPress={() => router.push('/profile/youth/create-profile-child')}
            activeOpacity={0.8}
            style={SHADOWS.sm}
            className="bg-white rounded-[32px] p-6 border border-gray-50 items-center mb-8"
          >
            <View className="w-12 h-12 rounded-2xl bg-purple-50 items-center justify-center mb-4">
              <Feather name="user-plus" size={22} color="#6C5CE7" />
            </View>
            <Text className="text-lg font-black text-gray-900 mb-2">Добавьте профиль ребёнка</Text>
            <Text className="text-sm text-gray-400 text-center leading-5">
              Отчёты, посещаемость и диагностика появятся после создания детского профиля.
            </Text>
          </PressableScale>
        )}

        {loading && (
          <Text
            style={{
              textAlign: 'center',
              color: COLORS.mutedForeground,
              marginBottom: 20,
            }}
          >
            Загрузка...
          </Text>
        )}

        {/* Stats Row */}
        {hasChildren && (
          <View className="flex-row gap-4 mb-8">
            {(
              [
                {
                  label: 'Занятий',
                  value: String(report.totalClasses || '—'),
                  icon: 'calendar',
                  color: '#6C5CE7',
                },
                {
                  label: 'Посещаемость',
                  value: report.avgAttendance ? `${report.avgAttendance}%` : '—',
                  icon: 'check-circle',
                  color: '#10B981',
                },
              ] satisfies ParentReportStat[]
            ).map((stat) => (
              <View
                key={stat.label}
                style={SHADOWS.sm}
                className="flex-1 bg-white p-5 rounded-[32px] border border-gray-50 items-center"
              >
                <View
                  style={{ backgroundColor: `${stat.color}10` }}
                  className="w-10 h-10 rounded-xl items-center justify-center mb-3"
                >
                  <Feather name={stat.icon} size={20} color={stat.color} />
                </View>
                <Text className="text-2xl font-black text-gray-900">{stat.value}</Text>
                <Text className="text-[10px] text-gray-400 font-bold uppercase mt-1 text-center">
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {hasChildren && report.skills.length > 0 && (
          <View
            style={SHADOWS.md}
            className="bg-white rounded-[40px] p-6 mb-8 border border-gray-50"
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-black text-gray-900">Навыки</Text>
              <View className="bg-green-50 px-3 py-1.5 rounded-full border border-green-100 flex-row items-center gap-1.5">
                <Feather name="trending-up" size={12} color="#10B981" />
                <Text className="text-[10px] font-black text-green-600">ПРОГРЕСС</Text>
              </View>
            </View>

            <View className="gap-6">
              {report.skills.map((skill) => (
                <View key={skill.skill_label}>
                  <View className="flex-row justify-between items-end mb-2">
                    <Text className="text-sm font-bold text-gray-800">{skill.skill_label}</Text>
                    <Text className="text-sm font-black text-gray-900">{skill.current_value}%</Text>
                  </View>
                  <View className="h-2 bg-gray-50 rounded-full overflow-hidden flex-row">
                    <View
                      style={{
                        width: `${skill.current_value}%`,
                        backgroundColor: skill.color,
                      }}
                      className="h-full rounded-full"
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Attendance chart (bar) */}
        {hasChildren && report.attendance.length > 0 && (
          <View
            style={SHADOWS.md}
            className="bg-white rounded-[40px] p-6 mb-8 border border-gray-50"
          >
            <Text className="text-lg font-black text-gray-900 mb-6">Посещаемость по месяцам</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: 8,
                height: 80,
              }}
            >
              {report.attendance.map((a) => (
                <View key={a.month_label} style={{ flex: 1, alignItems: 'center' }}>
                  <View
                    style={{
                      width: '100%',
                      height: Math.round((a.attendance_pct / maxAttendance) * 64),
                      backgroundColor: '#6C5CE7',
                      borderRadius: 6,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 9,
                      color: '#9CA3AF',
                      fontWeight: '700',
                      marginTop: 4,
                    }}
                  >
                    {a.month_label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Diagnostic Results (If available) ── */}
        {hasChildren && selectedChildProfile?.talentProfile ? (
          <View
            style={SHADOWS.md}
            className="bg-white rounded-[40px] p-6 mb-8 border border-gray-50"
          >
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-purple-50 rounded-2xl items-center justify-center">
                <Feather name="star" size={20} color="#6C5CE7" />
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '900',
                  color: COLORS.foreground,
                }}
              >
                Диагностика талантов
              </Text>
            </View>

            <View className="bg-purple-50 p-5 rounded-3xl border border-purple-100 mb-5">
              <Text className="text-purple-900 font-black text-base mb-2">
                {selectedChildProfile.talentProfile.recommendedConstellation}
              </Text>
              <Text className="text-purple-800 text-xs leading-5">
                {selectedChildProfile.talentProfile.summary}
              </Text>
            </View>

            <PressableScale
              onPress={() => {
                setActiveChildId(selectedChildProfile.id);
                router.push('/profile/youth/results');
              }}
              className="bg-primary/10 py-4 rounded-2xl items-center justify-center"
            >
              <Text className="text-primary font-black text-xs uppercase tracking-wide">
                Посмотреть расширенный отчет
              </Text>
            </PressableScale>
          </View>
        ) : hasChildren ? (
          <View style={SHADOWS.md} className="bg-gray-900 rounded-[40px] p-8 mb-8 overflow-hidden">
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0)']}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-white/20 rounded-2xl items-center justify-center">
                <Feather name="zap" size={20} color="white" />
              </View>
              <Text className="text-white text-lg font-black">AI Диагностика</Text>
            </View>
            <Text className="text-white/60 text-sm leading-6 mb-6">
              У {selectedChild || 'этого ребенка'} еще нет результатов диагностики. Пройдите тест,
              чтобы узнать сильные стороны.
            </Text>
            <PressableScale
              onPress={() => {
                if (selectedChildProfile) {
                  setActiveChildId(selectedChildProfile.id);
                  router.push({
                    pathname: '/profile/youth/testing',
                    params: { childId: selectedChildProfile.id },
                  });
                }
              }}
              className="bg-white h-14 rounded-2xl items-center justify-center"
            >
              <Text className="text-gray-900 font-black text-xs uppercase tracking-wide">
                Начать тестирование
              </Text>
            </PressableScale>
          </View>
        ) : null}

        {/* AI Insight — only shown when real diagnostic data exists */}
        {hasChildren && selectedChildProfile?.talentProfile?.summary && (
          <View className="bg-purple-600 rounded-[40px] p-8 overflow-hidden">
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0)']}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-white/20 rounded-2xl items-center justify-center">
                <Feather name="cpu" size={20} color="white" />
              </View>
              <Text className="text-white text-lg font-black">AI Аналитика</Text>
            </View>
            <Text className="text-white/80 text-sm leading-6 font-medium">
              {selectedChildProfile.talentProfile.summary}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
