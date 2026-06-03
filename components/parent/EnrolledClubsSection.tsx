// EnrolledClubsSection: показывает записи ребенка на несколько кружков.
import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Text, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { COLORS, SHADOWS } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { type ParentEnrollment, useParentEnrollments } from '$hooks/useParentEnrollments';
import type { Child } from '$types/child';

const STATUS_CONFIG: Record<
  ParentEnrollment['status'],
  { label: string; color: string; background: string }
> = {
  awaiting_payment: { label: 'Ожидает оплаты', color: '#B45309', background: '#FEF3C7' },
  paid: { label: 'Оплачено', color: '#2563EB', background: '#DBEAFE' },
  activated: { label: 'Активно', color: '#059669', background: '#D1FAE5' },
  completed: { label: 'Завершено', color: '#6D28D9', background: '#EDE9FE' },
  rejected: { label: 'Отклонено', color: '#DC2626', background: '#FEE2E2' },
};

function scheduleText(value: string | null) {
  return value?.trim() || 'Расписание уточняется';
}

export function EnrolledClubsSection({ child }: { child: Child }) {
  const { user } = useAuth();
  const { enrollments, loading } = useParentEnrollments(user?.id, child);

  return (
    <View style={{ marginTop: 8 }}>
      <View className="flex-row items-center gap-2 mb-4 px-1">
        <Feather name="shopping-bag" size={20} color={COLORS.primary} />
        <Text className="text-lg font-black text-gray-900">Записан в кружки</Text>
      </View>

      {loading ? (
        <View style={SHADOWS.sm} className="bg-white rounded-[32px] p-8 border border-gray-100">
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : enrollments.length > 0 ? (
        <View style={{ gap: 12 }}>
          {enrollments.map((item) => {
            const status = STATUS_CONFIG[item.status];
            return (
              <PressableScale
                key={item.id}
                activeOpacity={0.85}
                style={SHADOWS.sm}
                className="bg-white rounded-[28px] p-4 border border-gray-100"
              >
                <View className="flex-row items-start gap-3">
                  <View
                    style={{ backgroundColor: `${COLORS.primary}12` }}
                    className="w-12 h-12 rounded-2xl items-center justify-center"
                  >
                    <Feather name="book-open" size={20} color={COLORS.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-black text-base" numberOfLines={2}>
                      {item.club || 'Кружок'}
                    </Text>
                    <Text className="text-gray-500 font-semibold text-xs mt-1" numberOfLines={2}>
                      {item.group_name || 'Группа'} · {scheduleText(item.group_schedule)}
                    </Text>
                    <View
                      style={{ backgroundColor: status.background }}
                      className="self-start mt-3 px-3 py-1 rounded-full"
                    >
                      <Text style={{ color: status.color }} className="text-[10px] font-black">
                        {status.label}
                      </Text>
                    </View>
                  </View>
                </View>
              </PressableScale>
            );
          })}
        </View>
      ) : (
        <View style={SHADOWS.sm} className="bg-white rounded-[32px] p-6 border border-gray-100">
          <Text className="text-sm font-semibold text-gray-500">
            Активные кружки появятся после записи ребенка на курс.
          </Text>
        </View>
      )}
    </View>
  );
}
