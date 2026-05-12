// Экран admin/users: загружает и показывает пользователей, семьи и роли в кабинете администратора.
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { AdminHeader } from '$components/admin/AdminHeader';
import { EmptyState } from '$components/admin/EmptyState';
import { SegmentTabs } from '$components/admin/SegmentTabs';
import { ROLE_COLORS, ROLE_LABELS, USER_ROLES } from '$constants/admin';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import {
  type MentorApp,
  useAdminStats,
  useAllUsers,
  useFamilies,
  useMentorApps,
} from '$hooks/useAdminData';
import { ensureConversation, formatAdminDate, useAdminLayout } from '$lib/adminUtils';
import type { AdminUsersTab } from '$types/admin';

export default function AdminUsersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isTablet, paddingX } = useAdminLayout();
  const mentorApps = useMentorApps();
  const users = useAllUsers();
  const families = useFamilies();
  const stats = useAdminStats(mentorApps.data, [], families.data);
  const [tab, setTab] = useState<AdminUsersTab>('mentors');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<MentorApp | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const selectedMentor =
    mentorApps.data.find((m) => m.id === selectedMentorId) ??
    mentorApps.data.find((m) => m.status === 'pending') ??
    null;
  const filteredMentors = mentorApps.data.filter((m) => {
    const matchesStatus = tab === 'active_mentors' ? m.status === 'approved' : true;
    return (
      matchesStatus && (search.trim() === '' || m.name.toLowerCase().includes(search.toLowerCase()))
    );
  });
  const filteredUsers = users.data.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const fullName = `${u.first_name ?? ''} ${u.last_name ?? ''}`.toLowerCase();
    return (
      matchesRole &&
      (search.trim() === '' ||
        fullName.includes(search.toLowerCase()) ||
        (u.phone ?? '').includes(search))
    );
  });

  const openMentorChat = async (mentor: MentorApp) => {
    if (!user?.id || !mentor.user_id) {
      Alert.alert('Чат недоступен', 'У ментора нет привязанного аккаунта.');
      return;
    }
    const { id, error } = await ensureConversation(user.id, mentor.user_id, mentor.name, 'user');
    if (!id) {
      Alert.alert('Ошибка', error ?? 'Не удалось создать чат');
      return;
    }
    router.push({
      pathname: '/(tabs)/chats/[id]',
      params: { id, name: mentor.name },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader title="Пользователи" subtitle="Аккаунты, семьи и заявки менторов" />
      <View
        style={{
          padding: paddingX,
          borderBottomWidth: 1,
          borderColor: COLORS.border,
          backgroundColor: COLORS.surface,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: COLORS.background,
            borderRadius: RADIUS.md,
            paddingHorizontal: SPACING.md,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          <Feather name="search" size={18} color={COLORS.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Поиск по имени или телефону..."
            style={{
              flex: 1,
              padding: SPACING.md,
              fontSize: TYPOGRAPHY.size.sm,
              color: COLORS.foreground,
            }}
          />
        </View>
      </View>
      <SegmentTabs
        value={tab}
        onChange={setTab}
        tabs={[
          {
            key: 'mentors',
            label: `Заявки${stats.pendingMentors > 0 ? ` (${stats.pendingMentors})` : ''}`,
          },
          {
            key: 'active_mentors',
            label: `Менторы (${mentorApps.data.filter((m) => m.status === 'approved').length})`,
          },
          { key: 'users', label: 'Все пользователи' },
          { key: 'families', label: 'Семьи' },
        ]}
      />
      {tab === 'users' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            paddingLeft: paddingX,
            marginBottom: SPACING.sm,
            flexGrow: 0,
          }}
        >
          {USER_ROLES.map((role) => (
            <PressableScale
              key={role}
              onPress={() => setRoleFilter(role)}
              style={{
                paddingVertical: 5,
                paddingHorizontal: 12,
                marginRight: 6,
                backgroundColor: roleFilter === role ? COLORS.foreground : COLORS.muted,
                borderRadius: RADIUS.full,
              }}
            >
              <Text
                style={{
                  color: roleFilter === role ? COLORS.white : COLORS.mutedForeground,
                  fontWeight: '700',
                  fontSize: 12,
                }}
              >
                {ROLE_LABELS[role]}
              </Text>
            </PressableScale>
          ))}
        </ScrollView>
      ) : null}
      <View style={{ flex: 1, flexDirection: isTablet ? 'row' : 'column' }}>
        <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
          {(tab === 'mentors' || tab === 'active_mentors') && mentorApps.loading ? (
            <Text style={{ padding: SPACING.lg, color: COLORS.mutedForeground }}>Загрузка...</Text>
          ) : null}
          {(tab === 'mentors' || tab === 'active_mentors') &&
          !mentorApps.loading &&
          filteredMentors.length === 0 ? (
            <EmptyState title="Менторов не найдено" />
          ) : null}
          {(tab === 'mentors' || tab === 'active_mentors') &&
            filteredMentors.map((mentor) => {
              const statusLabel =
                mentor.status === 'pending'
                  ? 'В ожидании'
                  : mentor.status === 'approved'
                    ? 'Одобрен'
                    : 'Отклонен';
              const statusColor =
                mentor.status === 'pending'
                  ? '#854D0E'
                  : mentor.status === 'approved'
                    ? COLORS.success
                    : COLORS.destructive;
              return (
                <PressableScale
                  key={mentor.id}
                  onPress={() => setSelectedMentorId(mentor.id)}
                  style={{
                    padding: SPACING.lg,
                    borderBottomWidth: 1,
                    borderColor: COLORS.border,
                    backgroundColor:
                      selectedMentor?.id === mentor.id ? `${COLORS.primary}05` : COLORS.surface,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: SPACING.md,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: RADIUS.full,
                      backgroundColor: `${COLORS.primary}15`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{mentor.photo_emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.size.md,
                        fontWeight: '700',
                        color: COLORS.foreground,
                      }}
                    >
                      {mentor.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.size.xs,
                        color: COLORS.mutedForeground,
                        marginTop: 2,
                      }}
                    >
                      {mentor.specialization ?? '—'}
                    </Text>
                  </View>
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
                </PressableScale>
              );
            })}
          {tab === 'users' &&
            filteredUsers.map((row) => {
              const rc = ROLE_COLORS[row.role] ?? {
                bg: '#F3F4F6',
                color: '#374151',
              };
              const name = `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim() || '—';
              return (
                <View
                  key={row.id}
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
                      width: 44,
                      height: 44,
                      borderRadius: RADIUS.full,
                      backgroundColor: rc.bg,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: rc.color,
                      }}
                    >
                      {(row.first_name ?? '?').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.size.md,
                        fontWeight: '700',
                        color: COLORS.foreground,
                      }}
                    >
                      {name}
                    </Text>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.size.xs,
                        color: COLORS.mutedForeground,
                        marginTop: 1,
                      }}
                    >
                      {row.phone ?? '—'} • {formatAdminDate(row.updated_at)}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: rc.bg,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: RADIUS.full,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: 'bold',
                        color: rc.color,
                        textTransform: 'uppercase',
                      }}
                    >
                      {ROLE_LABELS[row.role] ?? row.role}
                    </Text>
                  </View>
                </View>
              );
            })}
          {tab === 'families' &&
            families.data.map((family) => (
              <View
                key={family.id}
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
                <Feather name="users" size={24} color={COLORS.mutedForeground} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.md,
                      fontWeight: '700',
                      color: COLORS.foreground,
                    }}
                  >
                    {family.parentName}
                  </Text>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.xs,
                      color: COLORS.mutedForeground,
                      marginTop: 2,
                    }}
                  >
                    Детей: {family.children}
                  </Text>
                </View>
                <Text
                  style={{
                    color: family.plan === 'Pro' ? COLORS.primary : COLORS.mutedForeground,
                    fontWeight: '900',
                  }}
                >
                  {family.plan}
                </Text>
              </View>
            ))}
        </ScrollView>
        {tab === 'mentors' && selectedMentor ? (
          <View
            style={{
              width: isTablet ? 320 : '100%',
              backgroundColor: COLORS.surface,
              borderLeftWidth: 1,
              borderColor: COLORS.border,
              padding: SPACING.xl,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 40, textAlign: 'center' }}>
                {selectedMentor.photo_emoji}
              </Text>
              <Text
                style={{
                  fontSize: TYPOGRAPHY.size.lg,
                  fontWeight: '900',
                  color: COLORS.foreground,
                  textAlign: 'center',
                  marginTop: SPACING.sm,
                }}
              >
                {selectedMentor.name}
              </Text>
              <Text
                style={{
                  fontSize: TYPOGRAPHY.size.sm,
                  color: COLORS.mutedForeground,
                  textAlign: 'center',
                }}
              >
                {selectedMentor.specialization ?? '—'}
              </Text>
              {selectedMentor.bio ? (
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.sm,
                    color: COLORS.mutedForeground,
                    lineHeight: 20,
                    marginVertical: SPACING.xl,
                  }}
                >
                  {selectedMentor.bio}
                </Text>
              ) : null}
              <PressableScale
                onPress={() => openMentorChat(selectedMentor)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: SPACING.sm,
                  padding: SPACING.md,
                  borderRadius: RADIUS.lg,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  marginBottom: SPACING.sm,
                }}
              >
                <Feather name="message-circle" size={16} color={COLORS.foreground} />
                <Text style={{ fontWeight: '700', color: COLORS.foreground }}>
                  Написать ментору
                </Text>
              </PressableScale>
              {selectedMentor.status === 'pending' ? (
                <View style={{ gap: SPACING.sm }}>
                  <PressableScale
                    onPress={() => mentorApps.approve(selectedMentor.id)}
                    style={{
                      backgroundColor: COLORS.success,
                      padding: SPACING.md,
                      borderRadius: RADIUS.lg,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: COLORS.white, fontWeight: '900' }}>Одобрить</Text>
                  </PressableScale>
                  <PressableScale
                    onPress={() => {
                      setRejecting(selectedMentor);
                      setRejectReason('');
                    }}
                    style={{
                      backgroundColor: COLORS.destructive,
                      padding: SPACING.md,
                      borderRadius: RADIUS.lg,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: COLORS.white, fontWeight: '900' }}>Отклонить</Text>
                  </PressableScale>
                </View>
              ) : null}
            </ScrollView>
          </View>
        ) : null}
      </View>
      <Modal
        visible={!!rejecting}
        transparent
        animationType="fade"
        onRequestClose={() => setRejecting(null)}
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
                if (rejecting)
                  await mentorApps.reject(rejecting.id, rejectReason.trim() || undefined);
                setRejecting(null);
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
