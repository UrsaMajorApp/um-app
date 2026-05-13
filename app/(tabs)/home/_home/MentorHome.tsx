// MentorHome: собирает виджеты и быстрые действия домашнего экрана для роли ментора.
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GradientScreenHeader } from '$components/ui/GradientScreenHeader';
import { PressableScale } from '$components/ui/PressableScale';
import { COLORS, SHADOWS } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { useMentorOwnProfile, useMentorRequests, useMentorStudents } from '$hooks/useMentorData';
import { useWalletData } from '$hooks/usePlatformData';
import { navigateApp } from '$lib/appNavigation';
import { formatKZT } from '$lib/formatCurrency';
import { getDashboardHorizontalPadding, useIsDesktop } from '$lib/useIsDesktop';

export default function MentorHome() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = getDashboardHorizontalPadding(isDesktop);

  const { user } = useAuth();
  const {
    profile: mentorProfile,
    loading: mentorProfileLoading,
    refresh: refreshMentorProfile,
  } = useMentorOwnProfile();
  const canLoadMentorWorkspace = mentorProfile?.status === 'approved';
  const { students } = useMentorStudents({ enabled: canLoadMentorWorkspace });
  const { requests, respond } = useMentorRequests({ enabled: canLoadMentorWorkspace });
  const { summary: walletSummary } = useWalletData('mentor');
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);

  const displayName = user?.firstName || 'Ментор';
  const todayTasks = requests.filter(
    (request) => request.request_type === 'session' && request.status === 'pending',
  );

  const mentorshipRequests = requests.filter(
    (r) => r.request_type === 'mentorship' && r.status === 'pending',
  );

  if (mentorProfileLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (mentorProfile?.status !== 'approved') {
    return (
      <MentorReviewState
        displayName={displayName}
        specialization={mentorProfile?.specialization}
        status={mentorProfile?.status ?? 'missing'}
        rejectionReason={mentorProfile?.rejection_reason}
        paddingX={paddingX}
        onRefresh={refreshMentorProfile}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <GradientScreenHeader
          title={`Добрый день, ${displayName}!`}
          subtitle={mentorProfile?.specialization ? `Ментор • ${mentorProfile.specialization}` : null}
          paddingX={paddingX}
          variant="dashboard"
          rightAccessory={
            !isDesktop ? (
              <PressableScale style={styles.bellBtn}>
                <Feather name="bell" size={20} color="white" />
                <View style={styles.bellDot} />
              </PressableScale>
            ) : null
          }
        >
          <View style={styles.statusToggle}>
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isAcceptingOrders ? '#4ADE80' : '#9CA3AF',
                    },
                  ]}
                />
                <Text style={styles.statusTitle}>Принимаю заказы</Text>
              </View>
              <Text style={styles.statusSub}>
                {isAcceptingOrders ? 'Вы видны в поиске' : 'Режим отпуска'}
              </Text>
            </View>
            <PressableScale
              onPress={() => setIsAcceptingOrders(!isAcceptingOrders)}
              style={[styles.switch, isAcceptingOrders && styles.switchActive]}
            >
              <MotiView
                animate={{ translateX: isAcceptingOrders ? 20 : 0 }}
                style={styles.switchThumb}
              />
            </PressableScale>
          </View>
        </GradientScreenHeader>

        <View style={{ paddingHorizontal: paddingX, marginTop: 24 }}>
          {/* Today's Tasks */}
          <View style={{ marginBottom: 32 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Задачи на сегодня</Text>
              <PressableScale
                onPress={() => navigateApp(router, user?.role, { name: 'mentorSessions' })}
              >
                <Text style={styles.viewAllBtn}>См. все</Text>
              </PressableScale>
            </View>
            <View style={{ gap: 12 }}>
              {todayTasks.length === 0 && (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>На сегодня нет заявок на сессии.</Text>
                </View>
              )}
              {todayTasks.map((task) => (
                <PressableScale
                  key={task.id}
                  style={styles.taskCard}
                  onPress={() => {
                    const targetStudent = students.find(
                      (s) =>
                        task.child_name && s.student_name.includes(task.child_name.split(' ')[0]),
                    );
                    if (targetStudent) {
                      navigateApp(router, user?.role, {
                        name: 'mentorStudentDetails',
                        studentId: targetStudent.id,
                      });
                    }
                  }}
                >
                  <View style={styles.taskTimeBox}>
                    <Text style={styles.taskTimeHour}>
                      {new Date(task.created_at).getHours().toString().padStart(2, '0')}
                    </Text>
                    <Text style={styles.taskTimeMin}>
                      {new Date(task.created_at).getMinutes().toString().padStart(2, '0')}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.taskChild}>{task.child_name || 'Новый ученик'}</Text>
                    <Text style={styles.taskSubject}>
                      {task.interest_text || 'Запрос на сессию'}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, styles.statusWait]}>
                    <Text style={[styles.statusText, styles.statusWaitText]}>Ожидает</Text>
                  </View>
                </PressableScale>
              ))}
            </View>
          </View>

          {/* Mentorship Requests */}
          {mentorshipRequests.length > 0 && (
            <View style={{ marginBottom: 32 }}>
              <Text style={styles.sectionTitle}>Заявки на сопровождение</Text>
              <View style={{ gap: 12, marginTop: 16 }}>
                {mentorshipRequests.map((req) => (
                  <View key={req.id} style={styles.requestCard}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        flex: 1,
                        gap: 12,
                      }}
                    >
                      <View style={styles.reqIconBox}>
                        <Feather name="user-plus" size={18} color={COLORS.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reqName}>{req.child_name || 'Новый ученик'}</Text>
                        <Text style={styles.reqSub}>
                          {req.interest_text || 'Хочет на пробный период'}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <PressableScale
                        onPress={() => respond(req.id, 'rejected')}
                        style={styles.actionBtnReject}
                      >
                        <Feather name="x" size={16} color="#EF4444" />
                      </PressableScale>
                      <PressableScale
                        onPress={() => respond(req.id, 'accepted')}
                        style={styles.actionBtnAccept}
                      >
                        <Feather name="check" size={16} color="#10B981" />
                      </PressableScale>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Quick Stats Widget */}
          <View style={styles.statsRow}>
            <PressableScale
              onPress={() => navigateApp(router, user?.role, { name: 'mentorWallet' })}
              style={styles.statInfoCard}
            >
              <View style={[styles.statIconBox, { backgroundColor: '#F0FDF4' }]}>
                <Feather name="trending-up" size={18} color="#16A34A" />
              </View>
              <View>
                <Text style={styles.statInfoVal}>{formatKZT(walletSummary.periodRevenue)}</Text>
                <Text style={styles.statInfoLabel}>Доход (мес)</Text>
              </View>
            </PressableScale>
            <View style={styles.statInfoCard}>
              <View style={[styles.statIconBox, { backgroundColor: '#EEF2FF' }]}>
                <Feather name="users" size={18} color="#4F46E5" />
              </View>
              <View>
                <Text style={styles.statInfoVal}>{students.length}</Text>
                <Text style={styles.statInfoLabel}>Учеников</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function MentorReviewState({
  displayName,
  specialization,
  status,
  rejectionReason,
  paddingX,
  onRefresh,
}: {
  displayName: string;
  specialization?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'missing';
  rejectionReason?: string | null;
  paddingX: number;
  onRefresh: () => void;
}) {
  const isRejected = status === 'rejected';
  const isMissing = status === 'missing';
  const accentColor = isRejected ? COLORS.destructive : COLORS.warning;
  const iconName = isRejected ? 'x-circle' : isMissing ? 'file-text' : 'clock';
  const title = isRejected
    ? 'Заявка отклонена'
    : isMissing
      ? 'Анкета ментора не найдена'
      : 'Заявка на рассмотрении';
  const body = isRejected
    ? 'Администратор проверил анкету и вернул ее с замечанием.'
    : isMissing
      ? 'Мы не нашли вашу анкету в базе. Если вы только что отправили форму, обновите статус через пару секунд.'
      : 'Ваш профиль уже отправлен администратору. После подтверждения здесь появятся заявки, ученики и настройки заказов.';

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 110 }}
      >
        <GradientScreenHeader
          title={`Добрый день, ${displayName}!`}
          subtitle={`Ментор${specialization ? ` • ${specialization}` : ''}`}
          paddingX={paddingX}
          variant="dashboard"
        >
          <View style={styles.reviewStatusPill}>
            <View style={[styles.reviewStatusDot, { backgroundColor: accentColor }]} />
            <Text style={styles.reviewStatusText}>
              {isRejected
                ? 'Нужны правки'
                : isMissing
                  ? 'Нет активной анкеты'
                  : 'Ожидает проверки'}
            </Text>
          </View>
        </GradientScreenHeader>

        <View style={[styles.reviewBody, { paddingHorizontal: paddingX }]}>
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 350 }}
            style={styles.reviewCard}
          >
            <View style={[styles.reviewIcon, { backgroundColor: `${accentColor}14` }]}>
              <Feather name={iconName} size={30} color={accentColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reviewTitle}>{title}</Text>
              <Text style={styles.reviewText}>{body}</Text>
              {isRejected && rejectionReason ? (
                <View style={styles.rejectionBox}>
                  <Text style={styles.rejectionLabel}>Комментарий администратора</Text>
                  <Text style={styles.rejectionText}>{rejectionReason}</Text>
                </View>
              ) : null}
              {!isRejected && !isMissing ? (
                <View style={styles.reviewTimeline}>
                  <View style={styles.timelineItem}>
                    <View style={[styles.timelineDot, { backgroundColor: COLORS.success }]} />
                    <Text style={styles.timelineText}>Анкета отправлена</Text>
                  </View>
                  <View style={styles.timelineItem}>
                    <View style={[styles.timelineDot, { backgroundColor: accentColor }]} />
                    <Text style={styles.timelineText}>Проверка администратором</Text>
                  </View>
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <Text style={styles.timelineText}>Доступ к кабинету</Text>
                  </View>
                </View>
              ) : null}
              <PressableScale onPress={onRefresh} style={styles.refreshButton} activeOpacity={0.8}>
                <Feather name="refresh-cw" size={16} color="white" />
                <Text style={styles.refreshButtonText}>Обновить статус</Text>
              </PressableScale>
            </View>
          </MotiView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#6C5CE7',
  },
  statusToggle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewStatusPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reviewStatusText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '800',
  },
  reviewBody: {
    flex: 1,
    marginTop: 24,
  },
  reviewCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 18,
    ...SHADOWS.sm,
  },
  reviewIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.foreground,
    marginBottom: 8,
  },
  reviewText: {
    color: COLORS.mutedForeground,
    fontSize: 14,
    lineHeight: 21,
  },
  rejectionBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  rejectionLabel: {
    color: COLORS.destructive,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  rejectionText: {
    color: COLORS.foreground,
    fontSize: 13,
    lineHeight: 19,
  },
  reviewTimeline: {
    gap: 10,
    marginTop: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
  },
  timelineText: {
    color: COLORS.mutedForeground,
    fontSize: 13,
    fontWeight: '600',
  },
  refreshButton: {
    alignSelf: 'flex-start',
    marginTop: 22,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...SHADOWS.sm,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '800',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTitle: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
  statusSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 2,
  },
  switch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 3,
  },
  switchActive: {
    backgroundColor: '#4ADE80',
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.foreground,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  viewAllBtn: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...SHADOWS.sm,
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    ...SHADOWS.sm,
  },
  emptyText: {
    color: COLORS.mutedForeground,
    fontSize: 13,
    fontWeight: '600',
  },
  taskTimeBox: {
    alignItems: 'center',
    minWidth: 40,
  },
  taskTimeHour: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  taskTimeMin: {
    fontSize: 11,
    color: COLORS.mutedForeground,
    marginTop: -2,
  },
  taskChild: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  taskSubject: {
    fontSize: 13,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusPaid: { backgroundColor: '#F0FDF4' },
  statusWait: { backgroundColor: '#FFFBEB' },
  statusText: { fontSize: 10, fontWeight: '700' },
  statusPaidText: { color: '#16A34A' },
  statusWaitText: { color: '#D97706' },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  reqIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reqName: { fontSize: 15, fontWeight: '700', color: COLORS.foreground },
  reqSub: { fontSize: 12, color: COLORS.mutedForeground, marginTop: 1 },
  actionBtnAccept: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  actionBtnReject: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  statsRow: { flexDirection: 'row', gap: 16 },
  statInfoCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...SHADOWS.sm,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfoVal: { fontSize: 16, fontWeight: '800', color: COLORS.foreground },
  statInfoLabel: { fontSize: 11, color: COLORS.mutedForeground },
});
