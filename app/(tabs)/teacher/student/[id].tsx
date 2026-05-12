// Карточка ученика преподавателя: открывает данные ученика по id из списка группы.
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, RADIUS, TYPOGRAPHY } from '$constants/theme';

export default function TeacherStudentDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 60,
          paddingHorizontal: 24,
          paddingBottom: 16,
          backgroundColor: COLORS.card,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Feather name="arrow-left" size={20} color={COLORS.mutedForeground} />
          <Text
            style={{
              marginLeft: 8,
              fontSize: 16,
              color: COLORS.mutedForeground,
            }}
          >
            Назад
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: COLORS.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>И</Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.xl,
                fontWeight: TYPOGRAPHY.weight.bold,
                color: COLORS.foreground,
              }}
            >
              Ученик #{id}
            </Text>
            <Text style={{ color: COLORS.mutedForeground }}>Оценка прогресса</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View
          style={{
            backgroundColor: COLORS.card,
            padding: 20,
            borderRadius: RADIUS.lg,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          <Text style={{ fontSize: 16, color: COLORS.foreground }}>
            Здесь можно просмотреть историю оценок и фидбэка для ученика.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
