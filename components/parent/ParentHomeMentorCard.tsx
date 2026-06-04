// ParentHomeMentorCard: показывает ментора на главной родителя и отправляет заявку на встречу.
import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { COLORS, SHADOWS } from '$constants/theme';
import { useParentMentorRequests, requestParentMentor } from '$hooks/useParentMentorRequests';
import { type PublicMentor, usePublicMentors } from '$hooks/usePublicMentors';
import type { Child } from '$types/child';

type ParentHomeMentorCardProps = {
  child: Child;
  userId?: string;
  onOpenMentors?: () => void;
};

const REQUEST_LABELS = {
  pending: 'Заявка отправлена',
  confirmed: 'Встреча подтверждена',
  rejected: 'Отклонено',
  cancelled: 'Отменено',
} as const;

function mentorInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
}

function mentorSubtitle(mentor: PublicMentor) {
  return [mentor.specialization, mentor.experience].filter(Boolean).join(' · ');
}

export function ParentHomeMentorCard({ child, userId, onOpenMentors }: ParentHomeMentorCardProps) {
  const { mentors, loading: mentorsLoading } = usePublicMentors();
  const { requests, loading: requestsLoading, refresh } = useParentMentorRequests(userId, child);
  const [requesting, setRequesting] = useState(false);

  const mentor = useMemo(
    () =>
      mentors.find((item) => item.id === child.mentorApplicationId) ??
      mentors.find((item) => Number(item.rating || 0) >= 4.8) ??
      mentors[0] ??
      null,
    [child.mentorApplicationId, mentors],
  );

  const activeRequest = useMemo(
    () => requests.find((item) => item.mentor_application_id === mentor?.id) ?? null,
    [mentor?.id, requests],
  );

  if (mentorsLoading || requestsLoading) {
    return (
      <View style={SHADOWS.sm} className="bg-white rounded-[32px] p-8 border border-gray-100">
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  if (!mentor) {
    return (
      <View style={SHADOWS.sm} className="bg-white rounded-[32px] p-6 border border-gray-100">
        <Text className="text-gray-900 text-base font-black mb-1">Персональный ментор</Text>
        <Text className="text-gray-500 text-sm font-semibold">
          Одобренные менторы появятся после модерации.
        </Text>
      </View>
    );
  }

  const selected = mentor.id === child.mentorApplicationId;
  const requestLabel = activeRequest ? REQUEST_LABELS[activeRequest.status] : null;
  const canRequest = Boolean(userId) && !activeRequest && !requesting;
  const subtitle = selected
    ? `Выбран для ${child.name}`
    : `Рекомендован после диагностики ${child.name}`;

  const submitRequest = async () => {
    if (!userId || !mentor || requesting || activeRequest) return;

    setRequesting(true);
    const { error } = await requestParentMentor({
      userId,
      child,
      mentorApplicationId: mentor.id,
    });
    setRequesting(false);

    if (error) {
      Alert.alert('Не удалось отправить заявку', error);
      return;
    }

    await refresh();
  };

  return (
    <View style={SHADOWS.md} className="bg-white rounded-[32px] p-5 border border-gray-100">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-gray-900 text-lg font-black">Персональный ментор</Text>
          <Text className="text-gray-400 text-xs font-bold mt-1">{subtitle}</Text>
        </View>
        <View className="w-10 h-10 rounded-2xl bg-green-50 items-center justify-center">
          <Feather name="user-check" size={18} color="#10B981" />
        </View>
      </View>

      <View className="flex-row gap-4">
        <View className="w-20 h-20 rounded-[24px] overflow-hidden bg-green-50 items-center justify-center">
          {mentor.photo_url ? (
            <Image
              source={{ uri: mentor.photo_url }}
              resizeMode="cover"
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <Text className="text-2xl font-black text-green-700">
              {mentorInitials(mentor.name)}
            </Text>
          )}
        </View>

        <View className="flex-1">
          <View className="flex-row items-start gap-2">
            <View className="flex-1">
              <Text className="text-gray-900 font-black text-base" numberOfLines={1}>
                {mentor.name}
              </Text>
              <Text className="text-gray-500 font-semibold text-xs mt-1" numberOfLines={2}>
                {mentorSubtitle(mentor) || 'Наставник развития'}
              </Text>
            </View>
            <View className="flex-row items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
              <Feather name="star" size={11} color="#F59E0B" />
              <Text className="text-amber-700 font-black text-[10px]">
                {Number(mentor.rating || 0).toFixed(1)}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2 mt-4">
            <PressableScale
              onPress={submitRequest}
              disabled={!canRequest}
              style={{
                flex: 1,
                height: 42,
                borderRadius: 16,
                backgroundColor: activeRequest ? '#D1FAE5' : COLORS.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{ color: activeRequest ? '#047857' : 'white' }}
                className="text-xs font-black"
              >
                {requesting ? 'Отправляем...' : requestLabel || 'Записаться'}
              </Text>
            </PressableScale>
            {onOpenMentors ? (
              <PressableScale
                onPress={onOpenMentors}
                className="h-[42px] px-4 rounded-2xl bg-gray-50 border border-gray-100 items-center justify-center"
              >
                <Feather name="users" size={16} color={COLORS.primary} />
              </PressableScale>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}
