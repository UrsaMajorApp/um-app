import { AdminHeader } from '$components/admin/AdminHeader';
import { EmptyState } from '$components/admin/EmptyState';
import { SegmentTabs } from '$components/admin/SegmentTabs';
import { formatAdminDate, useAdminLayout } from '$components/admin/adminUtils';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '$constants/theme';
import { useAdminStats, useFamilies, useOrganizations, useTransactions } from '$hooks/useAdminData';
import { formatKZT } from '$lib/formatCurrency';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type BillingTab = 'transactions' | 'fees';

export default function AdminBillingScreen() {
  const { isTablet, paddingX } = useAdminLayout();
  const families = useFamilies();
  const txs = useTransactions();
  const orgs = useOrganizations();
  const stats = useAdminStats([], txs.data, families.data);
  const [tab, setTab] = useState<BillingTab>('transactions');
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  return (
    <View style={{ flex: 1 }}>
      <AdminHeader title="Биллинг" subtitle="Транзакции, комиссии и доход платформы" />
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
            flexDirection: isTablet ? 'row' : 'column',
            gap: SPACING.md,
            paddingBottom: SPACING.lg,
          }}
        >
          {[
            {
              label: 'Общий оборот',
              value: formatKZT(stats.gmv),
              color: COLORS.primary,
            },
            {
              label: 'Доход платформы',
              value: formatKZT(stats.revenue),
              color: COLORS.success,
            },
            {
              label: 'Платные подписчики',
              value: `${stats.proSubscribers} / ${stats.totalSubscribers}`,
              color: COLORS.foreground,
            },
          ].map((card) => (
            <View
              key={card.label}
              style={{
                flex: 1,
                padding: SPACING.lg,
                borderRadius: RADIUS.lg,
                backgroundColor: `${card.color}10`,
                borderWidth: 1,
                borderColor: `${card.color}30`,
              }}
            >
              <Text
                style={{
                  fontSize: TYPOGRAPHY.size.sm,
                  color: COLORS.mutedForeground,
                }}
              >
                {card.label}
              </Text>
              <Text
                style={{
                  fontSize: TYPOGRAPHY.size.xxl,
                  fontWeight: 'bold',
                  color: card.color,
                  marginTop: 8,
                }}
              >
                {card.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <SegmentTabs
        value={tab}
        onChange={setTab}
        tabs={[
          { key: 'transactions', label: 'Сплит-транзакции' },
          { key: 'fees', label: 'Управление комиссией' },
        ]}
      />
      <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
        {tab === 'transactions' && txs.loading ? (
          <Text style={{ padding: SPACING.lg, color: COLORS.mutedForeground }}>Загрузка...</Text>
        ) : null}
        {tab === 'transactions' && !txs.loading && txs.data.length === 0 ? (
          <EmptyState title="Транзакций нет" />
        ) : null}
        {tab === 'transactions' &&
          txs.data.map((tx) => (
            <View
              key={tx.id}
              style={{
                padding: SPACING.lg,
                borderBottomWidth: 1,
                borderColor: COLORS.border,
                backgroundColor: COLORS.surface,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: RADIUS.full,
                  backgroundColor: `${COLORS.success}15`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Feather name="arrow-up-right" size={24} color={COLORS.success} />
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.md,
                    fontWeight: 'bold',
                    color: COLORS.foreground,
                  }}
                >
                  {tx.parent_name} {'->'} {tx.org_name}
                </Text>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.xs,
                    color: COLORS.mutedForeground,
                    marginTop: 2,
                  }}
                >
                  {formatAdminDate(tx.created_at)} {tx.external_ref ? `• ${tx.external_ref}` : ''}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.md,
                    fontWeight: 'bold',
                    color: COLORS.foreground,
                  }}
                >
                  {formatKZT(tx.amount)}
                </Text>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.xs,
                    color: COLORS.mutedForeground,
                    marginTop: 2,
                  }}
                >
                  +{formatKZT(tx.org_amount)} партнеру | +{formatKZT(tx.platform_amount)} платформе
                </Text>
              </View>
            </View>
          ))}
        {tab === 'fees' &&
          orgs.data.map((org) => (
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
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.md,
                    fontWeight: 'bold',
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
                  Категория: {org.category ?? '—'}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: SPACING.sm,
                }}
              >
                <TextInput
                  value={drafts[org.id] ?? String(org.commission_pct)}
                  keyboardType="numeric"
                  onChangeText={(v) => setDrafts((prev) => ({ ...prev, [org.id]: v }))}
                  style={{
                    width: 64,
                    textAlign: 'center',
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: RADIUS.md,
                    padding: SPACING.sm,
                    color: COLORS.primary,
                    fontWeight: 'bold',
                  }}
                />
                <Text style={{ fontWeight: 'bold' }}>%</Text>
                <TouchableOpacity
                  onPress={() => {
                    const val = parseFloat(drafts[org.id] ?? String(org.commission_pct));
                    if (Number.isFinite(val)) orgs.setCommission(org.id, val);
                  }}
                  style={{
                    paddingHorizontal: SPACING.md,
                    paddingVertical: SPACING.sm,
                    backgroundColor: COLORS.primary,
                    borderRadius: RADIUS.md,
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.white,
                      fontWeight: 'bold',
                      fontSize: TYPOGRAPHY.size.xs,
                    }}
                  >
                    Сохранить
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
      </ScrollView>
    </View>
  );
}
