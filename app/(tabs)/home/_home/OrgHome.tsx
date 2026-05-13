// OrgHome: собирает виджеты и быстрые действия домашнего экрана для роли org.
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { ScrollView, Text, View } from 'react-native';
import { GradientScreenHeader } from '$components/ui/GradientScreenHeader';
import { PressableScale } from '$components/ui/PressableScale';
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
        <GradientScreenHeader
          title={orgName || 'Моя организация'}
          subtitle="Кабинет организации"
          paddingX={horizontalPadding}
          variant="dashboard"
          rightAccessory={
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
          }
        />

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

        <View style={{ paddingHorizontal: horizontalPadding, marginTop: 24, gap: 16 }}>
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={{
              ...SHADOWS.strict,
              backgroundColor: COLORS.surface,
              borderRadius: RADIUS.xxl,
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.lg,
                fontWeight: TYPOGRAPHY.weight.semibold,
                color: COLORS.foreground,
                marginBottom: 16,
              }}
            >
              Обзор
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {STATS_TILES.map((stat) => (
                <View
                  key={stat.label}
                  style={{
                    flexBasis: isDesktop ? '22%' : '47%',
                    flexGrow: 1,
                    minWidth: 120,
                    backgroundColor: COLORS.background,
                    borderRadius: RADIUS.lg,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: RADIUS.sm,
                        backgroundColor: `${stat.color}12`,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Feather name={stat.icon} size={15} color={stat.color} />
                    </View>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '700',
                        color: COLORS.mutedForeground,
                        textTransform: 'uppercase',
                      }}
                    >
                      {stat.label}
                    </Text>
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
                </View>
              ))}
            </View>
          </MotiView>

          <View
            style={{
              flexDirection: isDesktop ? 'row' : 'column',
              gap: 16,
              opacity: isVerified ? 1 : 0.55,
            }}
          >
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 80 }}
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
              <Text
                style={{
                  fontSize: TYPOGRAPHY.size.lg,
                  fontWeight: TYPOGRAPHY.weight.semibold,
                  color: COLORS.foreground,
                  marginBottom: 14,
                }}
              >
                Действия
              </Text>
              <View style={{ gap: 10 }}>
                {ORG_HOME_QUICK_ACTIONS.map((item) => {
                  const badge = item.label === 'Заявки' ? stats.pendingCount : 0;
                  return (
                    <PressableScale
                      key={item.label}
                      onPress={() => navigateApp(router, user?.role, item.route)}
                      style={{
                        minHeight: 52,
                        borderRadius: RADIUS.lg,
                        borderWidth: 1,
                        borderColor: COLORS.border,
                        backgroundColor: COLORS.background,
                        paddingHorizontal: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: RADIUS.sm,
                          backgroundColor: `${item.color}12`,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Feather
                          name={featherIconName(item.icon, 'circle')}
                          size={16}
                          color={item.color}
                        />
                      </View>
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 14,
                          fontWeight: '800',
                          color: COLORS.foreground,
                        }}
                      >
                        {item.label}
                      </Text>
                      {badge > 0 ? (
                        <View
                          style={{
                            minWidth: 26,
                            height: 26,
                            borderRadius: 13,
                            backgroundColor: COLORS.destructive,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={{ color: 'white', fontSize: 11, fontWeight: '900' }}>
                            {badge}
                          </Text>
                        </View>
                      ) : (
                        <Feather name="chevron-right" size={18} color={COLORS.mutedForeground} />
                      )}
                    </PressableScale>
                  );
                })}
              </View>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 120 }}
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
              <Text
                style={{
                  fontSize: TYPOGRAPHY.size.lg,
                  fontWeight: TYPOGRAPHY.weight.semibold,
                  color: COLORS.foreground,
                  marginBottom: 14,
                }}
              >
                Сегодня
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: COLORS.muted,
                    borderRadius: RADIUS.lg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Feather name="calendar" size={22} color={COLORS.primary} />
                </View>
                {firstClass ? (
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '900',
                        color: COLORS.foreground,
                      }}
                    >
                      {firstClass.subject}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: COLORS.mutedForeground,
                        marginTop: 3,
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
                        fontSize: 15,
                        fontWeight: '900',
                        color: COLORS.foreground,
                      }}
                    >
                      Нет занятий
                    </Text>
                    <Text style={{ fontSize: 12, color: COLORS.mutedForeground, marginTop: 3 }}>
                      Расписание на сегодня пустое
                    </Text>
                  </View>
                )}
              </View>
              <PressableScale
                onPress={() => navigateApp(router, user?.role, { name: 'orgSchedule' })}
                style={{
                  marginTop: 16,
                  height: 44,
                  borderRadius: RADIUS.md,
                  backgroundColor: COLORS.background,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: COLORS.primary, fontWeight: '800', fontSize: 13 }}>
                  Открыть расписание
                </Text>
              </PressableScale>
            </MotiView>
          </View>

          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 160 }}
            style={{
              ...SHADOWS.strict,
              backgroundColor: COLORS.surface,
              borderRadius: RADIUS.xxl,
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 20,
              borderLeftWidth: 5,
              borderLeftColor: '#10B981',
            }}
          >
            <View
              style={{
                flexDirection: isDesktop ? 'row' : 'column',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.lg,
                    fontWeight: TYPOGRAPHY.weight.semibold,
                    color: COLORS.foreground,
                  }}
                >
                  Финансы
                </Text>
                <Text
                  style={{
                    marginTop: 10,
                    fontSize: TYPOGRAPHY.size.xxxl,
                    fontWeight: '900',
                    color: COLORS.foreground,
                  }}
                >
                  {formatKZT(walletSummary.periodRevenue)}
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    color: COLORS.mutedForeground,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                  }}
                >
                  Доход за период
                </Text>
              </View>
              <View style={{ flex: 1, gap: 10 }}>
                <View
                  style={{
                    backgroundColor: COLORS.background,
                    borderRadius: RADIUS.lg,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <Text style={{ fontSize: 11, color: COLORS.mutedForeground, fontWeight: '700' }}>
                    Доступно к выводу
                  </Text>
                  <Text
                    style={{
                      marginTop: 4,
                      fontSize: 18,
                      fontWeight: '900',
                      color: COLORS.foreground,
                    }}
                  >
                    {formatKZT(walletSummary.availableBalance)}
                  </Text>
                </View>
                <PressableScale
                  onPress={() => navigateApp(router, user?.role, { name: 'orgWallet' })}
                  style={{
                    height: 46,
                    borderRadius: RADIUS.md,
                    backgroundColor: COLORS.foreground,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '900', fontSize: 13 }}>
                    Вывод средств
                  </Text>
                </PressableScale>
              </View>
            </View>
          </MotiView>
        </View>
      </ScrollView>
    </View>
  );
}
