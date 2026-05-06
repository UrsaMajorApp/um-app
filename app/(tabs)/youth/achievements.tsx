import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '$constants/theme';
import { useYouthAchievements } from '$hooks/useStudentData';
import { featherIconName } from '$lib/icons';
import { getDashboardHorizontalPadding, useIsDesktop } from '$lib/useIsDesktop';

export default function YouthAchievements() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = useIsDesktop();
  const horizontalPadding = getDashboardHorizontalPadding(isDesktop, 20);

  const { achievements, loading } = useYouthAchievements();
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const progress = achievements.length ? (unlockedCount / achievements.length) * 100 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient
        colors={COLORS.gradients.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingBottom: 24,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <SafeAreaView edges={['top']}>
          <View style={{ paddingHorizontal: horizontalPadding, paddingTop: 12 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Pressable
                onPress={() => router.back()}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Feather name="arrow-left" size={20} color="white" />
              </Pressable>
              <Text style={{ fontSize: 20, fontWeight: '800', color: 'white' }}>Достижения</Text>
            </View>

            <View className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-white text-[10px] font-black uppercase">
                  ПРОГРЕСС КОЛЛЕКЦИИ
                </Text>
                <Text className="text-white text-xs font-black">
                  {unlockedCount} / {achievements.length}
                </Text>
              </View>
              <View className="h-2 bg-white/20 rounded-full overflow-hidden">
                <View style={{ width: `${progress}%` }} className="h-full bg-white rounded-full" />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 24,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-lg font-black text-gray-900 mb-6 px-1">Твои награды</Text>

        {loading && (
          <Text
            style={{
              textAlign: 'center',
              color: COLORS.mutedForeground,
              marginBottom: 16,
            }}
          >
            Загрузка...
          </Text>
        )}

        <View className="flex-row flex-wrap gap-4">
          {achievements.map((item) => (
            <View
              key={item.id}
              style={{ width: (width - horizontalPadding * 2 - 16) / 2 }}
              className={`p-6 rounded-[32px] items-center border ${item.unlocked ? 'bg-white border-gray-50' : 'bg-gray-50 border-gray-100 opacity-60'}`}
            >
              <LinearGradient
                colors={item.unlocked ? ['#EFF6FF', '#F5F3FF'] : ['#F3F4F6', '#E5E7EB']}
                className="w-20 h-20 rounded-3xl items-center justify-center mb-4"
              >
                <Feather
                  name={item.unlocked ? featherIconName(item.icon_name, 'award') : 'lock'}
                  size={32}
                  color={item.unlocked ? '#6C5CE7' : '#9CA3AF'}
                />
              </LinearGradient>

              <Text
                className={`font-black text-sm text-center ${item.unlocked ? 'text-gray-900' : 'text-gray-400'}`}
              >
                {item.name}
              </Text>

              {item.unlocked && (
                <View className="mt-2 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">
                  <Text className="text-[8px] font-black text-green-600 uppercase tracking-widest">
                    ОТКРЫТО
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {!loading && achievements.length === 0 && (
          <View className="mt-10 p-8 rounded-[40px] border-2 border-dashed border-gray-100 items-center">
            <Feather name="award" size={40} color="#E5E7EB" />
            <Text className="mt-4 text-gray-300 font-black text-center uppercase tracking-widest">
              ДОСТИЖЕНИЯ ПОЯВЯТСЯ ЗДЕСЬ
            </Text>
          </View>
        )}

        <View className="mt-10 p-8 rounded-[40px] border-2 border-dashed border-gray-100 items-center">
          <Feather name="plus-circle" size={40} color="#E5E7EB" />
          <Text className="mt-4 text-gray-300 font-black text-center uppercase tracking-widest">
            БУДУЩИЕ ДОСТИЖЕНИЯ
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
