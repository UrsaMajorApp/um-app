// ParentMentorSection: показывает выбранного ментора и дает родителю выбрать другого.
import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { COLORS, SHADOWS } from '$constants/theme';
import { type PublicMentor, usePublicMentors } from '$hooks/usePublicMentors';
import type { Child } from '$types/child';

type ParentMentorSectionProps = {
  child: Child;
  onSelectMentor: (mentorId: string) => Promise<void>;
};

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

export function ParentMentorSection({ child, onSelectMentor }: ParentMentorSectionProps) {
  const { mentors, loading } = usePublicMentors();
  const [savingMentorId, setSavingMentorId] = useState<string | null>(null);
  const selectedMentor = useMemo(
    () => mentors.find((mentor) => mentor.id === child.mentorApplicationId) ?? null,
    [child.mentorApplicationId, mentors],
  );

  const chooseMentor = async (mentorId: string) => {
    if (savingMentorId || mentorId === child.mentorApplicationId) return;

    setSavingMentorId(mentorId);
    try {
      await onSelectMentor(mentorId);
    } finally {
      setSavingMentorId(null);
    }
  };

  return (
    <View style={{ marginTop: 32 }}>
      <View className="flex-row items-center gap-2 mb-4 px-1">
        <Feather name="user-check" size={20} color="#10B981" />
        <Text className="text-lg font-black text-gray-900">Персональный ментор</Text>
      </View>

      {selectedMentor ? (
        <View style={SHADOWS.sm} className="bg-white rounded-[32px] p-4 border border-gray-100">
          <View className="flex-row gap-4">
            <View className="w-20 h-20 rounded-[24px] overflow-hidden bg-green-50 items-center justify-center">
              {selectedMentor.photo_url ? (
                <Image
                  source={{ uri: selectedMentor.photo_url }}
                  resizeMode="cover"
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <Text className="text-2xl font-black text-green-700">
                  {mentorInitials(selectedMentor.name)}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="text-gray-900 font-black text-base flex-1" numberOfLines={1}>
                  {selectedMentor.name}
                </Text>
                <View className="flex-row items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
                  <Feather name="star" size={11} color="#F59E0B" />
                  <Text className="text-amber-700 font-black text-[10px]">
                    {Number(selectedMentor.rating || 0).toFixed(1)}
                  </Text>
                </View>
              </View>
              <Text className="text-gray-500 font-semibold text-xs" numberOfLines={2}>
                {mentorSubtitle(selectedMentor) || 'Наставник развития'}
              </Text>
              {selectedMentor.bio ? (
                <Text className="text-gray-600 text-xs leading-5 mt-3" numberOfLines={3}>
                  {selectedMentor.bio}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      ) : (
        <View style={SHADOWS.sm} className="bg-white rounded-[32px] p-5 border border-gray-100">
          <Text className="text-sm font-semibold text-gray-500">
            Выберите ментора для сопровождения {child.name}.
          </Text>
        </View>
      )}

      <View className="mt-5">
        <Text className="text-gray-900 font-black text-sm mb-3 px-1">Выбрать ментора</Text>
        {loading ? (
          <View className="bg-gray-50 rounded-[24px] p-8 items-center border border-gray-100">
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : mentors.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 4 }}
          >
            {mentors.map((mentor) => {
              const selected = mentor.id === child.mentorApplicationId;
              const saving = savingMentorId === mentor.id;
              return (
                <PressableScale
                  key={mentor.id}
                  onPress={() => chooseMentor(mentor.id)}
                  disabled={saving}
                  style={[
                    SHADOWS.sm,
                    {
                      width: 180,
                      backgroundColor: 'white',
                      borderRadius: 24,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: selected ? '#10B981' : '#F3F4F6',
                    },
                  ]}
                >
                  <View className="w-full h-24 rounded-[20px] overflow-hidden bg-gray-100 items-center justify-center mb-3">
                    {mentor.photo_url ? (
                      <Image
                        source={{ uri: mentor.photo_url }}
                        resizeMode="cover"
                        style={{ width: '100%', height: '100%' }}
                      />
                    ) : (
                      <Text className="text-2xl font-black text-gray-500">
                        {mentorInitials(mentor.name)}
                      </Text>
                    )}
                    {selected && (
                      <View className="absolute top-2 right-2 bg-green-500 w-7 h-7 rounded-full items-center justify-center">
                        <Feather name="check" size={14} color="white" />
                      </View>
                    )}
                  </View>
                  <Text className="text-gray-900 font-black text-sm" numberOfLines={1}>
                    {mentor.name}
                  </Text>
                  <Text className="text-gray-500 font-semibold text-[11px] mt-1" numberOfLines={2}>
                    {mentor.specialization || 'Наставник'}
                  </Text>
                  <View className="flex-row items-center justify-between mt-3">
                    <View className="flex-row items-center gap-1">
                      <Feather name="star" size={12} color="#F59E0B" />
                      <Text className="text-gray-700 font-black text-xs">
                        {Number(mentor.rating || 0).toFixed(1)}
                      </Text>
                    </View>
                    <Text className="text-primary font-black text-[10px]">
                      {saving ? '...' : selected ? 'Выбран' : 'Выбрать'}
                    </Text>
                  </View>
                </PressableScale>
              );
            })}
          </ScrollView>
        ) : (
          <View className="bg-gray-50 rounded-[24px] p-6 border border-gray-100">
            <Text className="text-gray-400 font-bold text-center">
              Одобренные менторы появятся после модерации.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
