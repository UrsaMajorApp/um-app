import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { appHref } from '$lib/router';
import { MotiView } from 'moti';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, LAYOUT, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '$constants/theme';
import { useOrgGroups, useOrgStaffById } from '$hooks/useOrgData';
import { useIsDesktop } from '$lib/useIsDesktop';

export default function StaffDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = isDesktop ? LAYOUT.dashboardHorizontalPaddingDesktop : SPACING.xl;

  const { member: staff, loading: staffLoading } = useOrgStaffById(id);
  const { groups, loading: groupsLoading } = useOrgGroups();

  const loading = staffLoading || groupsLoading;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View
        style={{
          backgroundColor: COLORS.primary,
          borderBottomLeftRadius: RADIUS.xxl,
          borderBottomRightRadius: RADIUS.xxl,
          overflow: 'hidden',
        }}
      >
        <LinearGradient colors={COLORS.gradients.header} style={{ paddingBottom: SPACING.xl }}>
          <SafeAreaView edges={['top']}>
            <MotiView
              from={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={{ paddingHorizontal: paddingX, paddingTop: SPACING.md }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: SPACING.xl,
                }}
              >
                <TouchableOpacity
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
                </TouchableOpacity>
                <Text
                  style={{
                    flex: 1,
                    fontSize: TYPOGRAPHY.size.xl,
                    fontWeight: TYPOGRAPHY.weight.semibold,
                    color: 'white',
                  }}
                >
                  Профиль преподавателя
                </Text>
              </View>

              {staff ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 20,
                  }}
                >
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: RADIUS.full,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: 'rgba(255,255,255,0.3)',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.size.huge,
                        fontWeight: TYPOGRAPHY.weight.bold,
                        color: 'white',
                      }}
                    >
                      {staff.full_name.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.size.xxl,
                        fontWeight: TYPOGRAPHY.weight.semibold,
                        color: 'white',
                        marginBottom: 2,
                      }}
                    >
                      {staff.full_name}
                    </Text>
                    <Text
                      style={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: TYPOGRAPHY.size.sm,
                        fontWeight: TYPOGRAPHY.weight.medium,
                        marginBottom: 8,
                      }}
                    >
                      {staff.specialization ?? '—'}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        alignSelf: 'flex-start',
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: RADIUS.md,
                      }}
                    >
                      <Feather name="star" size={10} color="#FFD700" />
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 11,
                          fontWeight: TYPOGRAPHY.weight.bold,
                        }}
                      >
                        {staff.rating.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : loading ? (
                <ActivityIndicator color="white" />
              ) : null}
            </MotiView>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: paddingX,
          paddingTop: SPACING.xl,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View
          style={{
            flexDirection: 'row',
            gap: SPACING.md,
            marginBottom: SPACING.xl,
          }}
        >
          <View
            style={{
              ...SHADOWS.strict,
              flex: 1,
              backgroundColor: COLORS.white,
              borderRadius: RADIUS.xxl,
              padding: SPACING.xl,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                backgroundColor: 'rgba(108, 92, 231, 0.05)',
                borderRadius: RADIUS.lg,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: SPACING.sm,
              }}
            >
              <Feather name="layers" size={24} color={COLORS.primary} />
            </View>
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.xxl,
                fontWeight: TYPOGRAPHY.weight.bold,
                color: COLORS.foreground,
              }}
            >
              {groups.length}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: COLORS.mutedForeground,
                fontWeight: TYPOGRAPHY.weight.bold,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Групп
            </Text>
          </View>
          <View
            style={{
              ...SHADOWS.strict,
              flex: 1,
              backgroundColor: COLORS.white,
              borderRadius: RADIUS.xxl,
              padding: SPACING.xl,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                borderRadius: RADIUS.lg,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: SPACING.sm,
              }}
            >
              <Feather name="users" size={24} color="#3B82F6" />
            </View>
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.xxl,
                fontWeight: TYPOGRAPHY.weight.bold,
                color: COLORS.foreground,
              }}
            >
              {groups.reduce((sum, g) => sum + g.enrolled, 0)}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: COLORS.mutedForeground,
                fontWeight: TYPOGRAPHY.weight.bold,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Учеников
            </Text>
          </View>
        </View>

        {/* Contact Info */}
        {staff && (
          <View
            style={{
              ...SHADOWS.strict,
              backgroundColor: COLORS.white,
              borderRadius: RADIUS.xxl,
              padding: SPACING.xl,
              marginBottom: SPACING.xl,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.lg,
                fontWeight: TYPOGRAPHY.weight.semibold,
                color: COLORS.foreground,
                marginBottom: SPACING.lg,
              }}
            >
              Контактная информация
            </Text>
            <View style={{ gap: SPACING.md }}>
              {staff.phone && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: SPACING.md,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      backgroundColor: COLORS.background,
                      borderRadius: RADIUS.md,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Feather name="phone" size={18} color={COLORS.primary} />
                  </View>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.md,
                      fontWeight: TYPOGRAPHY.weight.medium,
                      color: COLORS.foreground,
                    }}
                  >
                    {staff.phone}
                  </Text>
                </View>
              )}
              {staff.email && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: SPACING.md,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      backgroundColor: COLORS.background,
                      borderRadius: RADIUS.md,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Feather name="mail" size={18} color={COLORS.primary} />
                  </View>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.md,
                      fontWeight: TYPOGRAPHY.weight.medium,
                      color: COLORS.foreground,
                    }}
                  >
                    {staff.email}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Groups List */}
        <Text
          style={{
            fontSize: TYPOGRAPHY.size.lg,
            fontWeight: TYPOGRAPHY.weight.semibold,
            color: COLORS.foreground,
            marginBottom: SPACING.md,
          }}
        >
          Группы организации
        </Text>

        {!loading && groups.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Feather name="layers" size={36} color={COLORS.muted} />
            <Text
              style={{
                marginTop: 12,
                color: COLORS.mutedForeground,
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              Нет групп
            </Text>
          </View>
        )}

        <View style={{ gap: SPACING.sm }}>
          {groups.map((group) => (
            <TouchableOpacity
              key={group.id}
              onPress={() => router.push(appHref(`/organization/group/${group.id}`))}
              style={{
                ...SHADOWS.sm,
                backgroundColor: COLORS.white,
                borderRadius: RADIUS.xxl,
                padding: SPACING.xl,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.md,
                      fontWeight: TYPOGRAPHY.weight.semibold,
                      color: COLORS.foreground,
                      marginBottom: 2,
                    }}
                  >
                    {group.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.xs,
                      color: COLORS.mutedForeground,
                      fontWeight: TYPOGRAPHY.weight.medium,
                    }}
                  >
                    {group.course ?? '—'}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: COLORS.background,
                    paddingHorizontal: SPACING.md,
                    paddingVertical: SPACING.sm,
                    borderRadius: RADIUS.lg,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Feather name="users" size={12} color={COLORS.primary} />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: TYPOGRAPHY.weight.bold,
                      color: COLORS.primary,
                    }}
                  >
                    {group.enrolled}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
