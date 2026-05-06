import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { AdminHeader } from '$components/admin/AdminHeader';
import { formatAdminDate, useAdminLayout } from '$components/admin/adminUtils';
import { EmptyState } from '$components/admin/EmptyState';
import { SegmentTabs } from '$components/admin/SegmentTabs';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '$constants/theme';
import { useTickets } from '$hooks/useAdminData';
import type { AdminSupportTab } from '$types/admin';

export default function AdminSupportScreen() {
  const { paddingX } = useAdminLayout();
  const tickets = useTickets();
  const [tab, setTab] = useState<AdminSupportTab>('logs');
  const rows = tickets.data.filter((ticket) =>
    tab === 'tickets' ? ticket.kind === 'complaint' : ticket.kind === 'feedback',
  );

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader title="Поддержка" subtitle="Жалобы, отзывы и контроль качества" />
      <SegmentTabs
        value={tab}
        onChange={setTab}
        tabs={[
          { key: 'logs', label: 'Лог фидбеков' },
          { key: 'tickets', label: 'Тикеты и жалобы' },
        ]}
      />
      <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
        {tickets.loading ? (
          <Text style={{ padding: SPACING.lg, color: COLORS.mutedForeground }}>Загрузка...</Text>
        ) : null}
        {!tickets.loading && rows.length === 0 ? <EmptyState title="Записей нет" /> : null}
        {rows.map((ticket) => {
          const kindLabel = ticket.kind === 'complaint' ? 'Жалоба' : 'Отзыв';
          const statusLabel =
            ticket.status === 'open'
              ? 'Открыт'
              : ticket.status === 'in_progress'
                ? 'В работе'
                : 'Решен';
          const statusBg =
            ticket.status === 'open'
              ? '#FEF9C3'
              : ticket.status === 'in_progress'
                ? `${COLORS.primary}20`
                : `${COLORS.success}20`;
          const statusColor =
            ticket.status === 'open'
              ? '#854D0E'
              : ticket.status === 'in_progress'
                ? COLORS.primary
                : COLORS.success;
          return (
            <View
              key={ticket.id}
              style={{
                padding: SPACING.lg,
                borderRadius: RADIUS.lg,
                marginHorizontal: paddingX,
                marginBottom: SPACING.md,
                backgroundColor: COLORS.surface,
                borderWidth: 1,
                borderColor:
                  ticket.kind === 'complaint' ? `${COLORS.destructive}30` : COLORS.border,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: SPACING.sm,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    gap: SPACING.sm,
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      backgroundColor:
                        ticket.kind === 'complaint'
                          ? `${COLORS.destructive}15`
                          : `${COLORS.primary}15`,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: RADIUS.sm,
                    }}
                  >
                    <Text
                      style={{
                        color: ticket.kind === 'complaint' ? COLORS.destructive : COLORS.primary,
                        fontSize: 10,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}
                    >
                      {kindLabel}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.xs,
                      color: COLORS.mutedForeground,
                    }}
                  >
                    {formatAdminDate(ticket.created_at)}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: statusBg,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: RADIUS.full,
                  }}
                >
                  <Text
                    style={{
                      color: statusColor,
                      fontSize: 10,
                      fontWeight: 'bold',
                    }}
                  >
                    {statusLabel}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  fontSize: TYPOGRAPHY.size.md,
                  fontWeight: 'bold',
                  color: COLORS.foreground,
                  marginBottom: 4,
                }}
              >
                От: {ticket.reporter_name}
              </Text>
              {ticket.target ? (
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.xs,
                    color: COLORS.mutedForeground,
                    marginBottom: SPACING.md,
                  }}
                >
                  Цель: {ticket.target}
                </Text>
              ) : null}
              <Text
                style={{
                  fontSize: TYPOGRAPHY.size.sm,
                  color: COLORS.foreground,
                  lineHeight: 20,
                }}
              >
                {ticket.body}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  gap: SPACING.sm,
                  marginTop: SPACING.md,
                }}
              >
                {ticket.status === 'open' ? (
                  <TouchableOpacity
                    onPress={() => tickets.takeInProgress(ticket.id)}
                    style={{
                      paddingVertical: SPACING.sm,
                      paddingHorizontal: SPACING.md,
                      backgroundColor: COLORS.primary,
                      borderRadius: RADIUS.md,
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.white,
                        fontWeight: 'bold',
                        fontSize: TYPOGRAPHY.size.sm,
                      }}
                    >
                      Взять в работу
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {ticket.status !== 'resolved' ? (
                  <TouchableOpacity
                    onPress={() => tickets.resolve(ticket.id)}
                    style={{
                      paddingVertical: SPACING.sm,
                      paddingHorizontal: SPACING.md,
                      backgroundColor: COLORS.success,
                      borderRadius: RADIUS.md,
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.white,
                        fontWeight: 'bold',
                        fontSize: TYPOGRAPHY.size.sm,
                      }}
                    >
                      Отметить решенным
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
