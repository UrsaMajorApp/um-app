// Экран admin/organizations: загружает и показывает организации и их статусы проверки в кабинете администратора.
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { AdminHeader } from '$components/admin/AdminHeader';
import { EmptyState } from '$components/admin/EmptyState';
import { SegmentTabs } from '$components/admin/SegmentTabs';
import { LEVEL_LABELS } from '$constants/courseOptions';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import {
  type AdminCourse,
  useAdminCourses,
  useAdminEnrollments,
  useOrganizations,
} from '$hooks/useAdminData';
import { ensureConversation } from '$lib/adminUtils';
import { formatKZT } from '$lib/formatCurrency';
import type { AdminOrgTab } from '$types/admin';

export default function AdminOrganizationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const orgs = useOrganizations();
  const courses = useAdminCourses();
  const enrollments = useAdminEnrollments();
  const [tab, setTab] = useState<AdminOrgTab>('orgs');
  const [rejectingCourse, setRejectingCourse] = useState<AdminCourse | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const orgsNeedingAction = orgs.data.filter(
    (o) => o.status === 'pending' || o.status === 'ready_for_review',
  );
  const pendingCourses = courses.data.filter((c) => c.status === 'draft');
  const pendingEnrollments = enrollments.data.filter((e) => e.status === 'awaiting_payment');

  const openOrgChat = async (orgName: string, ownerUserId: string | null) => {
    if (!user?.id || !ownerUserId) {
      Alert.alert('Нет владельца', 'У организации не указан владелец.');
      return;
    }
    const { id, error } = await ensureConversation(user.id, ownerUserId, orgName, 'briefcase');
    if (!id) {
      Alert.alert('Ошибка', error ?? 'Не удалось создать чат');
      return;
    }
    router.push({
      pathname: '/(tabs)/chats/[id]',
      params: { id, name: orgName },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader title="Организации" subtitle="Верификация центров, модерация курсов и записи" />
      <SegmentTabs
        value={tab}
        onChange={setTab}
        tabs={[
          {
            key: 'orgs',
            label: `Организации${orgsNeedingAction.length > 0 ? ` (${orgsNeedingAction.length})` : ''}`,
          },
          {
            key: 'courses',
            label: `Курсы${pendingCourses.length > 0 ? ` (${pendingCourses.length})` : ''}`,
          },
          {
            key: 'enrollments',
            label: `Записи${pendingEnrollments.length > 0 ? ` (${pendingEnrollments.length})` : ''}`,
          },
        ]}
      />
      <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
        {tab === 'orgs' && orgs.loading ? (
          <Text style={{ padding: SPACING.lg, color: COLORS.mutedForeground }}>Загрузка...</Text>
        ) : null}

        {tab === 'orgs' && !orgs.loading && orgs.data.length === 0 ? (
          <EmptyState title="Организаций пока нет" />
        ) : null}

        {tab === 'orgs' &&
          orgs.data.map((org) => {
            const activeCourses = courses.data.filter(
              (course) => course.org_id === org.id && course.status === 'active',
            ).length;

            const statusColor =
              org.status === 'verified'
                ? COLORS.success
                : org.status === 'rejected'
                  ? COLORS.destructive
                  : COLORS.primary;

            const statusLabel =
              org.status === 'verified'
                ? 'Активна'
                : org.status === 'rejected'
                  ? 'Отклонена'
                  : org.status === 'new'
                    ? 'Новая'
                    : 'На проверке';

            return (
              <View
                key={org.id}
                style={{
                  padding: SPACING.lg,
                  borderBottomWidth: 1,
                  borderColor: COLORS.border,
                  backgroundColor: COLORS.surface,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: SPACING.md,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: RADIUS.lg,
                    backgroundColor: `${COLORS.primary}15`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Feather name="briefcase" size={24} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.md,
                      fontWeight: '700',
                      color: COLORS.foreground,
                    }}
                  >
                    {org.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.xs,
                      color: COLORS.mutedForeground,
                      marginTop: 2,
                    }}
                  >
                    {org.category ?? '—'} • {org.active_students} учеников • {activeCourses}{' '}
                    активных курсов
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: SPACING.sm,
                    alignItems: 'center',
                  }}
                >
                  <PressableScale
                    onPress={() => openOrgChat(org.name, org.owner_user_id)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: RADIUS.md,
                      backgroundColor: `${COLORS.primary}15`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Feather name="message-circle" size={16} color={COLORS.primary} />
                  </PressableScale>
                  {org.status === 'pending' || org.status === 'ready_for_review' ? (
                    <>
                      <PressableScale
                        onPress={() => orgs.verify(org.id)}
                        style={{
                          backgroundColor: COLORS.success,
                          paddingHorizontal: SPACING.md,
                          paddingVertical: SPACING.sm,
                          borderRadius: RADIUS.md,
                        }}
                      >
                        <Text
                          style={{
                            color: COLORS.white,
                            fontSize: TYPOGRAPHY.size.xs,
                            fontWeight: 'bold',
                          }}
                        >
                          Активировать
                        </Text>
                      </PressableScale>
                      <PressableScale
                        onPress={() => orgs.reject(org.id)}
                        style={{
                          backgroundColor: COLORS.destructive,
                          paddingHorizontal: SPACING.md,
                          paddingVertical: SPACING.sm,
                          borderRadius: RADIUS.md,
                        }}
                      >
                        <Text
                          style={{
                            color: COLORS.white,
                            fontSize: TYPOGRAPHY.size.xs,
                            fontWeight: 'bold',
                          }}
                        >
                          Отклонить
                        </Text>
                      </PressableScale>
                    </>
                  ) : (
                    <Text
                      style={{
                        color: statusColor,
                        fontSize: 10,
                        fontWeight: '900',
                        textTransform: 'uppercase',
                      }}
                    >
                      {statusLabel}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}

        {tab === 'courses' && courses.loading ? (
          <Text style={{ padding: SPACING.lg, color: COLORS.mutedForeground }}>Загрузка...</Text>
        ) : null}

        {tab === 'courses' && !courses.loading && courses.data.length === 0 ? (
          <EmptyState title="Нет курсов на модерации" icon="check-circle" />
        ) : null}

        {tab === 'courses' &&
          courses.data.map((course) => {
            const isPending = course.status === 'draft';
            return (
              <View
                key={course.id}
                style={{
                  padding: SPACING.lg,
                  borderBottomWidth: 1,
                  borderColor: COLORS.border,
                  backgroundColor: COLORS.surface,
                }}
              >
                <View style={{ flexDirection: 'row', gap: SPACING.md }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.size.md,
                        fontWeight: '700',
                        color: COLORS.foreground,
                      }}
                    >
                      {course.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.size.xs,
                        color: COLORS.mutedForeground,
                        marginTop: 2,
                      }}
                    >
                      {course.org_name} • {LEVEL_LABELS[course.level] ?? course.level} •{' '}
                      {formatKZT(course.price)}/мес
                    </Text>
                    {course.description ? (
                      <Text
                        style={{
                          fontSize: TYPOGRAPHY.size.xs,
                          color: COLORS.mutedForeground,
                          marginTop: 4,
                        }}
                        numberOfLines={2}
                      >
                        {course.description}
                      </Text>
                    ) : null}
                  </View>
                  <Text
                    style={{
                      color: isPending
                        ? '#854D0E'
                        : course.status === 'active'
                          ? COLORS.success
                          : COLORS.destructive,
                      fontSize: 10,
                      fontWeight: '900',
                      textTransform: 'uppercase',
                    }}
                  >
                    {isPending
                      ? 'На модерации'
                      : course.status === 'active'
                        ? 'Активен'
                        : 'Отклонен'}
                  </Text>
                </View>
                {isPending ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: SPACING.sm,
                      marginTop: SPACING.sm,
                    }}
                  >
                    <PressableScale
                      onPress={() => courses.approveCourse(course.id)}
                      style={{
                        flex: 1,
                        backgroundColor: COLORS.success,
                        paddingVertical: SPACING.sm,
                        borderRadius: RADIUS.md,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>Опубликовать</Text>
                    </PressableScale>
                    <PressableScale
                      onPress={() => {
                        setRejectingCourse(course);
                        setRejectReason('');
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: COLORS.destructive,
                        paddingVertical: SPACING.sm,
                        borderRadius: RADIUS.md,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>Отклонить</Text>
                    </PressableScale>
                  </View>
                ) : null}
              </View>
            );
          })}
        {tab === 'enrollments' && enrollments.data.length === 0 ? (
          <EmptyState title="Заявок нет" />
        ) : null}
        {tab === 'enrollments' &&
          enrollments.data.map((enrollment) => (
            <View
              key={enrollment.id}
              style={{
                padding: SPACING.lg,
                borderBottomWidth: 1,
                borderColor: COLORS.border,
                backgroundColor: COLORS.surface,
              }}
            >
              <Text
                style={{
                  fontSize: TYPOGRAPHY.size.md,
                  fontWeight: '700',
                  color: COLORS.foreground,
                }}
              >
                {enrollment.child_name}
                {enrollment.child_age ? `, ${enrollment.child_age} лет` : ''}
              </Text>
              <Text
                style={{
                  fontSize: TYPOGRAPHY.size.xs,
                  color: COLORS.mutedForeground,
                  marginTop: 2,
                }}
              >
                {enrollment.parent_name ? `Родитель: ${enrollment.parent_name} • ` : ''}
                {enrollment.club ?? '—'} • {enrollment.org_name}
              </Text>
              {enrollment.status === 'awaiting_payment' || enrollment.status === 'paid' ? (
                <View
                  style={{
                    flexDirection: 'row',
                    gap: SPACING.sm,
                    marginTop: SPACING.sm,
                  }}
                >
                  {enrollment.status === 'awaiting_payment' ? (
                    <PressableScale
                      onPress={() => enrollments.markPaid(enrollment.id)}
                      style={{
                        flex: 1,
                        backgroundColor: COLORS.success,
                        paddingVertical: SPACING.sm,
                        borderRadius: RADIUS.md,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>
                        Отметить оплаченным
                      </Text>
                    </PressableScale>
                  ) : null}
                  {enrollment.status === 'paid' ? (
                    <PressableScale
                      onPress={() => enrollments.activate(enrollment.id)}
                      style={{
                        flex: 1,
                        backgroundColor: COLORS.primary,
                        paddingVertical: SPACING.sm,
                        borderRadius: RADIUS.md,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>Активировать</Text>
                    </PressableScale>
                  ) : null}
                  <PressableScale
                    onPress={() => enrollments.reject(enrollment.id)}
                    style={{
                      flex: 1,
                      backgroundColor: COLORS.destructive,
                      paddingVertical: SPACING.sm,
                      borderRadius: RADIUS.md,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>Отклонить</Text>
                  </PressableScale>
                </View>
              ) : null}
            </View>
          ))}
      </ScrollView>
      <Modal
        visible={!!rejectingCourse}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectingCourse(null)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: SPACING.xl,
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 480,
              backgroundColor: COLORS.surface,
              borderRadius: RADIUS.xl,
              padding: SPACING.xl,
              gap: SPACING.md,
            }}
          >
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.lg,
                fontWeight: '900',
                color: COLORS.foreground,
              }}
            >
              Причина отклонения
            </Text>
            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Укажите причину"
              multiline
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: RADIUS.md,
                padding: SPACING.md,
                minHeight: 80,
                color: COLORS.foreground,
              }}
            />
            <PressableScale
              onPress={async () => {
                if (rejectingCourse)
                  await courses.rejectCourse(rejectingCourse.id, rejectReason.trim() || undefined);
                setRejectingCourse(null);
              }}
              style={{
                padding: SPACING.md,
                borderRadius: RADIUS.lg,
                backgroundColor: COLORS.destructive,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: COLORS.white, fontWeight: '900' }}>Отклонить</Text>
            </PressableScale>
          </View>
        </View>
      </Modal>
    </View>
  );
}
