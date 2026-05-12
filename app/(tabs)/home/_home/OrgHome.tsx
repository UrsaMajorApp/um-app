// OrgHome: собирает виджеты и быстрые действия домашнего экрана для роли org.
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { Platform, ScrollView, Text, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ORG_HOME_QUICK_ACTIONS } from '$constants/dashboard';
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { useOrgProfile, useOrgSchedule, useOrgStats } from '$hooks/useOrgData';
import { useWalletData } from '$hooks/usePlatformData';
import { navigateApp } from '$lib/appNavigation';
import { formatKZT } from '$lib/formatCurrency';
import { featherIconName } from '$lib/icons';
import { getDashboardHorizontalPadding, useIsDesktop } from '$lib/useIsDesktop';

export default function OrgHome() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const horizontalPadding = getDashboardHorizontalPadding(isDesktop, 20);
  const { user } = useAuth();
  const { status: orgStatus, name: orgName } = useOrgProfile();
  const isVerified = orgStatus === 'verified';
  const { stats } = useOrgStats();
  const { summary: walletSummary } = useWalletData('org');
  const todayDow = (new Date().getDay() + 6) % 7; // Mon=0
  const { items: todaySchedule } = useOrgSchedule(todayDow);
  const firstClass = todaySchedule[0] ?? null;

  const STATS_TILES = [
    {
      label: 'Кружков',
      value: String(stats.groupCount),
      icon: 'book-open' as const,
      color: COLORS.primary,
    },
    {
      label: 'Учеников',
      value: String(stats.studentCount),
      icon: 'users' as const,
      color: '#10B981',
    },
    {
      label: 'Заявок',
      value: String(stats.pendingCount),
      icon: 'clipboard' as const,
      color: '#F59E0B',
    },
    {
      label: 'Учителей',
      value: String(stats.staffCount),
      icon: 'user-check' as const,
      color: '#6366F1',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 110,
        }}
      >
        {/* Header - Premium Purple Aesthetic */}
        <View style={{ backgroundColor: COLORS.primary, overflow: 'hidden' }}>
          <LinearGradient
            colors={COLORS.gradients.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingTop: Platform.OS === 'ios' ? 0 : 20 }}
          >
            <SafeAreaView edges={['top']}>
              <MotiView
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                style={{
                  paddingHorizontal: horizontalPadding,
                  paddingTop: 12,
                  paddingBottom: 32,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 20,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.size.xxl,
                        fontWeight: TYPOGRAPHY.weight.light,
                        color: 'white',
                        opacity: 0.8,
                      }}
                    >
                      Управление
                    </Text>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.size.xxxl,
                        fontWeight: TYPOGRAPHY.weight.bold,
                        color: 'white',
                        letterSpacing: -0.5,
                      }}
                    >
                      {orgName || 'Моя организация'}
                    </Text>
                  </View>
                  <PressableScale
                    onPress={() => navigateApp(router, user?.role, { name: 'profile' })}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: RADIUS.lg,
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <Feather name="settings" size={22} color="white" />
                  </PressableScale>
                </View>

                {/* Sub-header Context Chips */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 4,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.2)',
                    }}
                  >
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 10,
                        fontWeight: '800',
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                      }}
                    >
                      Сеть: 1 филиал
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.2)',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Feather name="trending-up" size={14} color="white" />
                    <Text
                      style={{
                        color: 'white',
                        fontWeight: '700',
                        fontSize: 12,
                      }}
                    >
                      92% посещаемость
                    </Text>
                  </View>
                </View>
              </MotiView>
            </SafeAreaView>
          </LinearGradient>
        </View>

        {/* Verification status banner */}
        {(orgStatus === 'new' || orgStatus === null) && (
          <MotiView
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={{
              paddingHorizontal: horizontalPadding,
              marginTop: 24,
              marginBottom: 8,
            }}
          >
            <PressableScale
              onPress={() => navigateApp(router, user?.role, { name: 'orgVerification' })}
              activeOpacity={0.92}
              style={{
                backgroundColor: '#6C5CE7',
                borderRadius: RADIUS.xl,
                padding: 20,
                overflow: 'hidden',
              }}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 14,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: RADIUS.md,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Feather name="shield" size={22} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '800',
                      color: 'white',
                      marginBottom: 4,
                    }}
                  >
                    Пройдите верификацию
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.8)',
                      lineHeight: 18,
                    }}
                  >
                    Чтобы принимать оплаты и появиться в поиске — загрузите документы
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      marginTop: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '700',
                        color: 'white',
                      }}
                    >
                      Перейти к верификации
                    </Text>
                    <Feather name="arrow-right" size={14} color="white" />
                  </View>
                </View>
              </View>
            </PressableScale>
          </MotiView>
        )}

        {orgStatus === 'ready_for_review' && (
          <MotiView
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={{
              paddingHorizontal: horizontalPadding,
              marginTop: 24,
              marginBottom: 8,
            }}
          >
            <PressableScale
              onPress={() => navigateApp(router, user?.role, { name: 'profile' })}
              activeOpacity={0.9}
              style={{
                backgroundColor: '#FFFBEB',
                borderRadius: RADIUS.xl,
                padding: 20,
                borderWidth: 1,
                borderColor: '#FDE047',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
                ...SHADOWS.sm,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: RADIUS.lg,
                  backgroundColor: '#FEF08A',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Feather name="shield" size={24} color="#854D0E" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1C1C1E' }}>
                  Документы на проверке
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                  Администратор проверяет ваши документы. Обычно это занимает до 24 часов.
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#854D0E" />
            </PressableScale>
          </MotiView>
        )}

        {orgStatus === 'rejected' && (
          <MotiView
            from={{ opacity: 0, translateY: -8 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={{
              paddingHorizontal: horizontalPadding,
              marginTop: 24,
              marginBottom: 8,
            }}
          >
            <PressableScale
              onPress={() => navigateApp(router, user?.role, { name: 'orgVerification' })}
              activeOpacity={0.92}
              style={{
                backgroundColor: '#FEE2E2',
                borderRadius: RADIUS.lg,
                padding: 16,
                borderWidth: 1,
                borderColor: '#FCA5A5',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: RADIUS.md,
                  backgroundColor: '#FCA5A530',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Feather name="x-circle" size={20} color="#B91C1C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#B91C1C' }}>
                  Верификация отклонена
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                  Нажмите, чтобы повторно отправить документы
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#B91C1C" />
            </PressableScale>
          </MotiView>
        )}

        {/* Stats Grid - Horizon Premium style */}
        <View style={{ paddingHorizontal: horizontalPadding, marginTop: 32 }}>
          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
            {STATS_TILES.slice(0, 2).map((stat, idx) => (
              <MotiView
                key={stat.label}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 100 }}
                style={{
                  ...SHADOWS.strict,
                  flex: 1,
                  backgroundColor: COLORS.surface,
                  borderRadius: RADIUS.xxl,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  padding: 20,
                }}
              >
                <View
                  style={{
                    backgroundColor: `${stat.color}10`,
                    width: 40,
                    height: 40,
                    borderRadius: RADIUS.md,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}
                >
                  <Feather name={stat.icon} size={20} color={stat.color} />
                </View>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '900',
                    color: COLORS.foreground,
                  }}
                >
                  {stat.value}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: COLORS.mutedForeground,
                    textTransform: 'uppercase',
                    marginTop: 4,
                  }}
                >
                  {stat.label}
                </Text>
              </MotiView>
            ))}
          </View>
          <View className="flex-row gap-4 mb-8">
            {STATS_TILES.slice(2, 4).map((stat, idx) => (
              <MotiView
                key={stat.label}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 200 + idx * 100 }}
                style={{
                  ...SHADOWS.strict,
                  flex: 1,
                  backgroundColor: COLORS.surface,
                  borderRadius: RADIUS.xxl,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  padding: 20,
                }}
              >
                <View
                  style={{
                    backgroundColor: `${stat.color}10`,
                    width: 40,
                    height: 40,
                    borderRadius: RADIUS.md,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}
                >
                  <Feather name={stat.icon} size={20} color={stat.color} />
                </View>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '900',
                    color: COLORS.foreground,
                  }}
                >
                  {stat.value}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: COLORS.mutedForeground,
                    textTransform: 'uppercase',
                    marginTop: 4,
                  }}
                >
                  {stat.label}
                </Text>
              </MotiView>
            ))}
          </View>
        </View>

        {/* Quick Actions - High Fidelity Cards */}
        <View
          style={{
            paddingHorizontal: horizontalPadding,
            opacity: isVerified ? 1 : 0.5,
          }}
        >
          <Text
            style={{
              fontSize: TYPOGRAPHY.size.lg,
              fontWeight: TYPOGRAPHY.weight.semibold,
              color: COLORS.foreground,
              marginBottom: 16,
              paddingLeft: 4,
            }}
          >
            Управление
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 16,
              marginBottom: 32,
            }}
          >
            {ORG_HOME_QUICK_ACTIONS.map((item, idx) => {
              const badge = item.label === 'Заявки' ? stats.pendingCount : 0;
              return (
                <MotiView
                  key={item.label}
                  from={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 300 + idx * 50 }}
                  style={{
                    ...SHADOWS.strict,
                    flexBasis: isDesktop ? '22%' : '47%',
                    flexGrow: 1,
                    backgroundColor: COLORS.surface,
                    padding: 24,
                    borderRadius: RADIUS.xxl,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <PressableScale onPress={() => navigateApp(router, user?.role, item.route)}>
                    <View
                      style={{
                        backgroundColor: `${item.color}10`,
                        width: 48,
                        height: 48,
                        borderRadius: RADIUS.lg,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                      }}
                    >
                      <Feather
                        name={featherIconName(item.icon, 'circle')}
                        size={22}
                        color={item.color}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: COLORS.foreground,
                      }}
                    >
                      {item.label}
                    </Text>
                    {badge > 0 && (
                      <View
                        style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          backgroundColor: COLORS.destructive,
                          borderRadius: 12,
                          minWidth: 24,
                          height: 24,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 2,
                          borderColor: 'white',
                          ...SHADOWS.sm,
                        }}
                      >
                        <Text className="text-[10px] font-black text-white">{badge}</Text>
                      </View>
                    )}
                  </PressableScale>
                </MotiView>
              );
            })}
          </View>

          {/* Schedule Preview Elegant */}
          <Text
            style={{
              fontSize: TYPOGRAPHY.size.lg,
              fontWeight: TYPOGRAPHY.weight.semibold,
              color: COLORS.foreground,
              marginBottom: 16,
              paddingLeft: 4,
            }}
          >
            График на сегодня
          </Text>
          <View
            style={{
              ...SHADOWS.strict,
              backgroundColor: COLORS.surface,
              borderRadius: RADIUS.xxl,
              padding: 20,
              borderWidth: 1,
              borderColor: COLORS.border,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 32,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                backgroundColor: COLORS.muted,
                borderRadius: RADIUS.xl,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}
            >
              <Feather name="calendar" size={24} color={COLORS.primary} />
            </View>
            {firstClass ? (
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '800',
                    color: COLORS.foreground,
                  }}
                >
                  {firstClass.subject}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: COLORS.mutedForeground,
                    marginTop: 2,
                  }}
                >
                  {firstClass.group_name}
                  {firstClass.room
                    ? ` · ${firstClass.time_label} (${firstClass.room})`
                    : ` · ${firstClass.time_label}`}
                </Text>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '800',
                    color: COLORS.foreground,
                  }}
                >
                  Нет занятий сегодня
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: COLORS.mutedForeground,
                    marginTop: 2,
                  }}
                >
                  Посмотрите расписание на другой день
                </Text>
              </View>
            )}
            <PressableScale
              onPress={() => navigateApp(router, user?.role, { name: 'orgSchedule' })}
            >
              <Feather name="chevron-right" size={20} color={COLORS.mutedForeground} />
            </PressableScale>
          </View>
        </View>
        {/* Finance - Premium System Widget */}
        <View style={{ paddingHorizontal: horizontalPadding }} className="mb-8">
          <View className="flex-row justify-between items-center mb-4 px-1">
            <View className="flex-row items-center gap-2">
              <Feather name="dollar-sign" size={20} color={'#10B981'} />
              <Text
                style={{
                  fontSize: TYPOGRAPHY.size.lg,
                  fontWeight: TYPOGRAPHY.weight.semibold,
                  color: COLORS.foreground,
                }}
              >
                Финансы и Оплата
              </Text>
            </View>
            <View className="bg-green-100 px-2 py-0.5 rounded-full">
              <Text className="text-green-600 text-[10px] font-black uppercase">
                Split payment activo
              </Text>
            </View>
          </View>

          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={{
              ...SHADOWS.strict,
              backgroundColor: COLORS.surface,
              borderRadius: RADIUS.xxl,
              padding: 24,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderLeftWidth: 6,
              borderLeftColor: '#10B981',
            }}
          >
            <View className="flex-row justify-between items-start mb-6">
              <View>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.huge,
                    fontWeight: TYPOGRAPHY.weight.bold,
                    color: COLORS.foreground,
                    letterSpacing: -1,
                  }}
                >
                  {formatKZT(walletSummary.periodRevenue)}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: COLORS.mutedForeground,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    marginTop: 4,
                  }}
                >
                  Баланс текущего месяца
                </Text>
              </View>
              <PressableScale className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center border border-gray-100">
                <Feather name="external-link" size={18} color={COLORS.mutedForeground} />
              </PressableScale>
            </View>

            <View className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center gap-2">
                  <View className="w-2 h-2 rounded-full bg-green-500" />
                  <Text className="text-sm font-bold text-gray-700">Ваша доля (90%)</Text>
                </View>
                <Text className="text-sm font-black text-gray-900">
                  {formatKZT(walletSummary.availableBalance)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center opacity-40">
                <View className="flex-row items-center gap-2">
                  <View className="w-2 h-2 rounded-full bg-gray-400" />
                  <Text className="text-sm font-medium text-gray-700">Комиссия (10%)</Text>
                </View>
                <Text className="text-sm font-bold text-gray-900">
                  -{formatKZT(walletSummary.commission)}
                </Text>
              </View>
            </View>

            <PressableScale
              onPress={() => navigateApp(router, user?.role, { name: 'orgWallet' })}
              className="bg-gray-900 py-4 rounded-2xl items-center shadow-sm"
            >
              <Text className="text-white font-bold uppercase tracking-widest text-xs">
                Вывод средств
              </Text>
            </PressableScale>
          </MotiView>
        </View>

        {/* Creation Center Premium */}
        <View style={{ paddingHorizontal: horizontalPadding }} className="mb-2">
          <Text
            style={{
              fontSize: TYPOGRAPHY.size.lg,
              fontWeight: TYPOGRAPHY.weight.semibold,
              color: COLORS.foreground,
              marginBottom: 16,
              paddingLeft: 4,
            }}
          >
            Центр создания
          </Text>
          <View className="flex-row gap-4">
            <PressableScale
              onPress={() => navigateApp(router, user?.role, { name: 'orgCourseCreate' })}
              activeOpacity={0.9}
              style={{
                ...SHADOWS.md,
                flex: 1,
                height: 160,
                backgroundColor: COLORS.primary,
                borderRadius: RADIUS.xxl,
                padding: 24,
                overflow: 'hidden',
              }}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0)']}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mb-auto border border-white/20">
                <Feather name="plus-circle" size={24} color="white" />
              </View>
              <Text className="text-white font-black text-xl leading-6">Новый курс</Text>
              <Text className="text-white/60 text-[10px] font-bold uppercase mt-1 tracking-wider">
                Программа
              </Text>
            </PressableScale>

            <PressableScale
              onPress={() => navigateApp(router, user?.role, { name: 'orgStaffAdd' })}
              activeOpacity={0.9}
              style={{
                ...SHADOWS.md,
                flex: 1,
                height: 160,
                backgroundColor: '#8B5CF6',
                borderRadius: RADIUS.xxl,
                padding: 24,
                overflow: 'hidden',
              }}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0)']}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mb-auto border border-white/20">
                <Feather name="user-plus" size={24} color="white" />
              </View>
              <Text className="text-white font-black text-xl leading-6">Учитель</Text>
              <Text className="text-white/60 text-[10px] font-bold uppercase mt-1 tracking-wider">
                Доступ
              </Text>
            </PressableScale>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
