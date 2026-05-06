import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, LAYOUT, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '$constants/theme';
import { useMentorAttendance } from '$hooks/useMentorData';
import { useIsDesktop } from '$lib/useIsDesktop';

export default function MentorAttendance() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = isDesktop ? LAYOUT.dashboardHorizontalPaddingDesktop : SPACING.xl;
  const { records, loading } = useMentorAttendance();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: COLORS.primary }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: paddingX,
            paddingVertical: 16,
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: RADIUS.md,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Feather name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: TYPOGRAPHY.size.xl,
              fontWeight: TYPOGRAPHY.weight.bold,
              color: 'white',
            }}
          >
            График посещений
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: paddingX,
          paddingTop: 24,
          paddingBottom: 110,
        }}
      >
        <Text
          style={{
            fontSize: TYPOGRAPHY.size.lg,
            fontWeight: TYPOGRAPHY.weight.semibold,
            color: COLORS.foreground,
            marginBottom: 16,
          }}
        >
          Последние занятия
        </Text>

        {loading && (
          <Text
            style={{
              textAlign: 'center',
              marginTop: 20,
              color: COLORS.mutedForeground,
            }}
          >
            Загрузка...
          </Text>
        )}
        <View style={{ gap: 12 }}>
          {records.map((item) => (
            <View
              key={item.id}
              style={{
                ...SHADOWS.strict,
                backgroundColor: COLORS.surface,
                borderRadius: RADIUS.lg,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: RADIUS.full,
                  backgroundColor: item.present ? `${COLORS.success}15` : `${COLORS.destructive}15`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Feather
                  name={item.present ? 'check' : 'x'}
                  size={18}
                  color={item.present ? COLORS.success : COLORS.destructive}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.md,
                    fontWeight: TYPOGRAPHY.weight.semibold,
                    color: COLORS.foreground,
                  }}
                >
                  {item.name}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: COLORS.mutedForeground,
                    marginTop: 2,
                  }}
                >
                  {item.date}
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: RADIUS.sm,
                  backgroundColor: item.present ? `${COLORS.success}15` : `${COLORS.destructive}15`,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: TYPOGRAPHY.weight.bold,
                    color: item.present ? COLORS.success : COLORS.destructive,
                  }}
                >
                  {item.present ? 'Присутствовал' : 'Отсутствовал'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
