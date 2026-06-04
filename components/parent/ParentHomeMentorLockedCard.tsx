// ParentHomeMentorLockedCard: объясняет, что ментор появится после AI-диагностики.
import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { COLORS, SHADOWS } from '$constants/theme';
import type { Child } from '$types/child';

type ParentHomeMentorLockedCardProps = {
  child: Child;
  onStartTest: () => void;
};

export function ParentHomeMentorLockedCard({
  child,
  onStartTest,
}: ParentHomeMentorLockedCardProps) {
  return (
    <View style={SHADOWS.sm} className="bg-white rounded-[32px] p-5 border border-gray-100">
      <View className="flex-row items-center gap-4">
        <View className="w-14 h-14 rounded-2xl bg-blue-50 items-center justify-center">
          <Feather name="lock" size={20} color="#3B82F6" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 text-lg font-black">Персональный ментор</Text>
          <Text className="text-gray-500 text-xs font-semibold mt-1 leading-4">
            Сначала пройдите AI-диагностику для {child.name}. После теста покажем подходящих
            менторов и откроем запись.
          </Text>
          <PressableScale
            onPress={onStartTest}
            className="mt-3 self-start bg-blue-600 px-4 py-2 rounded-2xl"
          >
            <Text className="text-white font-black text-[10px] uppercase tracking-widest">
              Пройти тест
            </Text>
          </PressableScale>
        </View>
        <View className="w-10 h-10 rounded-2xl bg-gray-50 items-center justify-center">
          <Feather name="user-check" size={18} color={COLORS.mutedForeground} />
        </View>
      </View>
    </View>
  );
}
